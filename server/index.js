import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import studentRoutes from './routes/students.js';
import lockerRoutes from './routes/lockers.js';
import rentalRoutes from './routes/rentals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/rentals', rentalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Endpoint not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting LockerSys Server...');
    console.log('📊 Environment:', process.env.NODE_ENV || 'development');
    
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('🎉 LockerSys Server Started Successfully!');
      console.log('');
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`📊 API available at: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('📧 Default Admin Credentials:');
      console.log('   Email: admin@lockers.com');
      console.log('   Password: admin123');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();