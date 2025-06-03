import Assignment from '../models/Assignment.js';
import User from '../models/user.js';
import DisasterRequest from '../models/DisasterRequest.js';
import Disaster from '../models/Disaster.js';

export const createAssignment = async (req, res) => {
  try {
    const { Volunteerid, DisasterRequestId, Priority, Task } = req.body;

    // 1. Validate Task
    if (!Task || Task.trim() === '') {
      return res.status(400).json({ message: 'Task is required.' });
    }

    // 2. Check if user exists and is a volunteer
    const user = await User.findByPk(Volunteerid);
    if (!user || user.type.toLowerCase() !== 'volunteer') {
      return res.status(400).json({ message: 'Only volunteers can be assigned.' });
    }

    // 3. Get DisasterRequest (including Disaster ID)
    const disasterRequest = await DisasterRequest.findByPk(DisasterRequestId);
    if (!disasterRequest) {
      return res.status(404).json({ message: 'DisasterRequest not found.' });
    }

    const {
      district: District,
      province: Province,
      longitude,
      latitude,
      disasterId: DisasterId,
    } = disasterRequest;

    // 4. Get Disaster to retrieve type (name)
    const disaster = await Disaster.findByPk(DisasterId);
    if (!disaster) {
      return res.status(404).json({ message: 'Disaster not found.' });
    }

    const type = disaster.name;

    // 5. Create the assignment
    const assignment = await Assignment.create({
      Volunteerid,
      DisasterRequestId,
      District,
      Province,
      longitude,
      latitude,
      DisasterId,
      type,
      Priority,
      Task,
    });

    // Get the volunteer name for the formatted response
    const formattedAssignment = {
      id: assignment.id,
      Volunteerid: assignment.Volunteerid,
      VolunteerName: user.name,
      DisasterRequestId: assignment.DisasterRequestId,
      District: assignment.District,
      Province: assignment.Province,
      Longitude: parseFloat(assignment.longitude),
      Latitude: parseFloat(assignment.latitude),
      Task: assignment.Task,
      AssignedDate: assignment.created_at,
      Priority: assignment.Priority,
      Status: assignment.status
    };

    // Emit socket event for real-time updates with formatted data
    req.app.get('io').emit('assignmentUpdate', { action: 'create', assignment: formattedAssignment });

    return res.status(201).json({ message: 'Assignment created successfully', assignment: formattedAssignment });

  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Fetch all assignments
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      include: [User, DisasterRequest, Disaster],
    });
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fetch one assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByPk(id, {
      include: [User, DisasterRequest, Disaster],
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const getFormattedAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
        },
        {
          model: DisasterRequest,
          attributes: ['id', 'district', 'province', 'longitude', 'latitude'],
        },
        {
          model: Disaster,
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']], // Optional: orders by most recent
    });

    const formatted = assignments.map((a) => ({
      id: a.id,
      Volunteerid: a.Volunteerid,
      VolunteerName: a.User?.name || 'Unknown',
      DisasterRequestId: a.DisasterRequestId,
      District: a.District || a.DisasterRequest?.district || 'N/A',
      Province: a.Province || a.DisasterRequest?.province || 'N/A',
      Longitude: parseFloat(a.longitude ?? a.DisasterRequest?.longitude ?? 0),
      Latitude: parseFloat(a.latitude ?? a.DisasterRequest?.latitude ?? 0),
      Task: a.Task,
      AssignedDate: a.created_at,
      Priority: a.Priority,
      Status: a.status,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching formatted assignments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update assignment status
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const assignment = await Assignment.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        }
      ]
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.status = status;
    await assignment.save();

    const formattedAssignment = {
      id: assignment.id,
      Volunteerid: assignment.Volunteerid,
      VolunteerName: assignment.User?.name || 'Unknown',
      DisasterRequestId: assignment.DisasterRequestId,
      District: assignment.District,
      Province: assignment.Province,
      Longitude: parseFloat(assignment.longitude),
      Latitude: parseFloat(assignment.latitude),
      Task: assignment.Task,
      AssignedDate: assignment.created_at,
      Priority: assignment.Priority,
      Status: assignment.status
    };

    // Emit socket event for real-time updates with formatted data
    req.app.get('io').emit('assignmentUpdate', { action: 'update', assignment: formattedAssignment });

    res.status(200).json({ message: 'Assignment status updated', assignment: formattedAssignment });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await assignment.destroy();

    // Emit socket event for real-time updates with just the ID
    req.app.get('io').emit('assignmentUpdate', { 
      action: 'delete', 
      assignmentId: parseInt(id)  // Ensure ID is a number
    });

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAssignmentsByVolunteerId = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    // Ensure volunteer exists
    const volunteer = await User.findOne({
      where: { id: volunteerId, type: 'volunteer' }
    });

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found or not a valid volunteer' });
    }

    // Find assignments for the given Volunteerid
    const assignments = await Assignment.findAll({
      where: { Volunteerid: volunteerId },
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
        },
        {
          model: DisasterRequest,
          attributes: ['id', 'district', 'province', 'longitude', 'latitude'],
        },
        {
          model: Disaster,
          attributes: ['id', 'name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = assignments.map((a) => ({
      id: a.id,
      Volunteerid: a.Volunteerid,
      VolunteerName: a.User?.name || 'Unknown',
      DisasterRequestId: a.DisasterRequestId,
      District: a.District || a.DisasterRequest?.district || 'N/A',
      Province: a.Province || a.DisasterRequest?.province || 'N/A',
      Longitude: parseFloat(a.longitude ?? a.DisasterRequest?.longitude ?? 0),
      Latitude: parseFloat(a.latitude ?? a.DisasterRequest?.latitude ?? 0),
      Task: a.Task,
      AssignedDate: a.created_at,
      Priority: a.Priority,
      Status: a.status,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching assignments by volunteer ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Task,
      Priority,
      status,
      DisasterRequestId,
      Volunteerid
    } = req.body;

    const assignment = await Assignment.findByPk(id, {
      include: [{ model: User, attributes: ['name'] }],
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // If DisasterRequestId is updated, fetch new location and disaster info
    if (DisasterRequestId && DisasterRequestId !== assignment.DisasterRequestId) {
      const disasterRequest = await DisasterRequest.findByPk(DisasterRequestId);
      if (!disasterRequest) {
        return res.status(404).json({ message: 'DisasterRequest not found.' });
      }

      const disaster = await Disaster.findByPk(disasterRequest.disasterId);
      if (!disaster) {
        return res.status(404).json({ message: 'Disaster not found.' });
      }

      assignment.DisasterRequestId = DisasterRequestId;
      assignment.District = disasterRequest.district;
      assignment.Province = disasterRequest.province;
      assignment.longitude = disasterRequest.longitude;
      assignment.latitude = disasterRequest.latitude;
      assignment.DisasterId = disasterRequest.disasterId;
      assignment.type = disaster.name;
    }

    // If Volunteerid is updated, verify the user
    if (Volunteerid && Volunteerid !== assignment.Volunteerid) {
      const user = await User.findByPk(Volunteerid);
      if (!user || user.type.toLowerCase() !== 'volunteer') {
        return res.status(400).json({ message: 'Invalid volunteer.' });
      }
      assignment.Volunteerid = Volunteerid;
    }

    // Update optional fields
    if (Task !== undefined) assignment.Task = Task;
    if (Priority !== undefined) assignment.Priority = Priority;
    if (status !== undefined) assignment.status = status;

    await assignment.save();

    const formattedAssignment = {
      id: assignment.id,
      Volunteerid: assignment.Volunteerid,
      VolunteerName: assignment.User?.name || 'Unknown',
      DisasterRequestId: assignment.DisasterRequestId,
      District: assignment.District,
      Province: assignment.Province,
      Longitude: parseFloat(assignment.longitude),
      Latitude: parseFloat(assignment.latitude),
      Task: assignment.Task,
      AssignedDate: assignment.created_at,
      Priority: assignment.Priority,
      Status: assignment.status
    };

    req.app.get('io').emit('assignmentUpdate', { action: 'update', assignment: formattedAssignment });

    res.status(200).json({ message: 'Assignment updated successfully', assignment: formattedAssignment });

  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
