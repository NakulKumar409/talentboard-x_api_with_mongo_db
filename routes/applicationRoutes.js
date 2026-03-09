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
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const uploadResume = require("../middleware/uploadResume");

// Stats
router.get("/stats", getApplicationStats);

// Logged-in user
router.get("/my", authMiddleware, getMyApplications);

// Get all applications
router.get("/", getApplications);

// Apply job (resume upload + parsing)
router.post("/apply", uploadResume.single("resume"), applyJob);

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
