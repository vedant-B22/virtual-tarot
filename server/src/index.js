require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes/api');
const { setupSocketHandlers } = require('./sockets/sessionHandler');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;

// CORS setup for dev and production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));

app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static build in production
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving static client build from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for routes like /session/:sessionId
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

setupSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`✨ Live Tarot Server running on http://localhost:${PORT}`);
  console.log(`🔮 WebSocket server active`);
  console.log(`🔑 Admin password: ${process.env.ADMIN_PASSWORD || 'tarot2026'}`);
  console.log(`===============================================`);
});
