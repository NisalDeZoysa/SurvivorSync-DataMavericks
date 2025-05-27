import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Allocation from './Allocation.js';

const Availability = sequelize.define('Availability', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  allocatedResourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Allocation,
      key: 'id',
    },
    unique: true, // One availability per allocation
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'availabilities',
});

Allocation.hasOne(Availability, { foreignKey: 'allocatedResourceId' });
Availability.belongsTo(Allocation, { foreignKey: 'allocatedResourceId' });

export default Availability;
