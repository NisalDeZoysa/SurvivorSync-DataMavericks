import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';
import ResourceAllocation from './ResourceAllocation.js';
import Disaster from './Disaster.js';

const DisasterRequest = sequelize.define('DisasterRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  disaterId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'disasters', 
      key: 'id',
    },
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
  },
  status:{
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
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
  district: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  province: {
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
  requestAllocationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
},{
  tableName: 'disaster_requests',
});







export default DisasterRequest;
