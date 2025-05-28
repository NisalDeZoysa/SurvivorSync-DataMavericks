import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ResourceCenter from './ResourceCenter.js';


const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'resources',
});

Resource.hasMany(ResourceCenter, { foreignKey: 'id', onDelete: 'CASCADE' });


export default Resource;
