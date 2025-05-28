import Disaster from './Disaster.js';
import Admin from './admin.js';
import User from './user.js';
import DisasterRequest from './DisasterRequest.js';
import Resource from './Resource.js';
import ResourceCenter from './ResourceCenter.js';
import AvailableResource from './AvailableResource.js';
import AllocatedResource from './AllocatedResource.js';
import FirstResponder from './FirstResponder.js';
import SafetyPrecaution from './SafetyPrecaution.js';
import AvailableAllocatedResource from './AvailableAllocatedResource.js';




User.hasMany(DisasterRequest, { foreignKey: 'userId' });

Disaster.hasMany(SafetyPrecaution, { foreignKey: 'disasterId' });

DisasterRequest.hasMany(AllocatedResource, {foreignKey: 'disasterRequestId', onDelete: 'CASCADE'});

DisasterRequest.hasOne(Disaster, { foreignKey: 'disasterId' });

AvailableResource.belongsTo(ResourceCenter, { foreignKey: 'resourceCenterId' });

Resource.hasMany(ResourceCenter, { foreignKey: 'resourceId', onDelete: 'CASCADE' });

FirstResponder.belongsTo(ResourceCenter, { foreignKey: 'resourceCenterId' });

AllocatedResource.belongsToMany(AvailableResource, {
  through: 'available_allocated_resources',
  foreignKey: 'allocatedResourceId',
  otherKey: 'availableResourceId'
});

AvailableResource.belongsToMany(AllocatedResource, {
  through: 'available_allocated_resources',
  foreignKey: 'availableResourceId',
  otherKey: 'allocatedResourceId'
});



export  {
  Admin,
  Disaster,
  User,
  DisasterRequest,
  Resource,
  ResourceCenter,
  AvailableResource,
  AllocatedResource,
  FirstResponder,
  SafetyPrecaution,
  AvailableAllocatedResource
};

