import express from 'express';
import {
  createUserRequest,
  getAllRequests,
  getRequestById,
  deleteRequest,
  exportDisasterStats,
  getDistrictDisasterSummary,
  getCurrentYearDisasterTotals

} from '../controllers/disasterRequestController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { userRequestUpload } from '../middleware/upload.js';
import { updateRequest } from '../controllers/disasterRequestController.js';
const router = express.Router();

router.post('/requests', userRequestUpload, createUserRequest);
router.get('/requests',  getAllRequests);
router.get('/requests/userId', getRequestById);
router.delete('/requests/:id',deleteRequest);
router.put('/requests/:id', userRequestUpload, updateRequest);
router.get('/disaster-stats', exportDisasterStats);
router.get('/district-disaster-summary', getDistrictDisasterSummary);
router.get('/disasters/totals/current-year', getCurrentYearDisasterTotals);


export default router;
