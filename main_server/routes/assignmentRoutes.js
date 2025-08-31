import express from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  getFormattedAssignments,
  getAssignmentsByVolunteerId,
  updateAssignment
} from '../controllers/assignmentController.js';

const router = express.Router();


router.post('/', createAssignment);
router.get('/', getAllAssignments);
router.get('/summary', getFormattedAssignments);
router.get('/volunteer/:volunteerId', getFormattedAssignments);
router.get('/volunteer-assignments/:volunteerId', getAssignmentsByVolunteerId);
router.get('/:id', getAssignmentById);
router.put('/:id', updateAssignment);



export default router;
