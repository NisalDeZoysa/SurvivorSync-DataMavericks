import express from 'express';
import {
  createResourceCenter,
  getAllResourceCenters,
  getResourceCenterById,
  updateResourceCenter,
  deleteResourceCenter,
  getResourceCenterCount,
  getResourceCenterSummary
} from '../controllers/resourceCenterController.js';

import {
  authenticateToken,
  isAdmin
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createResourceCenter);
router.get('/',  getAllResourceCenters);
router.get('/count', getResourceCenterCount);
router.get('/summary', getResourceCenterSummary);
router.get('/:id', getResourceCenterById);
router.put('/:id',  updateResourceCenter);
router.delete('/:id',  deleteResourceCenter);


export default router;
