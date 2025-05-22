const pool = require('../config/db');

// Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Create a new user
exports.createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );

    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    next(err);
  }
};

// Update a user by ID
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
