const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "..", "public", "logos");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, "logo-" + Date.now() + "-" + Math.round(Math.random() * 1e6) + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(path.extname(file.originalname).toLowerCase());
  if (ok) cb(null, true);
  else cb(new Error("Apenas imagens permitidas"));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });