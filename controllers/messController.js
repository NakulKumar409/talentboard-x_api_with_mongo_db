const Mess = require("../models/messModel");

// GET ALL
exports.getAllMesses = async (req, res) => {
  try {
    const messes = await Mess.find();
    res.json(messes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BY ID
exports.getMessById = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id);

    if (!mess) {
      return res.status(404).json({ message: "Mess not found" });
    }

    res.json(mess);
  } catch (error) {
    res.status(400).json({ message: "Invalid ID" });
  }
};

// CREATE
exports.createMess = async (req, res) => {
  try {
    const mess = new Mess(req.body);
    const saved = await mess.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE
exports.updateMess = async (req, res) => {
  try {
    const updated = await Mess.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Mess not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Invalid ID or Data" });
  }
};

// DELETE
exports.deleteMess = async (req, res) => {
  try {
    const deleted = await Mess.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Mess not found" });
    }

    res.json({ message: "Mess deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid ID" });
  }
};

