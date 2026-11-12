const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary-v2");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "igreja_comprovativos",
    allowed_formats: ["pdf"], // Só aceita PDF
    resource_type: "raw",     // Obrigatório para PDFs no Cloudinary
  },
});

const fileFilter = (req, file, cb) => {
  // Verifica se a extensão é .pdf
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Apenas ficheiros PDF são permitidos."), false);
  }
};

const uploadComprovativo = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 }, // Limite EXATO de 50 KB
  fileFilter: fileFilter
});

module.exports = uploadComprovativo;