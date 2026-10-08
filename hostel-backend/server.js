const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Initialize database connection (Cluster: keerthana)
connectDB();

const app = express();

// Security HTTP headers
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));

// CORS configuration for React frontend
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Strict brute-force protection for authentication endpoints (prevent credential guessing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 login attempts per 15 min per IP
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes to prevent unauthorized access.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);

// Global API rate limiter for regular traffic
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per 15 min per IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

  res.status(200).json({
    status: 'OK',
    service: 'Vidudhi Hostel Resident Portal API',
    database: {
      cluster: 'keerthana',
      state: states[dbStatus] || 'Unknown',
      host: mongoose.connection.host || '127.0.0.1',
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Root API documentation index
app.get('/api', (req, res) => {
  res.status(200).json({
    portal: 'Vidudhi Smart Residence & Campus Living Platform',
    version: '1.0.0',
    databaseCluster: 'keerthana',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        googleOAuth: 'POST /api/auth/google',
        me: 'GET /api/auth/me',
        oauthConfig: 'GET /api/auth/oauth/config',
      },
      admin: {
        overview: 'GET /api/admin/overview',
        users: 'GET /api/admin/users',
        createUser: 'POST /api/admin/users',
        auditLogs: 'GET /api/admin/logs',
      },
      attendance: {
        checkIn: 'POST /api/attendance/check-in (GPS + Biometric + HMAC SHA-256)',
        daily: 'GET /api/attendance/daily',
        override: 'PATCH /api/attendance/override/:id',
        history: 'GET /api/attendance/history',
      },
      simulation: {
        forecast: 'POST /api/simulation/forecast (What-If Algorithmic Engine)',
        scenarios: 'GET /api/simulation/scenarios',
      },
      chatbot: {
        query: 'POST /api/chatbot/query (Hostel Rulebook & Campus NLP)',
      },
      user: {
        recentlyAccessed: 'GET /api/user/recently-accessed',
        logRecentlyAccessed: 'POST /api/user/recently-accessed',
        language: 'PATCH /api/user/language',
      },
      complaints: 'GET/POST /api/complaints',
      leave: 'GET/POST /api/leave (Curfew validation + Cryptographic QR Turnstile tokens)',
      rooms: 'GET /api/rooms',
      visitors: 'GET/POST /api/visitors',
    },
  });
});

// Route Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/simulation', require('./routes/simulationRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/leave', require('./routes/leaveRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/visitors', require('./routes/visitorRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));
app.use('/api/mess', require('./routes/messRoutes'));

// Serve static frontend assets in production (Unified full-stack deployment)
const frontendDistPath = path.join(__dirname, '../hostel-frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 Route Catch-all (for unhandled API routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on Vidudhi backend server.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Vidudhi Hostel Resident Portal Server running on :${PORT}`);
  console.log(` Database Target: keerthana MongoDB Cluster`);
  console.log(` Non-CRUD GPS Geofence: ${process.env.HOSTEL_LAT || 13.0827}° N, ${process.env.HOSTEL_LNG || 80.2707}° E`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
