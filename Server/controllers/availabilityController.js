import {ResourceCenter} from '../models/index.js';
import {AllocatedResource} from '../models/index.js';

// Create or update availability for a resource
export const setAvailability = async (req, res) => {
  const { resourceId, lat, long, count, contactNumber } = req.body;
  try {
    // Check if the resource center already exists
    let resourceCenter = await ResourceCenter.findOne({ where: { resourceId, lat, long } });

    if (resourceCenter) {
      // Update existing resource center
      resourceCenter.count = count;
      resourceCenter.contactNumber = contactNumber;
      await resourceCenter.save();
      res.json({ message: 'Resource center updated', resourceCenter });
    } else {
      // Create new resource center
      resourceCenter = await ResourceCenter.create({ resourceId, lat, long, count, contactNumber });
      res.status(201).json({ message: 'Resource center created', resourceCenter });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get availability by allocation
export const getAvailabilityByAllocation = async (req, res) => {
  try {
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all availabilities
export const getAllAvailabilities = async (req, res) => {
  try {
    const all = await ResourceCenter.findAll({ include: AllocatedResource, where: { is_available: true } });
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
