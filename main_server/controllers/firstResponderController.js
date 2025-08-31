import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {FirstResponder} from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const generateTokens = (admin) => {
  const accessToken = jwt.sign(
    {
      id: admin.id,
      role: 'first_responder',        
     
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: admin.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

export const registerFirstResponder = async (req, res) => {

  const { resourceCenterId, name, nic, contactNumber, email, type, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
      const fr = await FirstResponder.create({
      resourceCenterId,  
      name,
      nic,
      contactNumber,
      email,
      type,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(fr);
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'Strict' });
    res.cookie('userType', 'ADMIN', { sameSite: 'Strict' });

    res.json({
      message: 'Admin registered successfully',
      accessToken,
      refreshToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      admin: {
        id: fr.id,
        name: fr.name,
        email: fr.email,
        type: 'FIRST_RESPONDER',
        is_verified: fr.is_verified,
      },
    });
  } catch (error) {
    console.error('Sequelize error:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: error.message });
  }
};


// No separate end point for login FirstResponder, They will login using same login as admins

// Create a reusable function to get all first responders
const fetchAllFirstResponders = async () => {
  return await FirstResponder.findAll();
};

export const getAllFirstResponders = async (req, res) => {
  try {
    const frs = await fetchAllFirstResponders();
    res.json(frs);
  } catch (error) {
    console.error('Error fetching first responders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyFirstResponder = async (req, res) => {
  try {
    console.log(req.body);
    const { id, is_verified } = req.body;

    // Check if the first responder exists
    const fr = await FirstResponder.findByPk(id);
    if (!fr) return res.status(404).json({ error: 'FirstResponder not found' });

    // Update the is_verified field
    fr.is_verified = is_verified;
    await fr.save();

    const io = req.app.get('io');
    
    // Use the reusable fetch function
    const updatedfr = await fetchAllFirstResponders();
    
    io.emit('FRUpdated', updatedfr);

    res.json({ message: 'FirstResponder verified', fr });
  } catch (error) {
    console.error('Error verifying first responder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFirstResponderById = async (req, res) => {
  const fr = await FirstResponder.findByPk(req.params.id);
  if (!fr) return res.status(404).json({ error: 'FirstResponder not found' });
  res.json(fr);
};

export const updateFirstResponder = async (req, res) => {
  try {
    const fr = await FirstResponder.findByPk(req.params.id);
    if (!fr) return res.status(404).json({ error: 'FirstResponder not found' });

    await fr.update(req.body);
    res.json({ message: 'FirstResponder updated', fr });
  } catch (error) {
    console.error('Sequelize error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteFirstResponder = async (req, res) => {
  const fr = await FirstResponder.findByPk(req.params.id);
  if (!fr) return res.status(404).json({ error: 'FirstResponder not found' });

  await fr.destroy();
  res.json({ message: 'FirstResponder deleted' });
};

export const getFirstResponderProfile = async (req, res) => {
  try {
    const fr = await FirstResponder.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }  // Don't expose password
    });
    if (!fr) return res.status(404).json({ error: 'Admin not found' });

    res.json(fr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshFirstResponderToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, admin) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      { id: admin.id, type: admin.type },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );

    res.cookie('accessToken', newAccessToken, { httpOnly: true, sameSite: 'Strict' });
    res.json({ accessToken: newAccessToken });
  });
};
