import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import {
  createRoom,
  getRoom,
  addUserToRoom,
  removeUserBySocket,
  addMessage,
} from './rooms.js';
import { analyzeForIntervention } from './mediator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '../../client/dist');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/rooms', (req, res) => {
  const roomId = createRoom();
  res.json({ roomId });
});

app.get('/api/rooms/:id', (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ roomId: room.id, userCount: room.users.length });
});

// When the client has been built (production deploys), serve it from the
// same service so the app is reachable from a single URL/port.
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, name }, callback) => {
    const room = addUserToRoom(roomId, socket.id, name);
    if (!room) {
      callback?.({ ok: false, error: 'Room not found' });
      return;
    }
    socket.join(roomId);
    callback?.({ ok: true, messages: room.messages });
    socket.to(roomId).emit('system-message', { text: `${name} 加入了對話` });
  });

  socket.on('send-message', async ({ roomId, name, text }) => {
    if (!roomId || !name || !text?.trim()) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender: name,
      text: text.trim(),
      role: 'user',
      ts: Date.now(),
    };
    const room = addMessage(roomId, message);
    if (!room) return;
    io.to(roomId).emit('new-message', message);

    const recent = room.messages.slice(-10);
    const result = await analyzeForIntervention(recent);
    if (result?.intervene && result.message) {
      const mediatorMessage = {
        id: `${Date.now()}-ai-${Math.random().toString(36).slice(2)}`,
        sender: 'AI 調解員',
        text: result.message,
        role: 'mediator',
        type: result.type ?? null,
        ts: Date.now(),
      };
      addMessage(roomId, mediatorMessage);
      io.to(roomId).emit('new-message', mediatorMessage);
    }
  });

  socket.on('disconnect', () => {
    removeUserBySocket(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Calm Talk server running on port ${PORT}`);
});
