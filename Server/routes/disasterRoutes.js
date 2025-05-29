import express from 'express';
import {
  createDisaster,
  getAllDisasters,
  getDisasterById,
  updateDisaster,
  deleteDisaster,
  getDisasterCount,
  getDisasterTypeCountsFiveYears
} from '../controllers/disasterController.js';


import {
  authenticateToken,
  isAdmin
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createDisaster);
router.get('/', getAllDisasters);
router.get('/count', getDisasterCount); // public or authenticated as needed
router.get('/:id', getDisasterById);
router.put('/:id', authenticateToken, updateDisaster);
router.delete('/:id', authenticateToken, deleteDisaster);
router.get('/count/by-type/year', getDisasterTypeCountsFiveYears);

export default router;
