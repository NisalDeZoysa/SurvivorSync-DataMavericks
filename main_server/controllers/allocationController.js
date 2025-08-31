import { AllocatedResource } from '../models/index.js';
import { ResourceCenter } from '../models/index.js';
import { DisasterRequest } from '../models/index.js';
import { Resource } from '../models/index.js';
import Disaster from '../models/Disaster.js'; // Adjust the path if needed
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // or your frontend domain
  }
});

app.set('io', io); // 🔌 Make io accessible via req.app.get('io')

// Start the server
server.listen(3000, () => {
  console.log('Server running on port 3000');
});


// Create
export const createAllocation = async (req, res) => {
  try {
    const { resourceCenterId, disasterRequestId, amount, isAllocated } = req.body;

    const center = await ResourceCenter.findByPk(resourceCenterId);
    const request = await DisasterRequest.findByPk(disasterRequestId);

    if (!center || !request) {
      return res.status(404).json({ error: 'Resource center or user request not found' });
    }

    const allocation = await AllocatedResource.create({ resourceCenterId, disasterRequestId, amount, isAllocated });

    // 🔌 Emit real-time socket event
    const io = req.app.get('io');
    io.emit('allocationUpdated', { action: 'create', allocation });

    res.status(201).json({ message: 'Resource allocated', allocation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all
export const getAllAllocations = async (req, res) => {
  try {
    const allocations = await AllocatedResource.findAll({
      include: [ResourceCenter, DisasterRequest]
    });
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
export const getAllocationById = async (req, res) => {
  try {
    const allocation = await AllocatedResource.findByPk(req.params.id, {
      include: [ResourceCenter, DisasterRequest]
    });
    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });
    res.json(allocation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAllocation = async (req, res) => {
  try {
    const allocationId = req.params.id;
    const { amount, isAllocated } = req.body;

    const allocation = await AllocatedResource.findByPk(allocationId);

    if (!allocation) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    // Update fields
    if (amount !== undefined) allocation.amount = amount;
    if (isAllocated !== undefined) allocation.isAllocated = isAllocated;

    await allocation.save();

    // Emit socket update
    const io = req.app.get('io');
    const updatedAllocations = await fetchAllocationSummaries();
    io.emit('allocationStatsUpdated', updatedAllocations);

    res.json({ message: 'Allocation updated', allocation });
  } catch (error) {
    console.error('Error updating allocation:', error);
    res.status(500).json({ error: 'Failed to update allocation' });
  }
};


// Delete
export const deleteAllocation = async (req, res) => {
  try {
    const allocation = await AllocatedResource.findByPk(req.params.id);
    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });

    await allocation.destroy();

    // 🔌 Emit deletion event
    const io = req.app.get('io');
    io.emit('allocationUpdated', { action: 'delete', allocationId: req.params.id });

    res.json({ message: 'Allocation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// export const getAllocationSummaries = async (req, res) => {
//   try {
//     let lastUpdated = null;

//     if (allocation.updated_at) {
//       const d = new Date(allocation.updated_at);
//       if (!isNaN(d)) {
//         lastUpdated = d.toISOString().split("T")[0];
//       }
//     }
//     const allocations = await AllocatedResource.findAll({
//       include: [
//         {
//           model: ResourceCenter,
//           include: [Resource]
//         },
//         {
//           model: DisasterRequest,
//           include: [Disaster]
//         }
//       ]
//     });
//     console.log('Allocations fetched:', allocations);
//     const result = allocations.map((allocation) => ({
//       id: allocation.id,
//       disasterId: allocation?.DisasterRequest?.id || null,
//       disasterType: allocation?.DisasterRequest?.Disaster?.name || null,
//       district: allocation?.DisasterRequest?.district || null,
//       province: allocation?.DisasterRequest?.province || null,
//       type: allocation.ResourceCenter?.Resource?.type || null,
//       quantity: allocation.amount,
//       status: allocation.isAllocated ? 'allocated' : 'available',
//       lastUpdated,
//     }));

//     console.log('Allocation summaries:', result);

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


export const getAllocationSummaries = async (req, res) => {
  try {
    const allocations = await AllocatedResource.findAll({
      include: [
        {
          model: ResourceCenter,
          include: [Resource],
        },
        {
          model: DisasterRequest,
          include: [Disaster],
        },
      ],
    });

    console.log("Allocations fetched:", allocations);

    const result = allocations.map((allocation) => {
      let lastUpdated = null;

      if (allocation.updated_at) {
        const d = new Date(allocation.updated_at);
        if (!isNaN(d)) {
          lastUpdated = d.toISOString().split("T")[0];
        }
      }

      return {
        id: allocation.id,
        disasterId: allocation?.DisasterRequest?.id || null,
        disasterType: allocation?.DisasterRequest?.Disaster?.name || null,
        district: allocation?.DisasterRequest?.district || null,
        province: allocation?.DisasterRequest?.province || null,
        type: allocation.ResourceCenter?.Resource?.type || null,
        quantity: allocation.amount,
        status: allocation.isAllocated ? "allocated" : "available",
        lastUpdated,
      };
    });

    console.log("Allocation summaries:", result);

    res.json(result);
  } catch (error) {
    console.error("Error in getAllocationSummaries:", error);
    res.status(500).json({ error: error.message });
  }
};
