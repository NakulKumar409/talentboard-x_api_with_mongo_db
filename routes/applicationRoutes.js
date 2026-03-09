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

// Stats route
router.get("/stats", getApplicationStats);

// Logged-in user applications
router.get("/my", authMiddleware, getMyApplications);

// Main routes
router.route("/").get(getApplications).post(applyJob);

// Alternative apply route
router.post("/apply", applyJob);

// User specific applications
router.get("/user/:userId", getApplicationsByUser);

// Job specific applications
router.get("/job/:jobId", getApplicationsByJob);

// Single application routes
router
  .route("/:id")
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
