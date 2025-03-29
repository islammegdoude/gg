// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuth } = require('../middlewares/authMiddleware');
const { uploadImage, testUpload, checkCloudinaryStatus } = require('../controllers/uploadController');

// Configure multer to use memory storage instead of disk storage
const storage = multer.memoryStorage();

// Custom error handler for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
        error: err.message
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  
  // For other errors, pass to regular error handlers
  next(err);
};

// Increase file size limit to 10MB to accommodate larger images
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit (increased from 5MB)
});

// Status check endpoint - no file upload needed
router.get('/status', isAuth, checkCloudinaryStatus);

// Public route - no auth required (e.g., for user registration)
router.post('/public', upload.single('image'), multerErrorHandler, uploadImage);

// Test upload endpoint with extended debugging
router.post('/test', isAuth, upload.single('image'), multerErrorHandler, testUpload);

// Protected routes - require authentication
router.post('/', isAuth, upload.single('image'), multerErrorHandler, uploadImage);
router.post('/company/hero', isAuth, upload.single('image'), multerErrorHandler, (req, res, next) => {
  req.query.folder = 'company/hero';
  next();
}, uploadImage);
router.post('/categories', isAuth, upload.single('image'), multerErrorHandler, (req, res, next) => {
  req.query.folder = 'categories';
  next();
}, uploadImage);
router.post('/products', isAuth, upload.single('image'), multerErrorHandler, (req, res, next) => {
  req.query.folder = 'products';
  next();
}, uploadImage);
router.post('/services', isAuth, upload.single('image'), multerErrorHandler, (req, res, next) => {
  req.query.folder = 'services';
  next();
}, uploadImage);
router.post('/clients', isAuth, upload.single('image'), multerErrorHandler, (req, res, next) => {
  req.query.folder = 'clients';
  next();
}, uploadImage);

module.exports = router;
