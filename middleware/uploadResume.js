const multer = require("multer");
const path = require("path");
const fs = require("fs");

// folder auto create
const uploadPath = path.join(__dirname, "../uploads/resumes");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // ✅ correct path
  },
  filename: function (req, file, cb) {
    // ✅ correct key
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// file filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

const uploadDisk = multer({
  storage,
  fileFilter,
});

module.exports = {
  uploadDisk,
};
