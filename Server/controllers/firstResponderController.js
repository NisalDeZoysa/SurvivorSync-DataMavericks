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
  const { resourceCenterId, name, nic, contactNumber, email, type, password, is_verified } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
      const fr = await FirstResponder.create({
      resourceCenterId,  
      name,
      nic,
      contactNumber,
      email,
      type,
      is_verified,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(admin);
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

export const loginFirstResponder = async (req, res) => {
  const { email, password } = req.body;

  try {
    const fr = await FirstResponder.findOne({ where: { email } });
    if (!fr) return res.status(404).json({ error: 'FirstResponder not found' });

    const match = await bcrypt.compare(password, fr.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(fr);
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'Strict' });
    res.cookie('userType', 'FIRST_RESPONDER', { sameSite: 'Strict' });

    res.json({
      message: 'FirstResponder logged in successfully',
      accessToken,
      refreshToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      first_responder: {
        id: fr.id,
        name: fr.name,
        email: fr.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllFirstResponders = async (req, res) => {
  const frs = await FirstResponder.findAll();
  res.json(frs);
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
