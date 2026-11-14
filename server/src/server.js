import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { connectDB, closeDB } from './config/db.js';
import { seedDatabase } from './seeders/seed.js';
import { errorHandler } from './middleware/errorHandler.js';
import { storageService } from './services/storageService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure production and development CORS origins
const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:4173'
];

const parseClientUrls = (urlStr) => {
  if (!urlStr) return [];
  return urlStr.split(',').map((u) => u.trim().replace(/\/+$/, '')).filter(Boolean);
};

const configuredOrigins = parseClientUrls(ENV.CLIENT_URL);
const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultDevOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, internal server health checks)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Allow configured origins
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow official and preview Vercel deployments (*.vercel.app)
    if (/^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    // In development mode, allow any localhost port
    if (ENV.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    // Reject unauthorized origin
    const corsError = new Error(`CORS Error: Origin '${origin}' is not authorized to access this resource.`);
    corsError.status = 403;
    return callback(corsError);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically from storage service directory
app.use('/uploads', express.static(storageService.getUploadDir()));

if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Production Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const storageInfo = storageService.getStorageInfo();

  const healthData = {
    status: isDbConnected ? 'online' : 'degraded',
    database: isDbConnected ? 'connected' : 'disconnected',
    environment: ENV.NODE_ENV,
    service: 'Mathematics Academy LMS & CMS API',
    version: '2.0.0',
    storage: {
      driver: storageInfo.driver,
      isPersistent: storageInfo.isPersistent
    },
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  };

  res.status(isDbConnected ? 200 : 503).json(healthData);
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/learn', learningRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/cms', cmsRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const PORT = process.env.PORT || ENV.PORT || 5000;
    const HOST = '0.0.0.0';

    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Mathematics Academy Server listening on http://${HOST}:${PORT} [${ENV.NODE_ENV}]`);
    });

    const shutdown = async () => {
      console.log('\nGracefully shutting down server...');
      server.close(async () => {
        await closeDB();
        console.log('Server and database connections terminated safely.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
};

startServer();
