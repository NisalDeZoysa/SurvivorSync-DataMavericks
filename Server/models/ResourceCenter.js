import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Resource from './Resource.js';
import ResourceAvailability from './AvailableResource.js';
import FirstResponder from './FirstResponder.js';

const ResourceCenter = sequelize.define('ResourceCenter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  long: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'resources', 
      key: 'id',
    },
  },
}, {
  tableName: 'resource_centers',
});


export default ResourceCenter;
