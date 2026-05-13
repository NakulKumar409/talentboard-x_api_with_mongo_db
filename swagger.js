// swagger.js
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  openapi: "3.0.0",
  info: {
    title: "TalentBoard + MessMate API",
    version: "1.0.0",
    description: "Complete API Documentation with Job Application Management",
  },
  servers: [
    {
      url: "http://localhost:3004",
      description: "Local server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication APIs" },
    { name: "Jobs", description: "Job CRUD APIs" },
    { name: "Applications", description: "Job application APIs" },
    { name: "Dashboard", description: "Dashboard statistics APIs" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = "./swagger.json";
const endpointsFiles = [
  "./routes/authRoutes.js",
  "./routes/jobRoutes.js",
  "./routes/applicationRoutes.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);
