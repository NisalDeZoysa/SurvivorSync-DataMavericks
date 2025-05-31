import Disaster from './Disaster.js';
import Admin from './admin.js';
import User from './user.js';
import DisasterRequest from './DisasterRequest.js';
import Resource from './Resource.js';
import ResourceCenter from './ResourceCenter.js';
import AllocatedResource from './AllocatedResource.js';
import FirstResponder from './FirstResponder.js';
import SafetyPrecaution from './SafetyPrecaution.js';




User.hasMany(DisasterRequest, { foreignKey: 'userId' });

Disaster.hasMany(SafetyPrecaution, { foreignKey: 'disasterId' });

DisasterRequest.hasMany(AllocatedResource, { foreignKey: 'disasterRequestId', onDelete: 'CASCADE' });
AllocatedResource.hasOne(ResourceCenter, { foreignKey: 'resourceCenterId' });

//DisasterRequest.hasOne(Disaster, { foreignKey: 'disasterId' });
//DisasterRequest.belongsTo(Disaster, { foreignKey: 'disasterId' });
DisasterRequest.belongsTo(Disaster, { foreignKey: 'disasterId' });
Disaster.hasMany(DisasterRequest, { foreignKey: 'disasterId' });

Resource.hasMany(ResourceCenter, { foreignKey: 'resourceId', onDelete: 'CASCADE' });
ResourceCenter.belongsTo(Resource, { foreignKey: 'resourceId' });

FirstResponder.belongsTo(ResourceCenter, { foreignKey: 'resourceCenterId' });



export  {
  Admin,
  Disaster,
  User,
  DisasterRequest,
  Resource,
  ResourceCenter,
  AllocatedResource,
  FirstResponder,
  SafetyPrecaution,
};

