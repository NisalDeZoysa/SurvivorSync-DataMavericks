import {ResourceCenter} from '../models/index.js';
import {Resource} from '../models/index.js';

// Create
export const createResourceCenter = async (req, res) => {
  try {
    const { lat, long, count, contactNumber, resourceId } = req.body;

    const resource = await Resource.findByPk(resourceId);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    const center = await ResourceCenter.create({ lat, long, count, contactNumber, resourceId });
    res.status(201).json({ message: 'Resource center created', center });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all
export const getAllResourceCenters = async (req, res) => {
  try {
    const centers = await ResourceCenter.findAll({ include: Resource });
    res.json(centers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
export const getResourceCenterById = async (req, res) => {
  try {
    const center = await ResourceCenter.findByPk(req.params.id, { include: Resource });
    if (!center) return res.status(404).json({ error: 'Resource center not found' });
    res.json(center);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
export const updateResourceCenter = async (req, res) => {
  try {
    const center = await ResourceCenter.findByPk(req.params.id);
    if (!center) return res.status(404).json({ error: 'Resource center not found' });

    await center.update(req.body);
    res.json({ message: 'Resource center updated', center });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete
export const deleteResourceCenter = async (req, res) => {
  try {
    const center = await ResourceCenter.findByPk(req.params.id);
    if (!center) return res.status(404).json({ error: 'Resource center not found' });

    await center.destroy();
    res.json({ message: 'Resource center deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
