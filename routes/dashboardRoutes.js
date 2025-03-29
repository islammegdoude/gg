const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../middlewares/authMiddleware');

// Controller will be created next
const dashboardController = require('../controllers/dashboardController');

// Get dashboard statistics
router.get('/stats', isAuth, isAdmin, dashboardController.getStats);

// Get traffic analytics (replacing sales analytics)
router.get('/traffic', isAuth, isAdmin, dashboardController.getTrafficAnalytics);

// Get team analytics
router.get('/team', isAuth, isAdmin, dashboardController.getTeamAnalytics);

module.exports = router; 