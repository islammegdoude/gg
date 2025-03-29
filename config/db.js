// config/db.js
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    logger.info('Attempting to connect to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: false,
      bufferCommands: false,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000
    });
    
    const dbName = conn.connection.db.databaseName;
    logger.info(`MongoDB Atlas connected: ${conn.connection.host}`);
    logger.info(`Using database: ${dbName}`);
    
    // Add connection event handlers
    mongoose.connection.on('error', err => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000);
    });
    
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    logger.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    logger.error('Application cannot start without a database connection');
    process.exit(1);
  }
};

module.exports = connectDB;
