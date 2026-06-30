import { nanoid } from 'nanoid';

const rooms = new Map();

export function createRoom() {
  const id = nanoid(8);
  rooms.set(id, { id, users: [], messages: [], createdAt: Date.now() });
  return id;
}

export function getRoom(id) {
  return rooms.get(id);
}

export function addUserToRoom(roomId, socketId, name) {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (!room.users.find((u) => u.socketId === socketId)) {
    room.users.push({ socketId, name });
  }
  return room;
}

export function removeUserBySocket(socketId) {
  for (const room of rooms.values()) {
    room.users = room.users.filter((u) => u.socketId !== socketId);
  }
}

export function addMessage(roomId, message) {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.messages.push(message);
  if (room.messages.length > 200) room.messages.shift();
  return room;
}
