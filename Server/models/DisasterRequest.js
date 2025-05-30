import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';


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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users', 
      key: 'id',
    },
  },
  disasterId: {
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
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  voice: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
},{
  tableName: 'disaster_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});







export default DisasterRequest;
