import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {User} from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      role: 'user',         
      type: user.type        
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};


export const register = async (req, res) => {
  const { name, NIC, address, contactNumber, email, type, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      NIC,
      address,
      contactNumber,
      email,
      type,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'Strict' });
    res.cookie('userType', 'USER', { sameSite: 'Strict' });

    res.json({
      message: 'Registered successfully',
      accessToken,
      refreshToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    });

    console.log('User registered Succusfully');
  } catch (error) {
    console.error('Sequelize error:', error);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      // Send array of validation error messages to client for better debugging
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'Strict' });
    res.cookie('userType', 'USER', { sameSite: 'Strict' });

    res.json({
      message: 'Logged in successfully',
      accessToken,
      refreshToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

export const getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

export const updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  await user.update(req.body);
  res.json({ message: 'User updated', user });
};

export const deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  await user.destroy();
  res.json({ message: 'User deleted' });
};
export const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = jwt.sign(
      { id: user.id, type: user.type },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );

    res.cookie('accessToken', newAccessToken, { httpOnly: true, sameSite: 'Strict' });
    res.json({ accessToken: newAccessToken });
  });
};

export const getVolunteerCount = async (req, res) => {
  try {
    const count = await User.count({
      where: { type: 'volunteer' }
    });

    res.json({ volunteerCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};