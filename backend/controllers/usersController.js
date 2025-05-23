const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Register new user
exports.registerUser = async (req, res) => {
  const { full_name, email, password, nic, contact_number, address, role } = req.body;

  if (!full_name || !email || !password || !nic || !role) {
    return res.status(400).json({ error: 'Full name, email, password, NIC, and role are required' });
  }

  const validRoles = ['admin', 'user', 'first_responder'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR nic = ?',
      [email, nic]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with email or NIC already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, nic, contact_number, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, nic, contact_number, address, role]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Login user and generate tokens
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in DB
    const [updateResult] = await pool.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, user.id]
    );

    if (updateResult.affectedRows === 0) {
      console.warn('Refresh token was not saved. User ID may be incorrect.');
    }

    res.json({
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Middleware to verify Access Token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied, token missing!' });

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });

    req.user = decoded;
    next();
  });
};

// Refresh Access Token using Refresh Token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ error: 'Refresh token is required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND refresh_token = ?',
      [decoded.id, refreshToken]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Refresh token invalid or revoked' });
    }

    const user = rows[0];
    const newAccessToken = generateAccessToken(user);

    res.json({
      accessToken: newAccessToken,
      expiresIn: 3600
    });
  } catch (err) {
    console.error('Refresh Token Error:', err);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

// Logout user (invalidate refresh token)
exports.logoutUser = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    await pool.query('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?', [refreshToken]);

    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [results] = await pool.query(
      'SELECT id, full_name, email, nic, contact_number, address, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
