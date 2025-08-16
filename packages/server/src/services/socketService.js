const { Server } = require('socket.io');
const { log } = require('../middleware/logging');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3002",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    log('info', 'Visual editor client connected', { socketId: socket.id });
    console.log('🔌 [FileWatcher] Client connected:', socket.id);

    socket.on('disconnect', () => {
      log('info', 'Visual editor client disconnected', { socketId: socket.id });
      console.log('🔌 [FileWatcher] Client disconnected:', socket.id);
    });

    // Handle file watching requests
    socket.on('file:watch:start', (data, callback) => {
      console.log('🔌 [FileWatcher] Start watching request:', data);
      // For now, just acknowledge - file watching is handled by the session system
      callback({ success: true, message: 'File watching handled by session system' });
    });

    socket.on('file:watch:stop', (data, callback) => {
      console.log('🔌 [FileWatcher] Stop watching request:', data);
      // For now, just acknowledge
      callback({ success: true, message: 'File watching stopped' });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};
