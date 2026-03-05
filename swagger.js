const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "TalentBoard API",
    description: "Automatic Swagger Documentation",
  },

  host: "localhost:3004",

  schemes: ["http"],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
