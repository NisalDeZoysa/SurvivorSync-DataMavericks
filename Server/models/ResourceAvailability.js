import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ResourceCenter from './ResourceCenter.js';

const ResourceAvailability = sequelize.define('ResourceAvailability', {
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
  tableName: 'resource_availabilities',
});


export default ResourceAvailability;
