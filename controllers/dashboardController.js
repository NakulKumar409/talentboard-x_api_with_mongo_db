const Job = require("../models/job");
const Application = require("../models/Application");

exports.getStats = async (req, res) => {
  const totalJobs = await Job.countDocuments();

  const totalApplicants = await Application.countDocuments();

  const avgScore = await Application.aggregate([
    {
      $group: {
        _id: null,
        avg: { $avg: "$aiScore" },
      },
    },
  ]);

  res.json({
    totalJobs,
    totalApplicants,
    avgScore: avgScore[0]?.avg || 0,
  });
};
