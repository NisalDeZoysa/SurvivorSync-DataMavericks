import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import User from './models/user.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRequestRoutes from './routes/userRequestRoutes.js';
import disasterRoutes from './routes/disasterRoutes.js';
import precautionRoutes from './routes/precautionRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import resourceCenterRoutes from './routes/resourceCenterRoutes.js';
import allocationRoutes from './routes/allocationRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import Disaster from './models/Disaster.js'; 
import fs from 'fs';
import seedDatabase from './seed.js'; // Import the seed function

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create upload directories if missing
['uploads/images', 'uploads/voice'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Routes
app.use('/api/users', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRequestRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/precautions', precautionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/resource-centers', resourceCenterRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/availability', availabilityRoutes);

// DB Sync + Server
sequelize
  .sync()
  .then(async () => {
    console.log('Database connected');
    // await seedDatabase(); 
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });
