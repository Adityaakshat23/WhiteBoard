'use client'

import React from "react"
import useDraw from "@/hooks/useDraw"
import useWindowSize from "@/hooks/useWindowSize"
import { getRoomId, useCanvasStore } from "@/lib/store/canvas.store"
import { drawLine } from "@/lib/utils"
import axios from 'axios'
import { useRouter } from "next/navigation"
import { io } from 'socket.io-client'

const productionServer = process.env.NEXT_PUBLIC_HOSTED_SERVER;
const hostServer = productionServer != undefined ? [productionServer] : ['http://localhost:3001'];

const socket = io(`${hostServer}`)

export default function DrawingBoard({ roomId }: { roomId?: string }) {

    const { windowSize } = useWindowSize()
    const router = useRouter()

    const setRoomId = getRoomId((state) => state.setRoomId);

    const color = useCanvasStore((state) => state.strokeColor);
    const newlineWidth = useCanvasStore((state) => state.lineWidth);

    const { canvasRef, onInteractStart } = useDraw(onDraw);

    function onDraw({ prevPoint, currentPoint, ctx }: Draw) {
        const drawOptions = {
            prevPoint,
            currentPoint,
            ctx,
            color,
            newlineWidth
        }
        drawLine(drawOptions)

        if (roomId) {
            const roomDrawLineOptions = {
                prevPoint: prevPoint,
                currentPoint: currentPoint,
                color: color,
                newlineWidth: newlineWidth,
            };

            socket.emit('start-draw', { roomDrawLineOptions, roomId });

            document.addEventListener('mousemove', (event) => {
                const { clientX, clientY } = event;
                socket.emit('mousemove', { x: clientX, y: clientY });
            });
        }

    }

    React.useEffect(() => {
        if (!roomId) return;

        async function checkRoomId({ roomId }: { roomId: string }) {
            try {
                const response = await axios.post(`${hostServer}/check-room`, { roomId });
                const isActive = response.data.active;

                if (!isActive) {
                    router.replace('/')
                }
            } catch (error: any) {
                console.error(error);
            }
        }
        checkRoomId({ roomId });
    }, [roomId]);

    const handleInteractStart = () => {
        const canvasElement = canvasRef.current
        if (!canvasElement) return
        onInteractStart()
    }

    React.useEffect(() => {
        if (!roomId) return;
        const canvasElement = canvasRef.current;
        const ctx = canvasElement?.getContext('2d');

        setRoomId(roomId);

        socket.emit('join-room', roomId);

        socket.on('get-canvas-state', () => {
            const canvasState = canvasRef.current?.toDataURL()
            if (!canvasState) return
            socket.emit('send-canvas-state', {
                state: canvasState,
                roomId,
            })
        })

        socket.on('canvas-state-from-server', (state: string) => {
            if (!ctx || !canvasElement) {
                console.log("ctx or canvasElement not found for canvas state");
                return;
            }

            const img = new Image();
            img.src = state;
            img.onload = () => {
                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                ctx.drawImage(img, 0, 0);
            };
        });

        socket.on('get-draw-data', (roomDrawLineOptions: DrawLineOptionsProps) => {
            if (!ctx) {
                console.log("ctx not available");
                return;
            }

            const drawOptions = {
                prevPoint: roomDrawLineOptions.prevPoint,
                currentPoint: roomDrawLineOptions.currentPoint,
                ctx: ctx,
                color: roomDrawLineOptions.color,
                newlineWidth: roomDrawLineOptions.newlineWidth
            }
            drawLine(drawOptions)
        })

        socket.on('cursor-pointer', (data) => {
            const { id, x, y, color } = data;
            let cursorElement = document.getElementById(id);
    
            if (!cursorElement) {
                cursorElement = document.createElement('div');
                cursorElement.id = id;
                cursorElement.style.position = 'absolute';
                cursorElement.style.width = '20px';
                cursorElement.style.height = '20px';
                cursorElement.style.backgroundColor = 'transparent';
                cursorElement.style.border = `2px solid ${color}`;
                cursorElement.style.borderRadius = '50%';
                cursorElement.style.pointerEvents = 'none';
                cursorElement.style.transform = 'translate(-50%, -50%)';
                cursorElement.style.mixBlendMode = 'difference';
                document.body.appendChild(cursorElement);
            }
    
            cursorElement.style.left = x + 'px';
            cursorElement.style.top = y + 'px';
        });

        return () => {
            socket.off('get-draw-data');
            socket.off('get-canvas-state');
            socket.off('canvas-state-from-server');
            socket.off('cursor-pointer')
        };
    }, [canvasRef, windowSize, roomId])

    if (windowSize.height && windowSize.width !== undefined) {
        return (
            <canvas
                id="canvas"
                width={windowSize.width}
                height={windowSize.height}
                ref={canvasRef}
                onMouseDown={handleInteractStart}
                onTouchStart={handleInteractStart}
                className="cursor-pointer"
            />
        )
    }
    return null;
}
