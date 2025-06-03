import sequelize from "./config/db.js";
import Disaster from "./models/Disaster.js";
import Resource from "./models/Resource.js";
import DisasterRequest from "./models/DisasterRequest.js";
import ResourceCenter from "./models/ResourceCenter.js";
import User from "./models/user.js";
import Admin from "./models/admin.js";
import FirstResponder from "./models/FirstResponder.js";

async function seedDatabase() {
  // Insert disasters
  await Disaster.bulkCreate([
    {
      name: "Flood",
      type: "natural",
      severity: "high",
      details: "Severe flooding due to heavy rains and river overflow",
    },
    {
      name: "Earthquake",
      type: "natural",
      severity: "critical",
      details: "Strong earthquake causing widespread damage",
    },
    {
      name: "HouseholdFire",
      type: "man-made",
      severity: "medium",
      details: "Fire incident in residential buildings",
    },
    {
      name: "Wildfire",
      type: "natural",
      severity: "high",
      details: "Forest fire spreading rapidly due to dry conditions",
    },
    //{ name: 'Tornado', type: 'natural', severity: 'high', details: 'Tornado causing destruction in affected areas' },
    //{ name: 'Chemical Spill', type: 'man-made', severity: 'critical', details: 'Hazardous chemical leakage in industrial zone' },
    {
      name: "Tsunami",
      type: "natural",
      severity: "medium",
      details: "Severe tsunami causing widespread damage",
    },
    {
      name: "Landslide",
      type: "natural",
      severity: "high",
      details: "Landslide",
    },
    { name: "Other", type: "natural", severity: "medium", details: "other" },
    //{ name: 'Industrial Fire', type: 'man-made', severity: 'high', details: 'Fire outbreak in factory or industrial plant' },
  ]);

  // Insert resources
  await Resource.bulkCreate([
    { type: "Human", name: "Emergency medical staff" },
    { type: "Human", name: "Search and rescue teams" },
    { type: "Human", name: "Crisis communications teams" },
    { type: "Material", name: "Bottled water" },
    { type: "Material", name: "Food rations" },
    { type: "Material", name: "First aid kits" },
    { type: "Financial", name: "Emergency relief funds" },
    { type: "Financial", name: "Housing assistance payments" },
    { type: "Financial", name: "Disaster pay provisions" },
    { type: "Equipment", name: "Radios and satellite phones" },
    { type: "Equipment", name: "Generators" },
    { type: "Equipment", name: "Fire extinguishers" },
    { type: "Facility", name: "Emergency shelters" },
    { type: "Facility", name: "Hospitals" },
    { type: "Facility", name: "Emergency operations centers" },
    { type: "Infrastructure", name: "Portable toilets" },
    { type: "Infrastructure", name: "Temporary bridges" },
    { type: "Infrastructure", name: "Waste management equipment" },
  ]);

    await User.bulkCreate([
    {
      name: "Nimal Perera",
      nic: "902345678V",
      address: "No. 12, Galle Road, Colombo 03",
      contactNumber: "0771234567",
      email: "nimal.perera@example.com",
      type: "victim",
      password: "hashedpassword1",
    },
    {
      name: "Kamalani Fernando",
      nic: "200245678901",
      address: "25/A, Station Road, Negombo",
      contactNumber: "0719876543",
      email: "kamalani.fernando@example.com",
      type: "victim",
      password: "hashedpassword2",
    },
    {
      name: "Sunil Jayawardena",
      nic: "801234567V",
      address: "45/2, Kandy Road, Kurunegala",
      contactNumber: "0751112233",
      email: "sunil.j@example.com",
      type: "victim",
      password: "hashedpassword3",
    },
    {
      name: "Dilani Rathnayake",
      nic: "991234567V",
      address: "10, Temple Lane, Anuradhapura",
      contactNumber: "0782223344",
      email: "dilani.r@example.com",
      type: "victim",
      password: "hashedpassword4",
    },
    {
      name: "Tharindu Senanayake",
      nic: "200134567890",
      address: "67/B, Lake View, Matara",
      contactNumber: "0763456789",
      email: "tharindu.s@example.com",
      type: "victim",
      password: "hashedpassword5",
    },
  ]);

  await DisasterRequest.bulkCreate([
    {
      name: "Flood in Galle",
      userId: 1,
      disasterId: 1,
      severity: "HIGH",
      status: "PENDING",
      details: "Heavy flooding after continuous rain in low-lying areas.",
      affectedCount: 150,
      contactNo: "0771234567",
      latitude: 6.0535,
      longitude: 80.221,
      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Earthquake in Kandy",
      userId: 2,
      disasterId: 2,
      severity: "CRITICAL",
      status: "IN_PROGRESS",
      details: "Seismic activity reported with strong tremors felt.",
      affectedCount: 300,
      contactNo: "0712345678",
      latitude: 7.2906,
      longitude: 80.6337,
      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "House fire in Colombo",
      userId: 3,
      disasterId: 3,
      severity: "MEDIUM",
      status: "COMPLETED",
      details: "Fire in residential area controlled by fire brigade.",
      affectedCount: 4,
      contactNo: "0769876543",
      latitude: 6.9271,
      longitude: 79.8612,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Wildfire in Monaragala",
      userId: 4,
      disasterId: 4,
      severity: "HIGH",
      status: "PENDING",
      details: "Forest fire spreading across dry regions.",
      affectedCount: 60,
      contactNo: "0701234567",
      latitude: 6.878,
      longitude: 81.3455,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Tsunami Alert in Trincomalee",
      userId: 5,
      disasterId: 5,
      severity: "MEDIUM",
      status: "IN_PROGRESS",
      details: "Possible tsunami threat after offshore earthquake.",
      affectedCount: 0,
      contactNo: "0752233445",
      latitude: 8.5874,
      longitude: 81.2152,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Landslide in Nuwara Eliya",
      userId: 1,
      disasterId: 1,
      severity: "HIGH",
      status: "COMPLETED",
      details: "Roads blocked due to major landslide.",
      affectedCount: 35,
      contactNo: "0745566778",
      latitude: 6.9497,
      longitude: 80.7891,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Chemical Spill in Biyagama",
      userId: 2,
      disasterId: 5,
      severity: "CRITICAL",
      status: "PENDING",
      details: "Toxic chemical spill in industrial zone.",
      affectedCount: 25,
      contactNo: "0783456789",
      latitude: 6.9776,
      longitude: 79.9708,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Cyclone Warning in Jaffna",
      userId: 3,
      disasterId: 5,
      severity: "HIGH",
      status: "IN_PROGRESS",
      details: "Cyclonic winds expected within 48 hours.",
      affectedCount: 200,
      contactNo: "0719988776",
      latitude: 9.6615,
      longitude: 80.0255,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Bridge Collapse in Matale",
      userId: 4,
      disasterId: 3,
      severity: "HIGH",
      status: "COMPLETED",
      details: "Bridge collapsed due to heavy vehicle load.",
      affectedCount: 5,
      contactNo: "0791122334",
      latitude: 7.4675,
      longitude: 80.6232,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Drought in Hambantota",
      userId: 4,
      disasterId: 2,
      severity: "MEDIUM",
      status: "PENDING",
      details: "Prolonged dry season affecting crops.",
      affectedCount: 400,
      contactNo: "0779988776",
      latitude: 6.1248,
      longitude: 81.1185,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Road Accident in Kurunegala",
      userId: 5,
      disasterId: 1,
      severity: "LOW",
      status: "COMPLETED",
      details: "Multi-vehicle collision on highway.",
      affectedCount: 3,
      contactNo: "0704455667",
      latitude: 7.4866,
      longitude: 80.3647,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Train Derailment in Polonnaruwa",
      userId: 3,
      disasterId: 5,
      severity: "MEDIUM",
      status: "IN_PROGRESS",
      details: "Train derailment near railway station.",
      affectedCount: 20,
      contactNo: "0756677889",
      latitude: 7.9403,
      longitude: 81.0188,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Gas Explosion in Ratnapura",
      userId: 4,
      disasterId: 2,
      severity: "CRITICAL",
      status: "PENDING",
      details: "Explosion in apartment due to gas leak.",
      affectedCount: 10,
      contactNo: "0765544332",
      latitude: 6.6828,
      longitude: 80.3998,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Fire in Industrial Zone",
      userId: 3,
      disasterId: 1,
      severity: "HIGH",
      status: "IN_PROGRESS",
      details: "Large-scale fire in industrial facility.",
      affectedCount: 40,
      contactNo: "0745566778",
      latitude: 6.9123,
      longitude: 79.9023,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Power Outage in Anuradhapura",
      userId: 4,
      disasterId: 1,
      severity: "MEDIUM",
      status: "PENDING",
      details: "City-wide blackout due to storm damage.",
      affectedCount: 500,
      contactNo: "0774433221",
      latitude: 8.3114,
      longitude: 80.4037,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Oil Spill in Colombo Port",
      userId: 3,
      disasterId: 1,
      severity: "HIGH",
      status: "IN_PROGRESS",
      details: "Oil spill near shipping yard threatening marine life.",
      affectedCount: 0,
      contactNo: "0786677885",
      latitude: 6.9495,
      longitude: 79.8487,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Tornado in Puttalam",
      userId: 3,
      disasterId: 1,
      severity: "HIGH",
      status: "PENDING",
      details: "Tornado observed tearing through village.",
      affectedCount: 60,
      contactNo: "0729988776",
      latitude: 8.0362,
      longitude: 79.8412,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Mine Collapse in Badulla",
      userId: 4,
      disasterId: 3,
      severity: "CRITICAL",
      status: "IN_PROGRESS",
      details: "Collapse in gem mining area with workers trapped.",
      affectedCount: 12,
      contactNo: "0715566774",
      latitude: 6.989,
      longitude: 81.055,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Other: Sudden Dust Storm",
      userId: 2,
      disasterId: 3,
      severity: "LOW",
      status: "COMPLETED",
      details: "Unexpected dust storm with poor visibility.",
      affectedCount: 0,
      contactNo: "0771112233",
      latitude: 7.75,
      longitude: 81.6,
      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Building Collapse in Kalutara",
      userId: 3,
      disasterId: 2,
      severity: "CRITICAL",
      status: "PENDING",
      details: "Old building collapse due to poor construction.",
      affectedCount: 8,
      contactNo: "0733322110",
      latitude: 6.5854,
      longitude: 79.9607,
      image: null,
      voice: null,
      isVerified: false,
    },
  ]);

  await Admin.bulkCreate([
  {
    name: "Inspector Wickramasinghe",
    NIC: "8012345618",
    contactNumber: "0771234561",
    email: "admin@gmail.com",
    description: "Head of local police operations",
    password: "1234"
  },
  {
    name: "Officer Janaka Perera",
    NIC: "7512345690",
    contactNumber: "0712345678",
    email: "admin2@gmail.com",
    description: "Disaster response coordinator - Southern Province",
    password: "adminpass1"
  },
  {
    name: "Chief Kamalini De Silva",
    NIC: "6812345678",
    contactNumber: "0723456789",
    email: "admin3@gmail.com",
    description: "National emergency response supervisor",
    password: "adminpass2"
  }
]
  );


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
    {
      resourceId: 1,
      name: "Colombo",
      lat: 6.9271,
      long: 79.8612,
      district: "Colombo",
      province: "Western",
      count: 85,
      contactNumber: "+94-11-5550100",
      used: 23,
    },
    {
      resourceId: 2,
      name: "Galle",
      lat: 6.0326,
      long: 80.217,
      district: "Galle",
      province: "Southern",
      count: 72,
      contactNumber: "+94-91-5550101",
      used: 30,
    },
    {
      resourceId: 3,
      name: "Jaffna",
      lat: 9.6615,
      long: 80.0255,
      district: "Jaffna",
      province: "Northern",
      count: 64,
      contactNumber: "+94-21-5550102",
      used: 15,
    },
    {
      resourceId: 4,
      name: "Kandy",
      lat: 7.2906,
      long: 80.6337,
      district: "Kandy",
      province: "Central",
      count: 88,
      contactNumber: "+94-81-5550103",
      used: 40,
    },
    {
      resourceId: 5,
      name: "Matara",
      lat: 6.139,
      long: 80.1031,
      district: "Matara",
      province: "Southern",
      count: 49,
      contactNumber: "+94-41-5550104",
      used: 20,
    },
    {
      resourceId: 6,
      name: "Gampaha",
      lat: 6.8449,
      long: 79.9042,
      district: "Gampaha",
      province: "Western",
      count: 91,
      contactNumber: "+94-33-5550105",
      used: 33,
    },
    {
      resourceId: 7,
      name: "Anuradhapura",
      lat: 7.8731,
      long: 80.7718,
      district: "Anuradhapura",
      province: "North Central",
      count: 78,
      contactNumber: "+94-25-5550106",
      used: 18,
    },
    {
      resourceId: 8,
      name: "vavuniya",
      lat: 8.3114,
      long: 80.4037,
      district: "Vavuniya",
      province: "Northern",
      count: 55,
      contactNumber: "+94-24-5550107",
      used: 12,
    },
    {
      resourceId: 9,
      name: "Badulla",
      lat: 6.8941,
      long: 81.056,
      district: "Badulla",
      province: "Uva",
      count: 67,
      contactNumber: "+94-55-5550108",
      used: 21,
    },
    {
      resourceId: 10,
      name: "Kurunegala",
      lat: 7.3336,
      long: 80.3858,
      district: "Kurunegala",
      province: "North Western",
      count: 95,
      contactNumber: "+94-37-5550109",
      used: 45,
    },
  ];

  await ResourceCenter.bulkCreate(resourceCentersData);

    await FirstResponder.bulkCreate([
  {
    name: "Inspector Wickramasinghe",
    nic: "801234561V",
    resourceCenterId: 1,
    address: "456 Police Station Road",
    contactNumber: "0771234561",
    email: "wick@example1.com",
    type: "police",
    description: "Head of local police operations",
    password: "SecurePass123"
  },
  {
    name: "Officer Nadeesha Silva",
    nic: "902345678V",
    resourceCenterId: 2,
    address: "123 Main Street, Galle",
    contactNumber: "0712345678",
    email: "nadeesha@example.com",
    type: "police",
    description: "Officer in charge of regional response unit",
    password: "StrongPass456"
  },
  {
    name: "Sergeant Dilan Jayasuriya",
    nic: "911234567V",
    resourceCenterId: 3,
    address: "78 Station Lane, Kandy",
    contactNumber: "0756781234",
    email: "dilan@example.com",
    type: "police",
    description: "Emergency deployment specialist",
    password: "SafePassword789"
  },
  {
    name: "Chief Inspector Suranga Perera",
    nic: "861234567V",
    resourceCenterId: 1,
    address: "99 Defense Avenue, Colombo",
    contactNumber: "0765432187",
    email: "suranga@example.com",
    type: "police",
    description: "Chief inspector of national coordination",
    password: "TopSecret321"
  },
  {
    name: "Officer Ishara Fernando",
    nic: "951234567V",
    resourceCenterId: 4,
    address: "12 Central Road, Matara",
    contactNumber: "0781234567",
    email: "ishara@example.com",
    type: "police",
    description: "Handles ground-level emergency coordination",
    password: "Secure456Pass"
  }
]);


  console.log("Seeding completed");
}

export default seedDatabase;
