require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const messRoutes = require("./routes/messRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/auth", authRoutes);
app.use("/messes", messRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/dashboard", dashboardRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root route
app.get("/", (req, res) => {
  res.send("TalentBoard API Running 🚀");
});

// PORT fix (Render ke liye important)
const PORT = process.env.PORT || 3004;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas Connected ✅");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });
