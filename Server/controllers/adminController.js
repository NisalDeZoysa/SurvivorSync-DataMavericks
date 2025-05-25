import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import dotenv from 'dotenv';
dotenv.config();

const generateTokens = (admin) => {
  const accessToken = jwt.sign(
    {
      id: admin.id,
      role: 'admin',        
      type: admin.type       
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

export const registerAdmin = async (req, res) => {
  const { name, NIC, address, contactNumber, email, type, description, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name,
      NIC,
      address,
      contactNumber,
      email,
      type,
      description,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(admin);
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'Strict' });

    res.json({
      message: 'Admin registered successfully',
      accessToken,
      refreshToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        type: admin.type,
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

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(admin);
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'Strict' });

    res.json({
      message: 'Admin logged in successfully',
      accessToken,
      refreshToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        type: admin.type,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  const admins = await Admin.findAll();
  res.json(admins);
};

export const getAdminById = async (req, res) => {
  const admin = await Admin.findByPk(req.params.id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json(admin);
};

export const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    await admin.update(req.body);
    res.json({ message: 'Admin updated', admin });
  } catch (error) {
    console.error('Sequelize error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  const admin = await Admin.findByPk(req.params.id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });

  await admin.destroy();
  res.json({ message: 'Admin deleted' });
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }  // Don't expose password
    });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshAdminToken = (req, res) => {
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
