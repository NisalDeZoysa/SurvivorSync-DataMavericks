import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ResourceCenter from './ResourceCenter.js';

const AvailableResource = sequelize.define('AvailableResource', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  resourceCenterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'resource_centers', // Assuming ResourceCenter is defined elsewhere
      key: 'id',
    },
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'available_resources',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});


export default AvailableResource;
