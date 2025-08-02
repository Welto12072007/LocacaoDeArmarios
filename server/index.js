import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
import studentRoutes from './routes/students.js';
import lockerRoutes from './routes/lockers.js';
import rentalRoutes from './routes/rentals.js';
import locaisRoutes from './routes/locais.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/locais', locaisRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: 'Connected',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: err.errors
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message
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
      console.log('🔐 Authentication Endpoints:');
      console.log('   POST /api/auth/register - Register new user');
      console.log('   POST /api/auth/login - Login user');
      console.log('   POST /api/auth/refresh - Refresh tokens');
      console.log('   POST /api/auth/forgot-password - Request password reset');
      console.log('   POST /api/auth/reset-password - Reset password');
      console.log('   GET  /api/users - List users (admin only)');
      console.log('');
      console.log('📧 Default Admin Credentials:');
      console.log('   Email: admin@lockers.com');
      console.log('   Password: admin123');
      console.log('');
      console.log('🔒 Security Features:');
      console.log('   ✅ Rate limiting enabled');
      console.log('   ✅ Input validation active');
      console.log('   ✅ JWT authentication');
      console.log('   ✅ Password encryption (bcrypt)');
      console.log('   ✅ Account lockout protection');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();