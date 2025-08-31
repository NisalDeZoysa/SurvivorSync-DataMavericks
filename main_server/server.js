import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import fs from 'fs';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import seedDatabase from './seed.js'; // Your seeder function

import { whatsappClient } from './controllers/whatsAppConroller.js';



dotenv.config();

whatsappClient.initialize();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);


// Initialize Socket.io server with CORS options
const io = new SocketIOServer(server, {
  cors: {
    origin: true, // Adjust this for your frontend origin in production
    credentials: true,
  },
});

// Attach io instance to app for global access
app.set('io', io);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create upload directories if missing
['uploads/images', 'uploads/voice'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Routes (your existing routes)
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import firstResponderRoutes from './routes/firstResponderRoutes.js';
import disasterRequestRoutes from './routes/disasterRequestRoutes.js';
import disasterRoutes from './routes/disasterRoutes.js';
import precautionRoutes from './routes/precautionRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import resourceCenterRoutes from './routes/resourceCenterRoutes.js';
import allocationRoutes from './routes/allocationRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import whatsAppRoutes from './routes/whatsappRoutes.js';
import newsRoutes from './routes/newsRoutes.js';

app.use('/api/users', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/first-responders', firstResponderRoutes);
app.use('/api', disasterRequestRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/precautions', precautionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/resource-centers', resourceCenterRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/whatsapp', whatsAppRoutes); // Add WhatsApp routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/news', newsRoutes);


const globalChatHistory = [];
// Optional: Socket.io connection event for logging
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.emit('chatHistory', globalChatHistory);

  socket.on('newMessage', (message) => {
    const newMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    // Add to in-memory history (limit to 100 messages)
    globalChatHistory.push(newMessage);
    if (globalChatHistory.length > 100) {
      globalChatHistory.shift();
    }

    // Broadcast to all connected clients
    io.emit('newMessage', newMessage);
  });
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// DB Sync + Start server
sequelize
  .sync(
  //  { force: true }
)
  .then(async () => {
    console.log('Database connected');
    //await seedDatabase();
    // Start HTTP server (not app.listen)
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });
