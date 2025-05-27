import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Disaster = sequelize.define('Disaster', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('natural', 'man-made', 'other'),
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'disasters',
  timestamps: true
});

export default Disaster;
