import Availability from '../models/ResourceAvailability.js';
import Allocation from '../models/ResourceAllocation.js';

// Create or update availability for a resource
export const setAvailability = async (req, res) => {
  const { allocatedResourceId, is_available } = req.body;

  try {
    const allocation = await Allocation.findByPk(allocatedResourceId);
    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });

    const [availability, created] = await Availability.upsert(
      { allocatedResourceId, is_available },
      { returning: true }
    );

    res.json({
      message: created ? 'Availability set' : 'Availability updated',
      availability,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get availability by allocation
export const getAvailabilityByAllocation = async (req, res) => {
  try {
    const availability = await Availability.findOne({
      where: { allocatedResourceId: req.params.allocatedResourceId },
      include: Allocation
    });

    if (!availability) return res.status(404).json({ error: 'Availability not found' });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all availabilities
export const getAllAvailabilities = async (req, res) => {
  try {
    const all = await Availability.findAll({ include: Allocation });
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
