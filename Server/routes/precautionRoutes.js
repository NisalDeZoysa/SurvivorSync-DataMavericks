import express from 'express';
import {
  createPrecaution,
  getAllPrecautions,
  getPrecautionById,
  updatePrecaution,
  deletePrecaution,
} from '../controllers/precautionController.js';

import {
  authenticateToken,
  isAdmin
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createPrecaution);
router.get('/', getAllPrecautions);
router.get('/:id', getPrecautionById);
router.put('/:id', authenticateToken, updatePrecaution);
router.delete('/:id', authenticateToken, deletePrecaution);

export default router;
