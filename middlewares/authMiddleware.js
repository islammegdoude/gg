// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to check if user is authenticated
exports.isAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find admin by id
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }
    
    // Add admin to request object
    req.admin = admin;
    
    // Update last login time
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
