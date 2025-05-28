import {AvailableResource} from '../models/index.js';
import {AllocatedResource} from '../models/index.js';

// Create or update availability for a resource
export const setAvailability = async (req, res) => {
  const { allocatedResourceId, is_available } = req.body;

  try {
    const allocation = await AllocatedResource.findByPk(allocatedResourceId);
    if (!allocation) return res.status(404).json({ error: 'AllocatedResource not found' });

    const [availability, created] = await AvailableResource.upsert(
      { allocatedResourceId, is_available },
      { returning: true }
    );

    res.json({
      message: created ? 'AvailableResource set' : 'AvailableResource updated',
      availability,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get availability by allocation
export const getAvailabilityByAllocation = async (req, res) => {
  try {
    const availability = await AvailableResource.findOne({
      where: { allocatedResourceId: req.params.allocatedResourceId },
      include: AllocatedResource
    });

    if (!availability) return res.status(404).json({ error: 'AvailableResource not found' });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all availabilities
export const getAllAvailabilities = async (req, res) => {
  try {
    const all = await AvailableResource.findAll({ include: AllocatedResource });
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
