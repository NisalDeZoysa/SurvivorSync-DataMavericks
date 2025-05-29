import {AllocatedResource} from '../models/index.js';
import {ResourceCenter} from '../models/index.js';
import {DisasterRequest} from '../models/index.js';

// Create
export const createAllocation = async (req, res) => {
  try {
    const { resourceCenterId, userRequestId,amount,isAllocated } = req.body;

    const center = await ResourceCenter.findByPk(resourceCenterId);
    const request = await DisasterRequest.findByPk(userRequestId);

    if (!center || !request) {
      return res.status(404).json({ error: 'Resource center or user request not found' });
    }

    const allocation = await AllocatedResource.create({ resourceCenterId, userRequestId,amount,isAllocated });
    res.status(201).json({ message: 'Resource allocated', allocation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all
export const getAllAllocations = async (req, res) => {
  try {
    const allocations = await AllocatedResource.findAll({
      include: [ResourceCenter, DisasterRequest]
    });
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
export const getAllocationById = async (req, res) => {
  try {
    const allocation = await AllocatedResource.findByPk(req.params.id, {
      include: [ResourceCenter, DisasterRequest]
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
    const allocation = await AllocatedResource.findByPk(req.params.id);
    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });

    await allocation.destroy();
    res.json({ message: 'Allocation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
