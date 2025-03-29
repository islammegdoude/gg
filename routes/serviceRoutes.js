// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/authMiddleware');
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getActiveServices,
} = require('../controllers/serviceController');

router.post('/', isAuth, createService);
router.get('/', getServices);
router.get('/active', getActiveServices);
router.get('/:id', getServiceById);
router.put('/:id', isAuth, updateService);
router.delete('/:id', isAuth, deleteService);

module.exports = router;
