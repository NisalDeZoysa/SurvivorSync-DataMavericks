import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AllocatedResource = sequelize.define('ResourceAllocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ResourceAvailabilityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'resource_availabilities', // Assuming ResourceAvailability is defined elsewhere
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
  disasterRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'disaster_requests', // Assuming DisasterRequest is defined elsewhere
      key: 'id',
    },
  }, 
}, {
  tableName: 'allocated_resources',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default AllocatedResource;
