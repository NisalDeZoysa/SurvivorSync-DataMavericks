import Resource from '../models/index.js';

// Create
export const createResource = async (req, res) => {
  try {
    const { type, name } = req.body;
    const resource = await Resource.create({ type, name });
    res.status(201).json({ message: 'Resource created', resource });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all
export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.findAll();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    await resource.update(req.body);
    res.json({ message: 'Resource updated', resource });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    await resource.destroy();
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
