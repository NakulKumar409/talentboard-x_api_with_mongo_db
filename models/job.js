const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: String,
    profile: String,
    company: String,
    location: String,
    salary: String,
    type: String,

    skillsRequired: [String],
    experienceRequired: String,

    description: String,

    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema);
