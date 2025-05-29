import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ResourceCenter = sequelize.define('ResourceCenter', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'resources',
      key: 'id',
    },
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
  }
}, {
  tableName: 'resource_centers',
});


export default ResourceCenter;
