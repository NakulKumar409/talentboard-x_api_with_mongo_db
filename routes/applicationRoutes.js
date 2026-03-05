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
} = require("../controllers/applicationController");

// Stats route
router.get("/stats", getApplicationStats);

// Main routes - POST /applications (for applying)
router.route("/").get(getApplications).post(applyJob); // This handles POST to /applications

// Alternative: If you want /applications/apply
router.post("/apply", applyJob); // This handles POST to /applications/apply

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
