const Job = require("../models/job");

exports.createJob = async (req, res) => {
  const job = await Job.create(req.body);

  res.json(job);
};

exports.getJobs = async (req, res) => {
  const jobs = await Job.find();

  res.json(jobs);
};

exports.getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id);

  res.json(job);
};

exports.updateJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(job);
};

exports.deleteJob = async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);

  res.json({ message: "Job deleted" });
};
