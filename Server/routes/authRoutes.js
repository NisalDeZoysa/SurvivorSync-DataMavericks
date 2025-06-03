import express from 'express';
import {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getVolunteerAndVictimCount,
  getVolunteers
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/users', authenticateToken, getAllUsers);
router.get('/users/:id', authenticateToken, getUserById);
router.put('/users/:id', authenticateToken, updateUser);
router.delete('/users/:id', authenticateToken, deleteUser);
router.get('/count/volunteers-victims', getVolunteerAndVictimCount);
router.get('/volunteers', getVolunteers);

export default router;
