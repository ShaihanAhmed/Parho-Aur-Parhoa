const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "lms_uploads";

    // auto detect type
    if (file.mimetype.startsWith("video")) {
      return {
        folder,
        resource_type: "video",
      };
    }

    return {
      folder,
      resource_type: "auto", // handles images + docs
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
