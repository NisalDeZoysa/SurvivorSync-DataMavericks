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

router.post('/', createPrecaution);
router.get('/', getAllPrecautions);
router.get('/:id', getPrecautionById);
router.put('/:id', updatePrecaution);
router.delete('/:id',deletePrecaution);

export default router;
