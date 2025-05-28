// seed.js

import { Admin, AllocatedResource, AvailableResource,Disaster,DisasterRequest,FirstResponder,
    Resource, ResourceCenter, SafetyPrecaution, User, AvailableAllocatedResource
 } from './models/index.js';


// async function seedDatabase() {
//   const models = [
//     { model: Admin, name: 'Admin' },
//     { model: DisasterRequest, name: 'DisasterRequest' },
//     { model: User, name: 'User' },
//     { model: Disaster, name: 'Disaster' },
//     { model: Resource, name: 'Resource' },
//     { model: AllocatedResource, name: 'AllocatedResource' },
//     { model: AvailableResource, name: 'AvailableResource' },
//     { model: FirstResponder, name: 'FirstResponder' },
//     { model: ResourceCenter, name: 'ResourceCenter' },
//     { model: SafetyPrecaution, name: 'SafetyPrecaution' },

//   ];

//   for (const { model, name } of models) {
//     const count = await model.count();
//     if (count === 0) {
//       const dummyData = Array.from({ length: 10 }, (_, i) => ({
//         name: `${name} ${i + 1}`, // Replace with actual fields for your model
//       }));

//       try {
//         await model.bulkCreate(dummyData);
//         console.log(`✅ Seeded 10 records for ${name}`);
//       } catch (err) {
//         console.error(`❌ Failed to seed ${name}:`, err.message);
//       }
//     } else {
//       console.log(`🔸 ${name} already has ${count} records`);
//     }
//   }
// }

async function seedDatabase() {
  // 1. Create Admins
  const admins = await Admin.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      name: `Admin ${i + 1}`,
      contactNumber: `07700000${i}`,
      email: `admin${i + 1}@example.com`,
      description: `Description for Admin ${i + 1}`,
      password: `password${i + 1}`,
    }))
  );

  console.log('Admin completed!');

  // 2. Create Disasters
  const disasters = await Disaster.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      name: `Disaster ${i + 1}`,
      type: ['natural', 'man-made', 'other'][i % 3],
      severity: ['low', 'medium', 'high', 'critical'][i % 4],
      details: `Details of disaster ${i + 1}`,
      description: `Description of disaster ${i + 1}`,
    }))
  );

  console.log('Disaster completed!');

  // 3. Create Users (victims/volunteers)
  const users = await User.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      name: `User ${i + 1}`,
      NIC: `12345678${i}V`, // simple NIC format for example
      address: `Address ${i + 1}`,
      contactNumber: `07123456${i}`,
      email: `user${i + 1}@example.com`,
      type: i % 2 === 0 ? 'victim' : 'volunteer',
      password: `password${i + 1}`,
    }))
  );

    console.log('User completed!');

  // 4. Create Resources
  const resources = await Resource.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      type: `Type ${i + 1}`,
      name: `Resource ${i + 1}`,
    }))
  );

    console.log('Resource completed!');

  // 5. Create ResourceCenters (need resourceId FK)
  const resourceCenters = await ResourceCenter.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      resourceId: resources[i % resources.length].id,
      lat: 6.9 + i * 0.01,
      long: 79.8 + i * 0.01,
      count: 10 + i,
      contactNumber: `07110000${i}`,
    }))
  );

    console.log('ResourceCenter completed!');
  // 6. Create AvailableResources (need resourceCenterId FK)
  const availableResources = await AvailableResource.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      resourceCenterId: resourceCenters[i % resourceCenters.length].id,
      type: `AvailableType ${i + 1}`,
      amount: 100 + i * 5,
    }))
  );

    console.log('AvailableResource completed!');

  // 7. Create DisasterRequests (need userId and disasterId FK)
  const disasterRequests = await DisasterRequest.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      name: `Request ${i + 1}`,
      userId: users[i % users.length].id,
      disasterId: disasters[i % disasters.length].id,
      severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4],
      status: 'PENDING',
      details: `Details for request ${i + 1}`,
      affectedCount: 10 + i,
      contactNo: `07120000${i}`,
      latitude: 6.9 + i * 0.01,
      longitude: 79.8 + i * 0.01,
      district: `District ${i + 1}`,
      province: `Province ${i + 1}`,
      time: new Date(),
    }))
  );

    console.log('DisasterRequest completed!');

  // 8. Create AllocatedResources (need disasterRequestId FK)
  const allocatedResources = await AllocatedResource.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      disasterRequestId: disasterRequests[i % disasterRequests.length].id,
      amount: 50 + i * 2,
      isAllocated: i % 2 === 0,
    }))
  );

    console.log('AllocatedResource completed!');

  // 9. Create FirstResponders (need resourceCenterId FK)
  const firstResponders = await FirstResponder.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      resourceCenterId: resourceCenters[i % resourceCenters.length].id,
      name: `Responder ${i + 1}`,
      NIC: `98765432${i}V`,
      contactNumber: `07230000${i}`,
      email: `responder${i + 1}@example.com`,
      type: ['Police', 'Army', 'Hospital', 'Redcross', 'NGO', 'Government', 'Other'][i % 7],
      password: `password${i + 1}`,
    }))
  );

    console.log('FirstResponder completed!');

  // 10. Create SafetyPrecautions (need disasterId FK)
  const safetyPrecautions = await SafetyPrecaution.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
      description: `Safety precaution ${i + 1}`,
      disasterId: disasters[i % disasters.length].id,
    }))
  );

    console.log('SafetyPrecaution completed!');

  // 11. Create AvailableAllocatedResources (join table between allocatedResources and availableResources)
  // We'll create 10 relations by pairing the first 10 allocatedResources and availableResources by index
  const availableAllocatedResources = await AvailableAllocatedResource.bulkCreate(
    Array.from({ length: 10 }).map((_, i) => ({
        // id: i + 1, // Assuming id is auto-incremented
      allocatedResourceId: allocatedResources[i % allocatedResources.length].id,
      availableResourceId: availableResources[i % availableResources.length].id,
    }))
  );

    console.log('AvailableAllocatedResource completed!');

  
}

export default seedDatabase;
