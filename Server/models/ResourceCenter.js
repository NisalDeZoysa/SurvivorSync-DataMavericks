import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Resource from './Resource.js';

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

Resource.hasMany(ResourceCenter, { foreignKey: 'resourceId', onDelete: 'CASCADE' });
ResourceCenter.belongsTo(Resource, { foreignKey: 'resourceId' });

export default ResourceCenter;
