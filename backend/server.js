// server.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeSockets } = require('./sockets/socketManager');
const { bootstrapAdmin } = require('./controllers/authController');

const authRoutes    = require('./routes/auth');
const telemetryRoutes = require('./routes/telemetry');
const alertRoutes   = require('./routes/alerts');

const app  = express();
const PORT = process.env.PORT || 3000;

// Connect MongoDB Atlas, then seed the admin account if absent
connectDB().then(bootstrapAdmin);

// ==============================================================================
// CORS Configuration (Development Vite 5173 & Production Domains)
// ==============================================================================
const parseCorsOrigins = () => {
  const origins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];
  if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(',').forEach((o) => {
      const trimmed = o.trim();
      if (trimmed && !origins.includes(trimmed)) origins.push(trimmed);
    });
  }
  return origins;
};

const allowedOrigins = parseCorsOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow same-origin or server-to-server requests (!origin)
    // 2. Allow whitelisted dev/prod origins
    // 3. In non-production development mode, allow all origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Blocked by CORS policy: Origin '${origin}' is not authorized.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// ==============================================================================
// API & Health Routes
// ==============================================================================
app.get('/health', (_req, res) =>
  res.json({ success: true, status: 'healthy', database: 'connected', timestamp: new Date().toISOString() })
);

app.use('/api/v1/auth',      authRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/alerts',    alertRoutes);

// ==============================================================================
// Single-Server Static Hosting & React SPA Catch-All
// ==============================================================================
// Resolve location of compiled React dist directory
const distCandidates = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, '..', 'frontend', 'dist'),
  path.join(__dirname, 'frontend', 'dist'),
  path.join(__dirname, '..', 'dist'),
];
const distPath = distCandidates.find((dir) => fs.existsSync(dir));

if (distPath) {
  app.use(express.static(distPath));

  // Catch-all route to serve index.html for client-side routing (React Router)
  app.get('*', (req, res, next) => {
    // Guard: do not serve index.html for unmatched API routes
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/health') {
      return res.status(404).json({ success: false, message: `API route '${req.originalUrl}' not found.` });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Helpful landing if dist hasn't been built yet
  app.get('/', (_req, res) => {
    res.send(`
      <div style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h2>🌊 AquaLedger API is Running</h2>
        <p>Frontend production bundle not found in <code>dist/</code>.</p>
        <p>• In development: run <code>npm run dev</code> and open <a href="http://localhost:5173">http://localhost:5173</a></p>
        <p>• In production: run <code>npm run build</code> first, then restart the server.</p>
      </div>
    `);
  });
}

// Global error handler — keeps all 500 responses consistent
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

const server = http.createServer(app);
const io = initializeSockets(server);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`\n===============================================================`);
  console.log(`  🌊 AquaLedger Server Running Successfully!`);
  console.log(`  ➜ Local Web App:  http://localhost:${PORT}`);
  console.log(`  ➜ Health Status:  http://localhost:${PORT}/health`);
  console.log(`  ➜ Telemetry API:  http://localhost:${PORT}/api/v1/telemetry`);
  if (distPath) {
    console.log(`  ➜ Serving Client: ${distPath}`);
  } else {
    console.log(`  ➜ Vite Dev URL:   http://localhost:5173`);
  }
  console.log(`===============================================================\n`);
});