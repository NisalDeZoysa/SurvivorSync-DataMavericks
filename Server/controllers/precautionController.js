import Precaution from '../models/index.js';
import Disaster from '../models/index.js';

// Create
export const createPrecaution = async (req, res) => {
  try {
    const { description, disasterId } = req.body;
    const precaution = await Precaution.create({ description, disasterId });
    res.status(201).json({ message: 'Precaution created', precaution });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read All
export const getAllPrecautions = async (req, res) => {
  try {
    const precautions = await Precaution.findAll({ include: Disaster });
    res.json(precautions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read by ID
export const getPrecautionById = async (req, res) => {
  try {
    const precaution = await Precaution.findByPk(req.params.id, { include: Disaster });
    if (!precaution) return res.status(404).json({ error: 'Precaution not found' });
    res.json(precaution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
export const updatePrecaution = async (req, res) => {
  try {
    const precaution = await Precaution.findByPk(req.params.id);
    if (!precaution) return res.status(404).json({ error: 'Precaution not found' });

    await precaution.update(req.body);
    res.json({ message: 'Precaution updated', precaution });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete
export const deletePrecaution = async (req, res) => {
  try {
    const precaution = await Precaution.findByPk(req.params.id);
    if (!precaution) return res.status(404).json({ error: 'Precaution not found' });

    await precaution.destroy();
    res.json({ message: 'Precaution deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
