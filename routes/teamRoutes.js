// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/authMiddleware');
const {
  createTeamMember,
  getTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember
} = require('../controllers/teamController');

router.post('/', isAuth, createTeamMember);
router.get('/', getTeamMembers);
router.get('/:id', getTeamMemberById);
router.put('/:id', isAuth, updateTeamMember);
router.delete('/:id', isAuth, deleteTeamMember);

module.exports = router;
