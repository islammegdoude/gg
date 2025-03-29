const express = require('express');
const router = express.Router();
const { 
  getAllClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient 
} = require('../controllers/clientController');
const { isAuth } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getAllClients);
router.get('/:id', getClientById);

// Protected routes (admin only)
router.post('/', isAuth, createClient);
router.put('/:id', isAuth, updateClient);
router.delete('/:id', isAuth, deleteClient);

module.exports = router; 