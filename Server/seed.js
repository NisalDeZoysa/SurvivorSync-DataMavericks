import sequelize from './config/db.js';
import Disaster from './models/Disaster.js';
import Resource from './models/Resource.js';
import ResourceCenter from './models/ResourceCenter.js';

async function seedDatabase() {
  // Insert disasters
  await Disaster.bulkCreate([
    { name: 'Flood', type: 'natural', severity: 'high', details: 'Severe flooding due to heavy rains and river overflow' },
    { name: 'Earthquake', type: 'natural', severity: 'critical', details: 'Strong earthquake causing widespread damage' },
    { name: 'Household Fire', type: 'man-made', severity: 'medium', details: 'Fire incident in residential buildings' },
    { name: 'Wildfire', type: 'natural', severity: 'high', details: 'Forest fire spreading rapidly due to dry conditions' },
    { name: 'Tornado', type: 'natural', severity: 'high', details: 'Tornado causing destruction in affected areas' },
    { name: 'Chemical Spill', type: 'man-made', severity: 'critical', details: 'Hazardous chemical leakage in industrial zone' },
    { name: 'Power Outage', type: 'man-made', severity: 'medium', details: 'Extended blackout due to grid failure' },
    { name: 'Cyber Attack', type: 'man-made', severity: 'high', details: 'Malicious cyber attack on critical infrastructure' },
    { name: 'Landslide', type: 'natural', severity: 'medium', details: 'Landslide blocking roads and damaging property' },
    { name: 'Industrial Fire', type: 'man-made', severity: 'high', details: 'Fire outbreak in factory or industrial plant' },
  ]);

  // Insert resources
  await Resource.bulkCreate([
    { type: 'Human', name: 'Emergency medical staff' },
    { type: 'Human', name: 'Search and rescue teams' },
    { type: 'Human', name: 'Crisis communications teams' },
    { type: 'Material', name: 'Bottled water' },
    { type: 'Material', name: 'Food rations' },
    { type: 'Material', name: 'First aid kits' },
    { type: 'Financial', name: 'Emergency relief funds' },
    { type: 'Financial', name: 'Housing assistance payments' },
    { type: 'Financial', name: 'Disaster pay provisions' },
    { type: 'Equipment', name: 'Radios and satellite phones' },
    { type: 'Equipment', name: 'Generators' },
    { type: 'Equipment', name: 'Fire extinguishers' },
    { type: 'Facility', name: 'Emergency shelters' },
    { type: 'Facility', name: 'Hospitals' },
    { type: 'Facility', name: 'Emergency operations centers' },
    { type: 'Infrastructure', name: 'Portable toilets' },
    { type: 'Infrastructure', name: 'Temporary bridges' },
    { type: 'Infrastructure', name: 'Waste management equipment' },
  ]);

  // Fetch resources to get their IDs for resource centers
  const resources = await Resource.findAll();

  // Insert resource centers
  const resourceCentersData = [];
  for (let i = 0; i < 10; i++) {
    const resource = resources[i % resources.length];
    resourceCentersData.push({
      resourceId: resource.id,
      lat: 20 + Math.random() * 10,
      long: 70 + Math.random() * 10,
      count: Math.floor(Math.random() * 100) + 1,
      contactNumber: `+1-555-010${i}`,
    });
  }
  await ResourceCenter.bulkCreate(resourceCentersData);

  console.log('Seeding completed');
}

export default seedDatabase;
