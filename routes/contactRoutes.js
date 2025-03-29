const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/authMiddleware');
const {
  createMessage,
  getMessages,
  getMessage,
  markAsRead,
  replyToMessage,
  archiveMessage
} = require('../controllers/contactController');

// Public route for submitting contact form
router.post('/', createMessage);

// Admin routes (protected)
router.get('/', isAuth, getMessages);
router.get('/:id', isAuth, getMessage);
router.put('/:id/read', isAuth, markAsRead);
router.post('/:id/reply', isAuth, replyToMessage);
router.put('/:id/archive', isAuth, archiveMessage);

module.exports = router; 