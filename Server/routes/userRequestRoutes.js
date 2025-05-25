import express from 'express';
import {
  createUserRequest,
  getAllRequests,
  getRequestById,
  deleteRequest
} from '../controllers/userRequestController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { userRequestUpload } from '../middleware/upload.js';
import { updateRequest } from '../controllers/userRequestController.js';
const router = express.Router();

router.post('/requests', authenticateToken, userRequestUpload, createUserRequest);
router.get('/requests', authenticateToken, getAllRequests);
router.get('/requests/:id', authenticateToken, getRequestById);
router.delete('/requests/:id', authenticateToken, deleteRequest);
router.put('/requests/:id', authenticateToken, userRequestUpload, updateRequest);

export default router;
