const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "igreja_midia",
    resource_type: "auto", // Permite vídeos e áudios
    allowed_formats: ["mp4", "mkv", "mp3"],
  },
});

const uploadMidia = multer({ storage });

module.exports = uploadMidia;