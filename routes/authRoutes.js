// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, register, updateCredentials, verifyToken } = require('../controllers/authController');
const { isAuth } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.put('/update-credentials', isAuth, updateCredentials);
router.get('/verify', isAuth, verifyToken);

module.exports = router;
