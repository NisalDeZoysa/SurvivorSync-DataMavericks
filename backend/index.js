const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();
app.use(express.json());

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/users', userRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to SurvivorSync API');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
