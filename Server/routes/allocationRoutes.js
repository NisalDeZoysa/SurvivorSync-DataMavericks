import express from 'express';
import {
  createAllocation,
  getAllAllocations,
  getAllocationById,
  deleteAllocation
} from '../controllers/allocationController.js';

import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, isAdmin, createAllocation);
router.get('/', authenticateToken, isAdmin, getAllAllocations);
router.get('/:id', authenticateToken, isAdmin, getAllocationById);
router.delete('/:id', authenticateToken, isAdmin, deleteAllocation);

export default router;

