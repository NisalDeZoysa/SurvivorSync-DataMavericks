const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SurvivorSync API',
      version: '1.0.0',
      description: 'API documentation for the SurvivorSync backend',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], // Scan for Swagger comments in route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
