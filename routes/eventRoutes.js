// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/authMiddleware');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

/**
 * IMPORTANT: Event Architecture Change
 * 
 * Events are now managed as subdocuments within the Category model.
 * These routes are maintained for backwards compatibility but new code
 * should use the category routes for event operations:
 * 
 * - GET    /api/categories/:id/events         - Get events for a category
 * - POST   /api/categories/:id/events         - Create event in a category
 * - PUT    /api/categories/:id/events/:eventId - Update event in a category
 * - DELETE /api/categories/:id/events/:eventId - Delete event from a category
 */

// Legacy routes - redirected to use Category model internally
router.post('/', isAuth, createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.put('/:id', isAuth, updateEvent);
router.delete('/:id', isAuth, deleteEvent);

module.exports = router;
