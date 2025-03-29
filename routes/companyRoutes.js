// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/authMiddleware');
const {
  getCompanyInfo,
  updateCompanyInfo,
  getSocialMedia,
  getHeroImages,
  getDiagnosticData
} = require('../controllers/companyController');

// Add a diagnostic endpoint (admin only)
router.get('/diagnostic', isAuth, getDiagnosticData);

// Public routes
router.get('/', getCompanyInfo);
router.get('/social-media', getSocialMedia);
router.get('/hero-images', getHeroImages);

// Protected routes
router.put('/', isAuth, updateCompanyInfo);

module.exports = router;
