const express = require("express");
const router = express.Router();

const {
  applyJob,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getApplicationsByJob,
  getApplicationsByUser,
  getApplicationStats,
  getMyApplications,
  parseResume, // ✅ ADD THIS
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadDisk } = require("../middleware/uploadResume");

// Stats
router.get("/stats", getApplicationStats);

// Logged-in user
router.get("/my", authMiddleware, getMyApplications);

// Get all applications
router.get("/", getApplications);

// ✅ ADD THIS ROUTE
router.post(
  "/parse-resume",
  authMiddleware,
  uploadDisk.single("resume"),
  parseResume
);

// Apply job
router.post("/apply", authMiddleware, uploadDisk.single("resume"), applyJob);

// User applications
router.get("/user/:userId", getApplicationsByUser);

// Job applications
router.get("/job/:jobId", getApplicationsByJob);

// Single application
router
  .route("/:id")
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
