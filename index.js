const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('join-room', (roomCode) => {
    socket.join(roomCode);
    if (!rooms[roomCode]) rooms[roomCode] = [];
    rooms[roomCode].push(socket.id);
    socket.to(roomCode).emit('user-joined', socket.id);
    socket.emit('all-users', rooms[roomCode].filter(id => id !== socket.id));
  });

  socket.on('offer', ({ offer, to }) => io.to(to).emit('offer', { offer, from: socket.id }));
  socket.on('answer', ({ answer, to }) => io.to(to).emit('answer', { answer, from: socket.id }));
  socket.on('candidate', ({ candidate, to }) => io.to(to).emit('candidate', { candidate, from: socket.id }));

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
    // Clean rooms optional
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
