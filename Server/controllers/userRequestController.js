import UserRequest from '../models/index.js';

export const createUserRequest = async (req, res) => {
  try {
    const {
      name,
      type,
      severity,
      details,
      affectedCount,
      contactNo,
      time,
      location = {},
    } = req.body;

    let { latitude, longitude, address } = location;

    // Ensure address is stored as a plain string
    if (typeof address === 'object') {
      address = Array.isArray(address)
        ? address.join(', ')
        : Object.values(address).join(', ');
    }

    const imageFiles = req.files?.images?.map(file => file.path) || [];
    const voiceFile = req.files?.voice?.[0]?.path || null;

    const request = await UserRequest.create({
      name,
      type,
      severity,
      details,
      affectedCount,
      contactNo,
      time,
      latitude,
      longitude,
      address,
      images: imageFiles,
      voice: voiceFile,
      userId: req.user.id,
    });

    res.status(201).json({ message: 'User request created', request });
  } catch (error) {
    console.error('Create error:', error);
    res.status(400).json({ error: error.message });
  }
};


export const getAllRequests = async (req, res) => {
  try {
    const requests = await UserRequest.findAll({ where: { userId: req.user.id } });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await UserRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await UserRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });

    await request.destroy();
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const request = await UserRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });

    const {
      name,
      type,
      severity,
      details,
      affectedCount,
      contactNo,
      time,
      location = {},
    } = req.body;

    let { latitude, longitude, address } = location;

    if (typeof address === 'object') {
      address = Array.isArray(address)
        ? address.join(', ')
        : Object.values(address).join(', ');
    }

    const imageFiles = req.files?.images?.map(file => file.path) || request.images;
    const voiceFile = req.files?.voice?.[0]?.path || request.voice;

    await request.update({
      name,
      type,
      severity,
      details,
      affectedCount,
      contactNo,
      time,
      latitude,
      longitude,
      address,
      images: imageFiles,
      voice: voiceFile,
    });

    res.json({ message: 'Request updated', request });
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ error: error.message });
  }
};

