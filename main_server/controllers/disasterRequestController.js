import { DisasterRequest, Disaster, User } from "../models/index.js";
import Sequelize from 'sequelize';
import { getDisasterById } from "./disasterController.js";
import { sendMessage } from "./whatsAppConroller.js";
import dotenv from 'dotenv';

dotenv.config();
const AGENTAPI_URL = process.env.AGENTAPI_URL;

export const createUserRequest = async (req, res) => {
  let {
    name,
    userId,
    disasterId,
    severity,
    details,
    affectedCount,
    contactNo,
    latitude,
    longitude,
  } = req.body;

  // convert latitude and longitude to numbers
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  userId = parseInt(userId);
  disasterId = parseInt(disasterId);
  affectedCount = parseInt(affectedCount);


  // Province and district extracted from address
  let province = "";
  let district = "";
  if (!latitude && !longitude) {
    // return error
    return res.status(400).json({
      error: "Latitude and longitude are required to determine location",
    });

  } else {
    console.log(
      "Fetching province/district from coordinates:",
      latitude,
      longitude
    );
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "SurvivorSync/1.0 (dinukpkcc@gmail.com)", // Required by Nominatim usage policy
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch province/district from coordinates");
      }
      const responseData = await response.json();

      // console.log("Nominatim response data:", responseData);

      // Update province and district if found
      province = responseData.address?.state || responseData.address?.country || "Unknown";
      district = responseData.address?.state_district || responseData.address?.county || "Unknown";
    } catch (err) {
      console.warn("Failed to fetch province/district from coordinates", err);

    }
  }

  console.log("Request body:", req.body);
  console.log('Voice file:', req.files?.voice);

  // Since only one image is allowed, pick the first file's path as a string
  const imageFile = req.files?.image?.[0]?.path || null;
  const voiceFile = req.files?.voice?.[0]?.path || null;

  console.log("Image file path:", imageFile);
  console.log("Voice file path:", voiceFile);

  const request = await DisasterRequest.create({
    name,
    userId,
    disasterId,
    severity,
    details,
    affectedCount,
    contactNo,
    latitude,
    longitude,
    image: imageFile,
    voice: voiceFile,
    district,
    province
  });

  // Get disaster name
  const disaster = await Disaster.findByPk(disasterId);

  console.log("Disaster ID:", disaster.dataValues.name);

  const io = req.app.get('io');

  // Fetch updated stats data (not route handler)
  const updatedStats = await fetchDisasterStatsData();

  // Emit updated stats to clients
  io.emit('disasterStatsUpdated', updatedStats);
  // call gateway_server to get a response
  const messageText = `
      User ID: ${request.userId}
      Disaster: ${disaster.dataValues.name}
      Disaster ID: ${request.disasterId}
      Request Id: ${request.id}
      Severity: ${request.severity}
      Details: ${request.details}
      Affected Count: ${request.affectedCount}
      Contact No: ${request.contactNo}
      Location: Latitude ${request.latitude}, Longitude ${request.longitude}
      District: ${request.district}
      Province: ${request.province}
      Image_path: Server/${request.image}
      Voice_path: Server/${request.voice}
      `;

  // //  // Call gateway server
  const gatewayResponse = await fetch(`http://localhost:8000/ai_workflow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: {
       message : messageText.trim()
      }
    }),
  });

  // 1. Get the parsed JSON response
  const gatewayData = await gatewayResponse.json();
  console.log("Gateway Response:", JSON.stringify(gatewayData, null, 2));

  // 2. Extract required fields from workflow_result
  const workflow = gatewayData.state || {};
  const allocated = workflow.allocated_resources || {};

  const resourceCenterIds = allocated.resource_center_ids || [];
  const disasterStatus = workflow.disaster_status || "PENDING";
  const status = workflow.status || "INVALID";
  const userMsg = workflow.user_msg.message || "We are doing our best to help! Our team is reviewing your request.";
  console.log("\nResource Center IDs:", resourceCenterIds);

  //await sendMessage(request.contactNo, userMsg);
  // Include gateway response in your final output if needed
  res.status(201).json({
    message: "User request created",
    success: true,
    request,
    // completeResponse:{
    //   gatewayData
    // },
    gatewayResponse: {
      resource_center_ids: resourceCenterIds,
      disaster_status: disasterStatus,
      status: status,
      user_msg: userMsg
    }
  });
};

export const exportDisasterStats = async (req, res) => {
  try {
    const stats = await fetchDisasterStatsData();
    res.json(stats);
  } catch (error) {
    console.error("Error exporting stats:", error);
    res.status(500).json({ error: "Failed to export disaster statistics" });
  }
};
//soket
export const fetchDisasterStatsData = async () => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 4;

  const rawData = await DisasterRequest.findAll({
    attributes: [
      [Sequelize.fn('YEAR', Sequelize.col('DisasterRequest.created_at')), 'year'],
      [Sequelize.col('Disaster.name'), 'disasterName'],
      [Sequelize.fn('COUNT', Sequelize.col('DisasterRequest.id')), 'count'],
    ],
    include: [{
      model: Disaster,
      attributes: [],
    }],
    where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('DisasterRequest.created_at')), '>=', startYear),
    group: ['year', 'disasterName'],
    order: [['year', 'DESC']],
    raw: true,
  });

  const result = {};
  for (let i = currentYear; i >= startYear; i--) {
    result[i] = {
      Flood: 0,
      Earthquake: 0,
      HouseholdFire: 0,
      Wildfire: 0,
      Tsunami: 0,
      Landslide: 0,
      Other: 0,
    };
  }

  rawData.forEach(({ year, disasterName, count }) => {
    if (result[year] && result[year][disasterName] !== undefined) {
      result[year][disasterName] = parseInt(count, 10);
    }
  });

  return result;
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await DisasterRequest.findAll();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await DisasterRequest.findOne({
      where: { id: req.params.id },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });

    await request.destroy();
    const io = req.app.get('io');

    // Fetch updated stats data (not route handler)
    const updatedStats = await fetchDisasterStatsData();

    // Emit updated stats to clients
    io.emit('disasterStatsUpdated', updatedStats);

    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getVerifiedRequest = async (req, res) => {
  try {
    const request = await DisasterRequest.findAll({
      where: { isVerified: true ,},
    });

    // Need to find all where the isVerified is true and createdAt is today day

    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get disaster request by user ID
export const getRequestById = async (req, res) => {
  try {
    // Correct extraction methods:
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    const request = await DisasterRequest.findAll({
      where: {
        userId: id
      }
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const updateRequest = async (req, res) => {
  try {
    const request = await DisasterRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });

    const {
      name,
      userId,
      disasterId,
      severity,
      details,
      affectedCount,
      contactNo,
      latitude,
      longitude,
      district,
      province,
    } = req.body;

    if (typeof address === "object") {
      address = Array.isArray(address)
        ? address.join(", ")
        : Object.values(address).join(", ");
    }

    const imageFile = req.files?.image?.[0]?.path || null;
    const voiceFile = req.files?.voice?.[0]?.path || null;

    await request.update({
      name,
      userId,
      disasterId,
      severity,
      details,
      affectedCount,
      contactNo,
      latitude,
      longitude,
      images: imageFile,
      voice: voiceFile,
      district,
      province,
    });

    res.json({ message: "Request updated", request });
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({ error: error.message });
  }

};



export const getDistrictDisasterSummary = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const rawData = await DisasterRequest.findAll({
      attributes: [
        'district',
        [Sequelize.col('Disaster.name'), 'disasterName'],
        [Sequelize.fn('COUNT', Sequelize.col('DisasterRequest.id')), 'count'],
      ],
      include: [{
        model: Disaster,
        attributes: [],
      }],
      where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('DisasterRequest.created_at')), currentYear),
      group: ['district', 'disasterName'],
      raw: true,
    });

    // Initialize a map to hold district -> disasterName -> count
    const districtData = {};

    // Disaster types to include in every district
    const disasterTypes = ["Flood", "Earthquake", "HouseholdFire", "Wildfire", "Tsunami", "Landslide", "Other"];

    // Populate the raw data
    rawData.forEach(({ district, disasterName, count }) => {
      if (!district) return; // skip undefined districts
      if (!districtData[district]) {
        districtData[district] = {};
        disasterTypes.forEach(type => districtData[district][type] = 0);
      }
      if (districtData[district][disasterName] !== undefined) {
        districtData[district][disasterName] = parseInt(count);
      }
    });

    // Compute total for sorting
    const sortedDistricts = Object.entries(districtData)
      .map(([district, disasters]) => {
        const total = Object.values(disasters).reduce((sum, val) => sum + val, 0);
        return { district, disasters, total };
      })
      .sort((a, b) => b.total - a.total); // Descending order by total

    // Final output
    const result = {};
    sortedDistricts.forEach(({ district, disasters }) => {
      result[district] = disasters;
    });

    res.json(result);

  } catch (error) {
    console.error("Error fetching district summary:", error);
    res.status(500).json({ error: "Failed to fetch district disaster summary" });
  }
};

export const getCurrentYearDisasterTotals = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const disasterTypes = [
      "Flood",
      "Earthquake",
      "HouseholdFire",
      "Wildfire",
      "Tsunami",
      "Landslide",
      "Other"
    ];

    const rawData = await DisasterRequest.findAll({
      attributes: [
        [Sequelize.col('Disaster.name'), 'disasterName'],
        [Sequelize.fn('COUNT', Sequelize.col('DisasterRequest.id')), 'count']
      ],
      include: [{
        model: Disaster,
        attributes: [],
      }],
      where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('DisasterRequest.created_at')), currentYear),
      group: ['disasterName'],
      raw: true,
    });

    const yearSummary = {};
    yearSummary[currentYear] = {};

    // Initialize all to 0
    disasterTypes.forEach(type => {
      yearSummary[currentYear][type] = 0;
    });

    // Fill with counts
    rawData.forEach(({ disasterName, count }) => {
      if (yearSummary[currentYear][disasterName] !== undefined) {
        yearSummary[currentYear][disasterName] = parseInt(count);
      }
    });

    res.json(yearSummary);

  } catch (error) {
    console.error("Error getting current year disaster totals:", error);
    res.status(500).json({ error: "Failed to fetch current year disaster totals" });
  }
};