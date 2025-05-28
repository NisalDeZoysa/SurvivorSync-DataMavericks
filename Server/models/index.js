import { Sequelize } from 'sequelize';
import sequelize from '../config/db.js';
import Disaster from './Disaster.js';
import User from './User.js';
import DisasterRequest from './DisasterRequest.js';
import Resource from './Resource.js';
import ResourceCenter from './ResourceCenter.js';
import ResourceAvailability from './ResourceAvailability.js';
import ResourceAllocation from './ResourceAllocation.js';
import FirstResponder from './FirstResponder.js';
import SafetyPrecaution from './SafetyPrecaution.js';


User.hasMany(DisasterRequest, { foreignKey: 'userId' });
DisasterRequest.belongsTo(User, { foreignKey: 'userId' });


Disaster.hasMany(SafetyPrecaution, { foreignKey: 'disasterId' });

ResourceAllocation.belongsTo(DisasterRequest, { foreignKey: 'disasterRequestId' });
DisasterRequest.hasMany(ResourceAllocation, {foreignKey: 'requestAllocationId', onDelete: 'CASCADE'});


DisasterRequest.belongsTo(Disaster, { foreignKey: 'disaterId' });

ResourceAllocation.belongsTo(DisasterRequest, { foreignKey: 'userRequestId' });

ResourceAllocation.belongsTo(ResourceAvailability, { foreignKey: 'ResourceAvailabilityId' });


ResourceAvailability.belongsTo(ResourceCenter, { foreignKey: 'resourceCenterId' });

Resource.hasMany(ResourceCenter, { foreignKey: 'resourceId', onDelete: 'CASCADE' });

ResourceCenter.belongsTo(Resource, { foreignKey: 'resourceId' });
ResourceCenter.hasMany(ResourceAvailability, { foreignKey: 'id', onDelete: 'CASCADE' });

FirstResponder.belongsTo(ResourceCenter, { foreignKey: 'resourceCenterId' });

SafetyPrecaution.belongsTo(Disaster, { foreignKey: 'disasterId' });

export default {
  Disaster,
  User,
  DisasterRequest,
  Resource,
  ResourceCenter,
  ResourceAvailability,
  ResourceAllocation,
  FirstResponder,
  SafetyPrecaution
};

