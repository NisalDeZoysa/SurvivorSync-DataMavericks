import express from 'express';
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource
} from '../controllers/resourceController.js';

import {
  authenticateToken,
  isAdmin
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createResource);
router.get('/', authenticateToken, getAllResources);
router.get('/:id', authenticateToken, getResourceById);
router.put('/:id', authenticateToken, updateResource);
router.delete('/:id', authenticateToken, deleteResource);

export default router;
