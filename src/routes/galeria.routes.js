const express = require("express");
const router = express.Router();
const c = require("../controllers/galeria.controller");
const upload = require("../middlewares/upload");

// Álbuns
router.get("/albuns/igreja/:igrejaId", c.listAlbuns);
router.get("/albuns/:id", c.getAlbum);
router.post("/albuns/igreja/:igrejaId", c.createAlbum);
router.put("/albuns/:id", c.updateAlbum);
router.post("/albuns/:id/capa", upload.single("capa"), c.setCapaAlbum);
router.delete("/albuns/:id", c.deleteAlbum);

// Fotos
router.get("/fotos/album/:albumId", c.listFotos);
router.post("/fotos/igreja/:igrejaId/album/:albumId", c.uploadFotos);
router.delete("/fotos/:id", c.deleteFoto);

module.exports = router;