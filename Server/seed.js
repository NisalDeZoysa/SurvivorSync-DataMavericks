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
      name: "Nimal",
      userId: 1,
      disasterId: 1,
      severity: "HIGH",
      status: "PENDING",
      details: "Heavy flooding after continuous rain in low-lying areas.",
      affectedCount: 150,
      contactNo: "0771234567",
      latitude: 6.07929,
      longitude: 80.1914,
      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Kamalani",
      userId: 2,
      disasterId: 1,
      severity: "CRITICAL",
      status: "PENDING",
      details: "Seismic activity reported with strong tremors felt.",
      affectedCount: 300,
      contactNo: "0712345678",
      latitude: 6.00458,
      longitude: 80.20741,
      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Sunil",
      userId: 3,
      disasterId: 1,
      severity: "MEDIUM",
      status: "PENDING",
      details: "Fire in residential area controlled by fire brigade.",
      affectedCount: 4,
      contactNo: "0769876543",
      latitude: 6.04129,
      longitude: 80.13459,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Sunil",
      userId: 4,
      disasterId: 1,
      severity: "HIGH",
      status: "PENDING",
      details: "Forest fire spreading across dry regions.",
      affectedCount: 60,
      contactNo: "0701234567",
      latitude: 6.08810,
      longitude: 80.19386,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Dilani",
      userId: 5,
      disasterId: 1,
      severity: "MEDIUM",
      status: "PENDING",
      details: "Possible tsunami threat after offshore earthquake.",
      affectedCount: 0,
      contactNo: "0752233445",
      latitude: 6.04940,
      longitude: 80.21063,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Tharindu",
      userId: 1,
      disasterId: 1,
      severity: "HIGH",
      status: "PENDING",
      details: "Roads blocked due to major landslide.",
      affectedCount: 35,
      contactNo: "0745566778",
      latitude: 6.10707,
      longitude: 80.24088,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Nimal",
      userId: 1,
      disasterId: 2,
      severity: "CRITICAL",
      status: "PENDING",
      details: "Toxic chemical spill in industrial zone.",
      affectedCount: 25,
      contactNo: "0783456789",
      latitude: 6.10534,
      longitude: 80.11578,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Kamalani",
      userId: 2,
      disasterId: 2,
      severity: "HIGH",
      status: "PENDING",
      details: "Cyclonic winds expected within 48 hours.",
      affectedCount: 200,
      contactNo: "0719988776",
      latitude: 6.02069,
      longitude: 80.17222,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Sunil",
      userId: 3,
      disasterId: 2,
      severity: "HIGH",
      status: "PENDING",
      details: "Bridge collapsed due to heavy vehicle load.",
      affectedCount: 5,
      contactNo: "0791122334",
      latitude: 6.12026,
      longitude: 80.20413,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Dilani",
      userId: 4,
      disasterId: 2,
      severity: "MEDIUM",
      status: "PENDING",
      details: "Prolonged dry season affecting crops.",
      affectedCount: 400,
      contactNo: "0779988776",
      latitude: 6.09112,
      longitude: 80.23448,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Tharindu",
      userId: 5,
      disasterId: 2,
      severity: "LOW",
      status: "PENDING",
      details: "Multi-vehicle collision on highway.",
      affectedCount: 3,
      contactNo: "0704455667",
      latitude: 6.03809,
      longitude: 80.20729,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Tharindu",
      userId: 5,
      disasterId: 2,
      severity: "MEDIUM",
      status: "PENDING",
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
      name: "Tharindu",
      userId: 5,
      disasterId: 1,
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
      name: "Dilani",
      userId: 4,
      disasterId: 1,
      severity: "HIGH",
      status: "PENDING",
      details: "Large-scale fire in industrial facility.",
      affectedCount: 40,
      contactNo: "0745566778",
      latitude: 6.12026,
      longitude: 80.23448,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Nimal",
      userId: 1,
      disasterId: 1,
      severity: "MEDIUM",
      status: "PENDING",
      details: "City-wide blackout due to storm damage.",
      affectedCount: 500,
      contactNo: "0774433221",
      latitude: 6.09112,
      longitude: 80.23448,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Nimal",
      userId: 1,
      disasterId: 4,
      severity: "HIGH",
      status: "PENDING",
      details: "Oil spill near shipping yard threatening marine life.",
      affectedCount: 0,
      contactNo: "0786677885",
      latitude: 6.09112,
      longitude: 80.23448,

      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Nimal",
      userId: 1,
      disasterId: 4,
      severity: "HIGH",
      status: "PENDING",
      details: "Tornado observed tearing through village.",
      affectedCount: 60,
      contactNo: "0729988776",
      latitude: 6.03809,
      longitude: 80.20729,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Nimal",
      userId: 1,
      disasterId: 3,
      severity: "CRITICAL",
      status: "PENDING",
      details: "Collapse in gem mining area with workers trapped.",
      affectedCount: 12,
      contactNo: "0715566774",
      latitude: 6.03809,
      longitude: 80.20729,

      image: null,
      voice: null,
      isVerified: false,
    },
    {
      name: "Kamalani",
      userId: 2,
      disasterId: 3,
      severity: "LOW",
      status: "PENDING",
      details: "Unexpected dust storm with poor visibility.",
      affectedCount: 0,
      contactNo: "0771112233",
      latitude: 6.03809,
      longitude: 80.20729,
      image: null,
      voice: null,
      isVerified: true,
    },
    {
      name: "Kamalani",
      userId: 3,
      disasterId: 2,
      severity: "CRITICAL",
      status: "PENDING",
      details: "Old building collapse due to poor construction.",
      affectedCount: 8,
      contactNo: "0733322110",
      latitude: 6.10534,
      longitude: 80.11578,
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
      name: "Medical Center",
      lat: 	6.0732,
      long: 80.1027,
      district: "Galle",
      province: "Southern",
      count: 85,
      contactNumber: "+94-11-5550100",
      used: 23,
    },
    {
      resourceId: 2,
      name: "Rescue Base",
      lat: 6.1358,
      long: 80.1781,
      district: "Galle",
      province: "Southern",
      count: 72,
      contactNumber: "+94-91-5550101",
      used: 30,
    },
    {
      resourceId: 3,
      name: "Food Station",
      lat: 6.0355,
      long: 80.1264,
      district: "Galle",
      province: "Southern",
      count: 64,
      contactNumber: "+94-21-5550102",
      used: 15,
    },
    {
      resourceId: 4,
      name: "Army Post",
      lat: 6.0860,
      long: 80.2840,
      district: "Galle",
      province: "Southern",
      count: 88,
      contactNumber: "+94-81-5550103",
      used: 40,
    },
    {
      resourceId: 5,
      name: "Relief Camp",
      lat: 6.0513,
      long: 80.2331,
      district: "Galle",
      province: "Southern",
      count: 49,
      contactNumber: "+94-41-5550104",
      used: 20,
    },
    {
      resourceId: 6,
      name: "Supply Depot",
      lat: 6.1266,
      long: 80.2207,
      district: "Galle",
      province: "Southern",
      count: 91,
      contactNumber: "+94-33-5550105",
      used: 33,
    },
    {
      resourceId: 7,
      name: "First Aid",
      lat: 6.0928,
      long: 80.1073,
      district: "Galle",
      province: "Southern",
      count: 78,
      contactNumber: "+94-25-5550106",
      used: 18,
    },
    {
      resourceId: 8,
      name: "Water Point",
      lat: 	6.1225,
      long: 80.1376,
      district: "Galle",
      province: "Southern",
      count: 55,
      contactNumber: "+94-24-5550107",
      used: 12,
    },
    {
      resourceId: 9,
      name: "Shelter Zone",
      lat: 6.0617,
      long: 80.2670,
      district: "Galle",
      province: "Southern",
      count: 67,
      contactNumber: "+94-55-5550108",
      used: 21,
    },
    {
      resourceId: 10,
      name: "Command Center",
      lat: 6.0068,
      long: 80.1619,
      district: "Galle",
      province: "Southern",
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
