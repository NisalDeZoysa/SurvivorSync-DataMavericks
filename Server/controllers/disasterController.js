import {Disaster} from '../models/index.js';


export const createDisaster = async (req, res) => {
  try {
    const { name, type, severity, details } = req.body;
    const disaster = await Disaster.create({ name, type, severity, details });
    res.status(201).json({ message: 'Disaster created', disaster });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  };

export const getAllDisasters = async (req, res) => {
  try {
    const disasters = await Disaster.findAll();
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDisasterById = async (req, res) => {
  try {
    const disaster = await Disaster.findByPk(req.params.id);
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });
    res.json(disaster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findByPk(req.params.id);
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });

    await disaster.update(req.body);
    res.json({ message: 'Disaster updated', disaster });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteDisaster = async (req, res) => {
  try {
    const disaster = await Disaster.findByPk(req.params.id);
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });

    await disaster.destroy();
    res.json({ message: 'Disaster deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this function to your existing exports
export const getDisasterCount = async (req, res) => {
  try {
    const count = await Disaster.count();
    res.json({ totalDisasters: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};