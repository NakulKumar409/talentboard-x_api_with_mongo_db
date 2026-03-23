const Application = require("../models/Application");
const Job = require("../models/job");
const atsScore = require("../utils/atsScore");
const mongoose = require("mongoose");
const pdf = require("pdf-parse"); // FIXED: Changed from pdfParse
const fs = require("fs");
const extractResumeData = require("../utils/resumeParser");

const path = require("path");

// ==============================================
// API 1: APPLY JOB WITH RESUME UPLOAD
// ==============================================
exports.applyJob = async (req, res) => {
  try {
    console.log("📝 Apply API called");
    console.log("File:", req.file ? req.file.originalname : "No file");
    console.log("Body fields:", Object.keys(req.body));

    const { jobId, userId, ...otherData } = req.body;

    // Validation
    if (!jobId || !userId) {
      return res.status(400).json({
        success: false,
        message: "jobId and userId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
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

    // Check for duplicate application
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Handle resume file
    let resumePath = null;
    if (req.file) {
      resumePath = req.file.originalname;
    }
    // Parse skills if sent as JSON string
    let skillsArray = [];
    if (req.body.skills) {
      try {
        skillsArray = JSON.parse(req.body.skills);
      } catch (e) {
        skillsArray = req.body.skills.split(",").map((s) => s.trim());
      }
    }

    // Parse topSkills if sent as JSON string
    let topSkillsArray = [];
    if (req.body.topSkills) {
      try {
        topSkillsArray = JSON.parse(req.body.topSkills);
      } catch (e) {
        topSkillsArray = req.body.topSkills.split(",").map((s) => s.trim());
      }
    }

    // Calculate AI score
    const score = atsScore(job.skillsRequired || [], skillsArray || []);

    // Helper function to safely convert to number
    const toNumber = (value) => {
      if (!value || value === "" || value === "null" || value === "undefined") {
        return 0;
      }
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };

    // Prepare application data with safe number conversion
    const applicationData = {
      jobId,
      userId,
      fullName: req.body.fullName || "",
      email: req.body.email || "",
      phone: req.body.phone || "",
      dob: req.body.dob || "",
      gender: req.body.gender || "",
      address: req.body.address || "",
      city: req.body.city || "",
      state: req.body.state || "",
      country: req.body.country || "",
      pincode: req.body.pincode || "",
      aadhaar: req.body.aadhaar || "",
      pan: req.body.pan || "",
      uan: req.body.uan || "",

      // Education - with safe number conversion
      tenthBoard: req.body.tenthBoard || "",
      tenthPercentage: toNumber(req.body.tenthPercentage),
      tenthYear: toNumber(req.body.tenthYear),

      twelfthBoard: req.body.twelfthBoard || "",
      twelfthPercentage: toNumber(req.body.twelfthPercentage),
      twelfthYear: toNumber(req.body.twelfthYear),

      graduationCollege: req.body.graduationCollege || "",
      graduationDegree: req.body.graduationDegree || "",
      graduationPercentage: toNumber(req.body.graduationPercentage),
      graduationYear: toNumber(req.body.graduationYear),

      postGraduationCollege: req.body.postGraduationCollege || "",
      postGraduationDegree: req.body.postGraduationDegree || "",
      postGraduationPercentage: toNumber(req.body.postGraduationPercentage),
      postGraduationYear: toNumber(req.body.postGraduationYear),

      // Experience
      experienceYears: req.body.experienceYears || "",
      companyName: req.body.companyName || "",
      companyRole: req.body.companyRole || "",
      startDate: req.body.startDate || "",
      endDate: req.body.endDate || "",
      previousCompany: req.body.previousCompany || "",
      previousRole: req.body.previousRole || "",

      // Skills
      skills: skillsArray,
      topSkills: topSkillsArray,

      // Social Links
      github: req.body.github || "",
      linkedin: req.body.linkedin || "",
      portfolio: req.body.portfolio || "",

      // Documents
      resume: resumePath,
      coverLetter: req.body.coverLetter || "",

      // Terms
      acceptTerms:
        req.body.acceptTerms === "true" || req.body.acceptTerms === true,
      confirmInformation:
        req.body.confirmInformation === "true" ||
        req.body.confirmInformation === true,

      // Status and Score
      aiScore: score,
      status: "Applied",
    };

    console.log("📦 Saving application...");

    // Save to database
    const application = await Application.create(applicationData);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("❌ Apply job error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ==============================================
// API 2: PARSE RESUME PREVIEW
exports.parseResume = async (req, res) => {
  try {
    console.log("📄 Parse API called");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume file",
      });
    }

    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);

    const data = await pdf(dataBuffer); // ✅ working

    const extracted = extractResumeData(data.text);

    res.status(200).json({
      success: true,
      parsedData: extracted,
    });
  } catch (error) {
    console.error("❌ Parse resume error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==============================================
// OTHER APIS (keep your existing ones)
// ==============================================
exports.getApplications = async (req, res) => {
  try {
    const { jobId, userId, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) filter.jobId = jobId;
    if (userId && mongoose.Types.ObjectId.isValid(userId))
      filter.userId = userId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(filter)
      .populate("jobId", "title company location salary")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

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

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

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

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

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

// Get logged in user's applications
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const applications = await Application.find({ userId })
      .populate("jobId", "title company location salary type")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Application ID:", id);

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    console.log("Application:", application);

    if (!application.resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found in DB",
      });
    }

    const filePath = path.join(__dirname, "..", application.resume);

    console.log("File path:", filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Resume file not found on server",
      });
    }

    res.download(filePath);
  } catch (error) {
    console.error("Download error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to download resume",
      error: error.message,
    });
  }
};
