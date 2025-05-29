import express from 'express';
import {
  createResourceCenter,
  getAllResourceCenters,
  getResourceCenterById,
  updateResourceCenter,
  deleteResourceCenter,
  getResourceCenterCount
} from '../controllers/resourceCenterController.js';

import {
  authenticateToken,
  isAdmin
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createResourceCenter);
router.get('/', authenticateToken, getAllResourceCenters);
router.get('/count', authenticateToken, getResourceCenterCount);
router.get('/:id', authenticateToken, getResourceCenterById);
router.put('/:id', authenticateToken, updateResourceCenter);
router.delete('/:id', authenticateToken, deleteResourceCenter);
router.get('/count', authenticateToken, getResourceCenterCount);

export default router;
