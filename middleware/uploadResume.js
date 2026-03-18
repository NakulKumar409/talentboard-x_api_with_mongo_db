const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes",
    resource_type: "raw", // 🔥 MOST IMPORTANT
    format: "pdf", // ✅ force PDF
    public_id: (req, file) => Date.now(),
  },
});
// file filter (same rakha 👍)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

const uploadCloud = multer({
  storage,
  fileFilter,
});

module.exports = {
  uploadCloud,
};
