import Disaster from './Disaster.js';
import User from './User.js';
import DisasterRequest from './DisasterRequest.js';
import Resource from './Resource.js';
import ResourceCenter from './ResourceCenter.js';
import AvailableResource from './AvailableResource.js';
import AllocatedResource from './ResourceAllocation.js';
import FirstResponder from './FirstResponder.js';
import SafetyPrecaution from './SafetyPrecaution.js';


User.hasMany(DisasterRequest, { foreignKey: 'userId' });
DisasterRequest.belongsTo(User, { foreignKey: 'userId' });


Disaster.hasMany(SafetyPrecaution, { foreignKey: 'disasterId' });

AllocatedResource.belongsTo(DisasterRequest, { foreignKey: 'disasterRequestId' });
DisasterRequest.hasMany(AllocatedResource, {foreignKey: 'requestAllocationId', onDelete: 'CASCADE'});


DisasterRequest.belongsTo(Disaster, { foreignKey: 'disasterId' });

AllocatedResource.belongsTo(DisasterRequest, { foreignKey: 'userRequestId' });

AllocatedResource.belongsTo(AvailableResource, { foreignKey: 'ResourceAvailabilityId' });


AvailableResource.belongsTo(ResourceCenter, { foreignKey: 'resourceCenterId' });

Resource.hasMany(ResourceCenter, { foreignKey: 'resourceId', onDelete: 'CASCADE' });

ResourceCenter.belongsTo(Resource, { foreignKey: 'resourceId' });

ResourceCenter.hasMany(AvailableResource, { foreignKey: 'id', onDelete: 'CASCADE' });

FirstResponder.belongsTo(ResourceCenter, { foreignKey: 'resourceCenterId' });

SafetyPrecaution.belongsTo(Disaster, { foreignKey: 'disasterId' });

export default {
  Disaster,
  User,
  DisasterRequest,
  Resource,
  ResourceCenter,
  AvailableResource,
  AllocatedResource,
  FirstResponder,
  SafetyPrecaution
};

