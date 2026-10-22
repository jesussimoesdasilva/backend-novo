const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "igreja_sistema",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "mp3", "mkv"],
  },
});

const upload = multer({ storage });

module.exports = upload;