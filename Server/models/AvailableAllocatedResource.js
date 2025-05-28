import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AvailableAllocatedResource = sequelize.define('AvailableAllocatedResource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  allocatedResourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'allocated_resources',
      key: 'id',
    },
  },
    availableResourceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'available_resources', 
        key: 'id',
        },
    },

}, {
  tableName: 'available_allocated_resources',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default AvailableAllocatedResource;