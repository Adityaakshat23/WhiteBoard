import express, { Express, Request, Response } from 'express';
import http from 'http'
const app: Express = express()
const server = http.createServer(app)
import cors from 'cors'
import { Server } from 'socket.io'
import type { DrawLineOptionsProps } from '@/types'
import { activeRooms, addActiveRoom, removeExpiredRooms } from './data/activeRoomIds';

app.use(express.json());

const options: cors.CorsOptions = {
    origin: ['http://localhost:3000', 'https://multi-user-canvas.vercel.app']
};

app.use(cors(options));

const io = new Server(server, {
    cors: {
        origin: '*',
    },
})

io.on('connection', (socket) => {

    socket.on('mousemove', (data: { x: number, y: number }) => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        socket.broadcast.emit('cursor-pointer', { id: socket.id, x: data.x, y: data.y, color: randomColor });
    });

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('get-canvas-state')
    });

    socket.on('send-canvas-state', ({ state, roomId }) => {
        socket.to(roomId).emit('canvas-state-from-server', state)
    })

    socket.on('start-draw', ({ roomDrawLineOptions, roomId }: { roomDrawLineOptions: DrawLineOptionsProps, roomId: string }) => {

        const { prevPoint, currentPoint, color, newlineWidth } = roomDrawLineOptions
        socket.to(roomId).emit('get-draw-data', { prevPoint, currentPoint, color, newlineWidth })

    })

    socket.on('calling-clear-canvas', ({ roomId }: { roomId: string }) => {
        socket.to(roomId).emit('clear-canvas')
    })

})


app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});


app.post('/add-room/', (req, res) => {
    try {
        const roomId = req.body.roomId;
        if (!roomId) {
            return res.status(403).json({ error: 'Missing field' });
        }
        const expiry = (Date.now() + 10 * 60 * 1000);
        addActiveRoom(roomId, expiry);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/check-room', (req, res) => {
    try {
        const roomId = req.body.roomId;
        if (!roomId) {
            return res.status(403).json({ error: 'Missing field' });
        }
        const currentTime = Date.now();

        removeExpiredRooms();

        const isActive = activeRooms.some(activeRoom => activeRoom.roomId === roomId && activeRoom.expiry >= currentTime);

        if (isActive) {
            res.json({ active: true });
        } else {
            res.json({ active: false });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

server.listen(3001, () => {
    console.log('✔️ Server listening on port 3001')
})
/*export async function POST() {
    const res = await fetch('https://data.mongodb-api.com/...', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': process.env.DATA_API_KEY!,
      },
      body: JSON.stringify({ time: new Date().toISOString() }),
    })
   
    const data = await res.json()
   
    return Response.json(data)
  }*/