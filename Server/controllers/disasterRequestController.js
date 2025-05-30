import { DisasterRequest, User } from "../models/index.js";

export const createUserRequest = async (req, res) => {
  try {
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

    if (typeof address === "object") {
      address = Array.isArray(address)
        ? address.join(", ")
        : Object.values(address).join(", ");
    }

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
    res.status(201).json({ message: "User request created", success: true });
    } catch (error) {
      console.error("Create error:", error);
      res.status(400).json({ error: error.message });
    }
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await DisasterRequest.findAll();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await DisasterRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await DisasterRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });

    await request.destroy();
    res.json({ message: "Request deleted" });
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
