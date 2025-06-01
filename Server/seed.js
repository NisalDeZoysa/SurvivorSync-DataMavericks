import sequelize from './config/db.js';
import Disaster from './models/Disaster.js';
import Resource from './models/Resource.js';
import ResourceCenter from './models/ResourceCenter.js';

async function seedDatabase() {
  // Insert disasters
  await Disaster.bulkCreate([
    { name: 'Flood', type: 'natural', severity: 'high', details: 'Severe flooding due to heavy rains and river overflow' },
    { name: 'Earthquake', type: 'natural', severity: 'critical', details: 'Strong earthquake causing widespread damage' },
    { name: 'HouseholdFire', type: 'man-made', severity: 'medium', details: 'Fire incident in residential buildings' },
    { name: 'Wildfire', type: 'natural', severity: 'high', details: 'Forest fire spreading rapidly due to dry conditions' },
    //{ name: 'Tornado', type: 'natural', severity: 'high', details: 'Tornado causing destruction in affected areas' },
    //{ name: 'Chemical Spill', type: 'man-made', severity: 'critical', details: 'Hazardous chemical leakage in industrial zone' },
    { name: 'Tsunami', type: 'natural', severity: 'medium', details: 'Severe tsunami causing widespread damage' },
    { name: 'Landslide', type: 'natural', severity: 'high', details: 'Landslide' },
    { name: 'Other', type: 'natural', severity: 'medium', details: 'other' },
    //{ name: 'Industrial Fire', type: 'man-made', severity: 'high', details: 'Fire outbreak in factory or industrial plant' },
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

  const centerLat = 6.81;
  const centerLong = 79.87;
  const radiusInKm = 25;

  function getRandomLatLong(centerLat, centerLong, radiusInKm) {
    const radiusInDegrees = radiusInKm / 111; // Rough conversion: 1 degree latitude ~111km

    // Random distance and angle
    const u = Math.random();
    const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    // Adjust longitude based on latitude
    const newLat = centerLat + y;
    const newLong = centerLong + x / Math.cos(centerLat * (Math.PI / 180));

    return { lat: newLat, long: newLong };
  }

  const resources = await Resource.findAll();

  const resourceCentersData = [
    { resourceId: 1, name: "Resource Center 1", lat: 6.9271, long: 79.8612, district: "Colombo", province: "Western", count: 85, contactNumber: "+94-11-5550100", used: 23 },
    { resourceId: 2, name: "Resource Center 2", lat: 6.0326, long: 80.2170, district: "Galle", province: "Southern", count: 72, contactNumber: "+94-91-5550101", used: 30 },
    { resourceId: 3, name: "Resource Center 3", lat: 9.6615, long: 80.0255, district: "Jaffna", province: "Northern", count: 64, contactNumber: "+94-21-5550102", used: 15 },
    { resourceId: 4, name: "Resource Center 4", lat: 7.2906, long: 80.6337, district: "Kandy", province: "Central", count: 88, contactNumber: "+94-81-5550103", used: 40 },
    { resourceId: 5, name: "Resource Center 5", lat: 6.1390, long: 80.1031, district: "Matara", province: "Southern", count: 49, contactNumber: "+94-41-5550104", used: 20 },
    { resourceId: 6, name: "Resource Center 6", lat: 6.8449, long: 79.9042, district: "Gampaha", province: "Western", count: 91, contactNumber: "+94-33-5550105", used: 33 },
    { resourceId: 7, name: "Resource Center 7", lat: 7.8731, long: 80.7718, district: "Anuradhapura", province: "North Central", count: 78, contactNumber: "+94-25-5550106", used: 18 },
    { resourceId: 8, name: "Resource Center 8", lat: 8.3114, long: 80.4037, district: "Vavuniya", province: "Northern", count: 55, contactNumber: "+94-24-5550107", used: 12 },
    { resourceId: 9, name: "Resource Center 9", lat: 6.8941, long: 81.0560, district: "Badulla", province: "Uva", count: 67, contactNumber: "+94-55-5550108", used: 21 },
    { resourceId: 10, name: "Resource Center 10", lat: 7.3336, long: 80.3858, district: "Kurunegala", province: "North Western", count: 95, contactNumber: "+94-37-5550109", used: 45 },
  ];


  await ResourceCenter.bulkCreate(resourceCentersData);
  

  console.log('Seeding completed');

}

export default seedDatabase;
