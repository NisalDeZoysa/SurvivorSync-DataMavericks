import Allocation from '../models/ResourceAllocation.js';
import ResourceCenter from '../models/ResourceCenter.js';
import UserRequest from '../models/DisasterRequest.js';

// Create
export const createAllocation = async (req, res) => {
  try {
    const { resourceCenterId, userRequestId } = req.body;

    const center = await ResourceCenter.findByPk(resourceCenterId);
    const request = await UserRequest.findByPk(userRequestId);

    if (!center || !request) {
      return res.status(404).json({ error: 'Resource center or user request not found' });
    }

    const allocation = await Allocation.create({ resourceCenterId, userRequestId });
    res.status(201).json({ message: 'Resource allocated', allocation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all
export const getAllAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.findAll({
      include: [ResourceCenter, UserRequest]
    });
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
export const getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findByPk(req.params.id, {
      include: [ResourceCenter, UserRequest]
    });
    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });
    res.json(allocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete
export const deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByPk(req.params.id);
    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });

    await allocation.destroy();
    res.json({ message: 'Allocation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
