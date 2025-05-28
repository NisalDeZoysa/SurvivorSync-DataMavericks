import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import UserRequest from './DisasterRequest.js';
import ResourceAvailability from './ResourceAvailability.js';
import DisasterRequest from './DisasterRequest.js'; 

const ResourceAllocation = sequelize.define('ResourceAllocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: UserRequest,
      key: 'id',
    },
  },
  ResourceAvailabilityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ResourceAvailability,
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  
  isAllocated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }, 
  disasterRequestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DisasterRequest', // Assuming DisasterRequest is defined elsewhere
      key: 'id',
    },
  }, 
}, {
  tableName: 'resource_allocations',
});



ResourceAllocation.belongsTo(UserRequest, { foreignKey: 'userRequestId' });

ResourceAllocation.belongsTo(ResourceAvailability, { foreignKey: 'ResourceAvailabilityId' });

ResourceAllocation.belongsTo(DisasterRequest, { foreignKey: 'disasterRequestId' });



export default ResourceAllocation;
