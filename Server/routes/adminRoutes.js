import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  refreshAdminToken,
  getAdminProfile,
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/refresh', refreshAdminToken);

router.get('/admins', authenticateToken, getAllAdmins);
router.get('/admins/:id', authenticateToken, getAdminById);
router.put('/admins/:id', authenticateToken, updateAdmin);
router.delete('/admins/:id', authenticateToken, deleteAdmin);
router.get('/profile', authenticateToken, getAdminProfile);

export default router;
