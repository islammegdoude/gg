// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../middlewares/authMiddleware');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getCategoryEvents,
  createCategoryEvent,
  updateCategoryEvent,
  deleteCategoryEvent
} = require('../controllers/categoryController');

// Public routes
router.get('/', getCategories);
router.get('/active', (req, res) => {
  req.query.isActive = 'true';
  getCategories(req, res);
});
router.get('/:id', getCategoryById);
router.get('/:id/events', getCategoryEvents);

// Protected routes - require admin authentication
router.post('/', isAuth, isAdmin, createCategory);
router.put('/:id', isAuth, isAdmin, updateCategory);
router.delete('/:id', isAuth, isAdmin, deleteCategory);
router.patch('/reorder', isAuth, isAdmin, reorderCategories);

// Category events routes - require admin authentication
router.post('/:id/events', isAuth, isAdmin, createCategoryEvent);
router.put('/:categoryId/events/:eventId', isAuth, isAdmin, updateCategoryEvent);
router.delete('/:categoryId/events/:eventId', isAuth, isAdmin, deleteCategoryEvent);

module.exports = router;
