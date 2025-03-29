// app.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const dns = require('dns');
const cors = require('cors');
const { apiLogger } = require('./middlewares/loggingMiddleware');
const timeout = require('connect-timeout');

// 1. Fix DNS resolution by using Google's DNS servers
console.log("Setting DNS servers to Google's public DNS (8.8.8.8, 8.8.4.4)");
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Set a global request timeout of 3 minutes (180000ms)
app.use(timeout('180s'));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// Middlewares
// Enhanced CORS configuration with dynamic origin support
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // In development mode, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // List of allowed origins
    const allowedOrigins = [
      // Frontend local development on various ports
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:56151',
      'http://127.0.0.1:57125',
      // Add production domains
      'https://vision-intek.com',
      'https://www.vision-intek.com',
      'https://api.vision-intek.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: '*',
  exposedHeaders: ['Content-Length', 'Content-Type']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle OPTIONS preflight requests
app.options('*', cors(corsOptions));

// Increase JSON payload size limit to 50MB for handling base64 images
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add API request/response logging middleware
app.use(apiLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Connect to database
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`API Base URL: ${process.env.API_BASE_URL}`);
  });
}

module.exports = app;
