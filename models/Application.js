const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fullName: String,
    email: String,
    phone: String,
    dob: Date,
    gender: String,

    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,

    aadhaar: String,
    pan: String,
    uan: String,

    tenthBoard: String,
    tenthPercentage: Number,
    tenthYear: Number,

    twelfthBoard: String,
    twelfthPercentage: Number,
    twelfthYear: Number,

    graduationCollege: String,
    graduationDegree: String,
    graduationPercentage: Number,
    graduationYear: Number,

    postGraduationCollege: String,
    postGraduationDegree: String,
    postGraduationPercentage: Number,
    postGraduationYear: Number,

    experienceYears: String,

    companyName: String,
    companyRole: String,
    startDate: Date,
    endDate: Date,

    previousCompany: String,
    previousRole: String,

    skills: [String],
    topSkills: [String],

    github: String,
    linkedin: String,
    portfolio: String,

    resume: String,
    coverLetter: String,

    acceptTerms: Boolean,
    confirmInformation: Boolean,

    aiScore: Number,

    status: {
      type: String,
      default: "Applied",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
