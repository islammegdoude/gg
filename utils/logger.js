/**
 * Simple logger utility for the application
 * Provides standardized logging functions with timestamps
 */

// Environment-based logging level
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');

// Log levels with numeric values for comparison
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Check if the given level should be logged based on current LOG_LEVEL
const shouldLog = (level) => {
  return LOG_LEVELS[level] <= LOG_LEVELS[LOG_LEVEL];
};

// Format the current timestamp
const timestamp = () => {
  return new Date().toISOString();
};

// Logger object with methods for different log levels
const logger = {
  error: (message) => {
    if (shouldLog('error')) {
      console.error(`[${timestamp()}] ERROR: ${message}`);
    }
  },
  
  warn: (message) => {
    if (shouldLog('warn')) {
      console.warn(`[${timestamp()}] WARN: ${message}`);
    }
  },
  
  info: (message) => {
    if (shouldLog('info')) {
      console.info(`[${timestamp()}] INFO: ${message}`);
    }
  },
  
  debug: (message) => {
    if (shouldLog('debug')) {
      console.debug(`[${timestamp()}] DEBUG: ${message}`);
    }
  }
};

module.exports = { logger }; 