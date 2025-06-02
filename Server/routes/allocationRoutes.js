import express from 'express';
import {
  createAllocation,
  getAllAllocations,
  getAllocationById,
  deleteAllocation
} from '../controllers/allocationController.js';

const router = express.Router();

router.post('/', createAllocation);
router.get('/',  getAllAllocations);
router.get('/:id', getAllocationById);
router.delete('/:id', deleteAllocation);

export default router;
