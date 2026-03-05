const Application = require("../models/Application");
const Job = require("../models/job");
const atsScore = require("../utils/atsScore");
const mongoose = require("mongoose");

// Apply for a job
exports.applyJob = async (req, res) => {
  try {
    const { jobId, userId, skills, ...otherData } = req.body;

    // Validate required fields
    if (!jobId || !userId) {
      return res.status(400).json({
        message: "jobId and userId are required",
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
      });
    }

    // Calculate ATS score
    let score = 0;
    try {
      score = atsScore(job.skillsRequired || [], skills || []);
    } catch (error) {
      console.error("ATS Score calculation error:", error);
      // Default score if calculation fails
      score = 50;
    }

    // Create application
    const application = await Application.create({
      jobId,
      userId,
      skills,
      ...otherData,
      aiScore: score,
      status: "Applied",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Apply job error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate application - You may have already applied",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all applications
exports.getApplications = async (req, res) => {
  try {
    const { jobId, userId, status, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) filter.jobId = jobId;
    if (userId && mongoose.Types.ObjectId.isValid(userId))
      filter.userId = userId;
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get applications with population
    const applications = await Application.find(filter)
      .populate("jobId", "title company location salary")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get single application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    const application = await Application.findById(id)
      .populate("jobId")
      .populate("userId", "-password");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get application by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update application (status update)
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    // Allowed fields to update
    const allowedUpdates = [
      "status",
      "aiScore",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "country",
      "pincode",
      "skills",
      "topSkills",
      "github",
      "linkedin",
      "portfolio",
      "resume",
      "coverLetter",
    ];

    // Filter only allowed fields
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Status validation
    if (updates.status) {
      const validStatuses = ["Applied", "Shortlisted", "Rejected", "Hired"];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }
    }

    const application = await Application.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application updated successfully",
      application,
    });
  } catch (error) {
    console.error("Update application error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete application
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get applications by job ID
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const applications = await Application.find({ jobId })
      .populate("userId", "name email phone")
      .sort({ aiScore: -1, createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
      },
      applications,
    });
  } catch (error) {
    console.error("Get applications by job error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get applications by user ID
exports.getApplicationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const applications = await Application.find({ userId })
      .populate("jobId", "title company location salary type")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get applications by user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get application statistics
exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgScore: { $avg: "$aiScore" },
        },
      },
    ]);

    const totalApplications = await Application.countDocuments();

    // Get recent applications
    const recentApplications = await Application.find()
      .populate("jobId", "title company")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      totalApplications,
      statusBreakdown: stats,
      recentApplications,
    });
  } catch (error) {
    console.error("Get application stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
