import express from 'express';
import {
  createAllocation,
  getAllAllocations,
  getAllocationById,
  deleteAllocation,
  getAllocationSummaries,
  updateAllocation
} from '../controllers/allocationController.js';

const router = express.Router();

router.post('/', createAllocation);
router.get('/',  getAllAllocations);
router.get('/summary', getAllocationSummaries);
router.get('/:id', getAllocationById);
router.delete('/:id', deleteAllocation);
router.put('/:id', updateAllocation);


export default router;
