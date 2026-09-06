import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes';
import { isSupabaseConfigured } from './config/supabase';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Middlewares
app.use(cors({
  origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Root greeting
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Aafno Pay Backend API Engine',
    version: '1.0.0',
    docs: '/api/health',
    supabaseConnected: isSupabaseConfigured(),
  });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 Aafno Pay Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Supabase Connected: ${isSupabaseConfigured() ? 'YES (Live Database)' : 'NO (Using Integrated Database Engine)'}`);
  console.log(`🌐 Allowed Client Origin: ${CLIENT_ORIGIN}`);
  console.log(`📋 API Health Check: http://localhost:${PORT}/api/health`);
  console.log('================================================================');
});

export default app;
