import { DisasterRequest, User } from '../models/index.js';

export const createUserRequest = async (req, res) => {
  try {
    let {
      name,
      userId,
      disasterId,
      severity,
      details,
      affectedCount,
      contactNo,
      latitude,
      longitude,
      district,
      province,
      address,
    } = req.body;

    if (typeof address === 'object') {
      address = Array.isArray(address)
        ? address.join(', ')
        : Object.values(address).join(', ');
    }

    // Since only one image is allowed, pick the first file's path as a string
    const imageFile = req.files?.image?.[0]?.path || null;
    const voiceFile = req.files?.voice?.[0]?.path || null;

    console.log('Image file path:', imageFile);
    console.log('Voice file path:', voiceFile);

    const request = await DisasterRequest.create({
      name,
      userId,
      disasterId,
      severity,
      details,
      affectedCount,
      contactNo,
      latitude,
      longitude,
      image: imageFile,
      voice: voiceFile,
      district,
      province,
      address,
    });

    

    res.status(201).json({ message: 'User request created', request });
  } catch (error) {
    console.error('Create error:', error);
    res.status(400).json({ error: error.message });
  }
};


export const getAllRequests = async (req, res) => {
  try {
    const requests = await DisasterRequest.findAll();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await DisasterRequest.findOne({
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
    const request = await DisasterRequest.findOne({
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
    const request = await DisasterRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });

    const {
      name,
      userId,
      disasterId,
      severity,
      details,
      affectedCount,
      contactNo,
      latitude,
      longitude,
      district,
      province,
    } = req.body;

    if (typeof address === 'object') {
      address = Array.isArray(address)
        ? address.join(', ')
        : Object.values(address).join(', ');
    }

    const imageFile = req.files?.image?.[0]?.path || null;
    const voiceFile = req.files?.voice?.[0]?.path || null;

    await request.update({
      name,
      userId,
      disasterId,
      severity,
      details,
      affectedCount,
      contactNo,
      latitude,
      longitude,
      images: imageFile,
      voice: voiceFile,
      district,
      province,
    });

    res.json({ message: 'Request updated', request });
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ error: error.message });
  }
};

