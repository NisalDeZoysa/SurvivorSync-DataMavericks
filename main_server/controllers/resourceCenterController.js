import { ResourceCenter } from '../models/index.js';
import { Resource } from '../models/index.js';

// Create
export const createResourceCenter = async (req, res) => {
  try {
    let { name, lat, long, count, contactNumber, resourceId, used } = req.body;

    // Convert types
    lat = parseFloat(lat);
    long = parseFloat(long);
    used = used ? parseInt(used) : 0;

    if (!lat || !long) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Fetch resource
    const resource = await Resource.findByPk(resourceId);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    // Reverse geocode to get district and province
    let district = '';
    let province = '';
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&zoom=10&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "SurvivorSync/1.0 (dinukpkcc@gmail.com)",
        },
      });

      if (!response.ok) throw new Error('Failed to fetch province/district');

      const data = await response.json();

      province = data.address?.state || data.address?.country || "Unknown";
      district = data.address?.state_district || data.address?.county || "Unknown";
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
      province = 'Unknown';
      district = 'Unknown';
    }

    // Create resource center
    const center = await ResourceCenter.create({
      name,
      lat,
      long,
      district,
      province,
      count,
      contactNumber,
      resourceId,
      used,
    });

    res.status(201).json({
      message: 'Resource center created',
      center,
    });

  } catch (error) {
    console.error('Error creating resource center:', error);
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

export const getResourceCenterCount = async (req, res) => {
  try {
    const count = await ResourceCenter.count();
    res.json({ totalResourceCenters: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getResourceCenterSummary = async (req, res) => {
  try {
    const centers = await ResourceCenter.findAll({
      attributes: ['id', 'name', 'district', 'province', 'count', 'used', 'contactNumber']
    });

    const summary = centers.map(center => ({
      id: center.id,
      name: center.name,
      location: `${center.district}, ${center.province}`,
      count: center.count,
      used: center.used,
      contact: center.contactNumber
    }));

    res.json(summary);
  } catch (error) {
    console.error('Error in getResourceCenterSummary:', error);
    res.status(500).json({ error: error.message });
  }
};

