const { Server } = require('socket.io');

let io;

function initializeSockets(httpServer) {
  const origins = ['http://localhost:5173', 'http://localhost:3000'];
  if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(',').forEach((o) => {
      const trimmed = o.trim();
      if (trimmed && !origins.includes(trimmed)) origins.push(trimmed);
    });
  }

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origins.includes(origin) || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    socket.emit('socket:ready', { connectedAt: new Date().toISOString() });
    socket.on('dashboard:subscribe', () => socket.join('dashboard'));
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO has not been initialized');
  return io;
}

module.exports = { getIO, initializeSockets };
