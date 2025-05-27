import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.js';

const UserRequest = sequelize.define('UserRequest', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('FLOOD', 'FIRE', 'EARTHQUAKE', 'LANDSLIDE', 'OTHER'),
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  affectedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contactNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  voice: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

User.hasMany(UserRequest, { foreignKey: 'userId' });
UserRequest.belongsTo(User, { foreignKey: 'userId' });

export default UserRequest;
