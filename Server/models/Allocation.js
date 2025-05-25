import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ResourceCenter from './ResourceCenter.js';
import UserRequest from './UserRequest.js';

const Allocation = sequelize.define('Allocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  resourceCenterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ResourceCenter,
      key: 'id',
    },
  },
  userRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserRequest,
      key: 'id',
    },
  }
}, {
  tableName: 'allocations',
});

ResourceCenter.hasMany(Allocation, { foreignKey: 'resourceCenterId' });
UserRequest.hasMany(Allocation, { foreignKey: 'userRequestId' });

Allocation.belongsTo(ResourceCenter, { foreignKey: 'resourceCenterId' });
Allocation.belongsTo(UserRequest, { foreignKey: 'userRequestId' });

export default Allocation;
