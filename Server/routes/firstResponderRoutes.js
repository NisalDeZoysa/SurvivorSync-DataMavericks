import express from 'express';
import {
    registerFirstResponder,
    getAllFirstResponders,
    getFirstResponderById,
    updateFirstResponder,
    deleteFirstResponder,
    refreshFirstResponderToken,
    getFirstResponderProfile,
} from '../controllers/firstResponderController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/register', registerFirstResponder);
// router.post('/login', loginFirstResponder);
router.get('/refresh', refreshFirstResponderToken);

router.get('/admins', authenticateToken, getAllFirstResponders);
router.get('/admins/:id', authenticateToken, getFirstResponderById);
router.put('/admins/:id', authenticateToken, updateFirstResponder);
router.delete('/admins/:id', authenticateToken, deleteFirstResponder);
router.get('/profile', authenticateToken, getFirstResponderProfile);

export default router;
