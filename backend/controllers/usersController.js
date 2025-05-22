const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Register new user
exports.registerUser = async (req, res) => {
  const { full_name, email, password, nic, contact_number, address } = req.body;

  if (!full_name || !email || !password || !nic) {
    return res.status(400).json({ error: 'Full name, email, password, and NIC are required' });
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
      'INSERT INTO users (full_name, email, password, nic, contact_number, address) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, nic, contact_number, address]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Login user and generate JWT
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

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied, token missing!' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });

    req.user = decoded;
    next();
  });
};

// Get user profile (protected)
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [results] = await pool.query(
      'SELECT id, full_name, email, nic, contact_number, address, created_at FROM users WHERE id = ?',
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
