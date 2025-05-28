import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import SafetyPrecaution from './SafetyPrecaution.js';

const Disaster = sequelize.define('Disaster', {
  id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
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
  },
  describtion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'disasters',
  timestamps: true
});

Disaster.hasMany(SafetyPrecaution, { foreignKey: 'disasterId' });

export default Disaster;
