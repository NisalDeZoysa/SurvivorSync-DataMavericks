import express from 'express';
import {
  createAllocation,
  getAllAllocations,
  getAllocationById,
  deleteAllocation
} from '../controllers/allocationController.js';

import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createAllocation);
router.get('/', authenticateToken, getAllAllocations);
router.get('/:id', authenticateToken, getAllocationById);
router.delete('/:id', authenticateToken, deleteAllocation);

export default router;
