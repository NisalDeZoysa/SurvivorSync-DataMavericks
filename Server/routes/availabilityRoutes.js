import express from 'express';
import {
  setAvailability,
  getAvailabilityByAllocation,
  getAllAvailabilities
} from '../controllers/availabilityController.js';

const router = express.Router();

router.post('/', setAvailability);
router.get('/', getAllAvailabilities);
router.get('/:allocatedResourceId', getAvailabilityByAllocation);

export default router;
