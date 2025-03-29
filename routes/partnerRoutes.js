// routes/partnerRoutes.js
const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/authMiddleware');
const {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  deletePartner
} = require('../controllers/partnerController');

router.post('/', isAuth, createPartner);
router.get('/', getPartners);
router.get('/:id', getPartnerById);
router.put('/:id', isAuth, updatePartner);
router.delete('/:id', isAuth, deletePartner);

module.exports = router;
