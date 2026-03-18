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
  downloadResume,
} = require("../controllers/applicationController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadCloud } = require("../middleware/uploadResume");

router.get("/stats", getApplicationStats);

router.get("/my", authMiddleware, getMyApplications);

router.get("/", getApplications);

router.post(
  "/parse-resume",
  authMiddleware,
  uploadCloud.single("resume"),
  parseResume
);

router.post("/apply", authMiddleware, uploadCloud.single("resume"), applyJob);

router.get("/user/:userId", getApplicationsByUser);

router.get("/job/:jobId", getApplicationsByJob);

router.get("/:id/resume", downloadResume);

router
  .route("/:id")
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;
