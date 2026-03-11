require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();

// ==================== ✅ WORKING CORS CONFIGURATION ====================
// YEHI COPY KARO - 100% WORKING
const allowedOrigins = [
  "https://talentboard-x-1.onrender.com", // Tumhara frontend
  "http://localhost:5173", // Local Vite
  "http://localhost:3000", // Local React
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

// CORS middleware - YEH IMPORTANT HAI
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// IMPORTANT: Pre-flight requests ke liye
app.options("*", cors());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================
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

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // CORS error ke liye specific message
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      error: "CORS Error",
      message:
        "Domain not allowed. Allowed domains: " + allowedOrigins.join(", "),
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 3004;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas Connected ✅");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log("CORS enabled for:", allowedOrigins);
    });
  })
  .catch((err) => {
    console.log("DB Connection Error:", err);
  });
