import express from 'express';
import {
  createUserRequest,
  getAllRequests,
  getRequestById,
  deleteRequest
} from '../controllers/disasterRequestController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { userRequestUpload } from '../middleware/upload.js';
import { updateRequest } from '../controllers/disasterRequestController.js';
const router = express.Router();

router.post('/requests', userRequestUpload, createUserRequest);
router.get('/requests',  getAllRequests);
router.get('/requests/:id', getRequestById);
router.delete('/requests/:id',deleteRequest);
router.put('/requests/:id', userRequestUpload, updateRequest);

export default router;
