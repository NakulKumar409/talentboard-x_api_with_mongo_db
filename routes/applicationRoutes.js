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
  parseResume,
} = require("../controllers/applicationController");

const applicationController = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadDisk } = require("../middleware/uploadResume");

// ==============================
// STATS
// ==============================
router.get("/stats", getApplicationStats);

// ==============================
// LOGGED-IN USER APPLICATIONS
// ==============================
router.get("/my", authMiddleware, getMyApplications);

// ==============================
// GET ALL APPLICATIONS
// ==============================
router.get("/", getApplications);

// ==============================
// PARSE RESUME (AI Resume Parser)
// ==============================
router.post(
  "/parse-resume",
  authMiddleware,
  uploadDisk.single("resume"),
  parseResume
);

// ==============================
// APPLY FOR JOB
// ==============================
router.post("/apply", authMiddleware, uploadDisk.single("resume"), applyJob);

// ==============================
// USER APPLICATIONS
// ==============================
router.get("/user/:userId", getApplicationsByUser);

// ==============================
// JOB APPLICATIONS
// ==============================
router.get("/job/:jobId", getApplicationsByJob);

// ==============================
// DOWNLOAD RESUME
// ==============================
router.get("/:id/resume", applicationController.downloadResume);

// ==============================
// SINGLE APPLICATION CRUD
// ==============================
router
  .route("/:id")
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
