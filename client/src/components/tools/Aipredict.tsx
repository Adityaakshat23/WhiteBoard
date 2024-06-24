'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useWindowSize from '@/hooks/useWindowSize'

export default function AipredictButton() {

    const { windowSize } = useWindowSize();

    const canvasRef = React.useRef<HTMLCanvasElement>();

    React.useEffect(() => {
        const canvasElement = document.getElementById('canvas') as HTMLCanvasElement
        canvasRef.current = canvasElement
    }, [windowSize])

    async function handleScreenShot() {

        if (!canvasRef.current) return;
       canvasRef.current.toBlob(async (blob)=>{
        if (!blob) {
            console.error('Failed to create blob from canvas');
            return;
        }
        const formData = new FormData();
        formData.append('file', blob, 'playboard.png');
        const response = await fetch('/apipath', {
            method: 'POST',
            body: formData
        });
       })
        
    };

    return (
        <Button variant="outline" size="icon" onClick={handleScreenShot}>
            <Sparkles className="h-4 w-4" />
        </Button>
    );
}
