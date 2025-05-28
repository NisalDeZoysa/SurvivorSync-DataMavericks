import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AllocatedResource = sequelize.define('AllocatedResource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  disasterRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'disaster_requests', // Assuming DisasterRequest is defined elsewhere
      key: 'id',
    },
  }, 
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isAllocated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }, 
  
}, {
  tableName: 'allocated_resources',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default AllocatedResource;
