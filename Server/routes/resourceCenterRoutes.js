import express from 'express';
import {
  createResourceCenter,
  getAllResourceCenters,
  getResourceCenterById,
  updateResourceCenter,
  deleteResourceCenter
} from '../controllers/resourceCenterController.js';

import {
  authenticateToken,
  isAdmin
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createResourceCenter);
router.get('/', authenticateToken, getAllResourceCenters);
router.get('/:id', authenticateToken, getResourceCenterById);
router.put('/:id', authenticateToken, updateResourceCenter);
router.delete('/:id', authenticateToken, deleteResourceCenter);

export default router;
