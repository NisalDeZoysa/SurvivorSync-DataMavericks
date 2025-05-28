import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Resource from './Resource.js';
import ResourceAvailability from './ResourceAvailability.js';
import FirstResponders from './FirstResponders.js';

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
  },
}, {
  tableName: 'resource_centers',
});

ResourceCenter.hasMany(FirstResponders, { foreignKey: 'id', onDelete: 'CASCADE' });
ResourceCenter.belongsTo(Resource, { foreignKey: 'resourceId' });
ResourceCenter.hasMany(ResourceAvailability, { foreignKey: 'id', onDelete: 'CASCADE' });

export default ResourceCenter;
