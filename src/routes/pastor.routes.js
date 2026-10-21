const express = require("express");
const router = express.Router();
const c = require("../controllers/pastor.controller");
const upload = require("../middlewares/upload");
const prisma = require("../config/prisma");

router.get("/igreja/:igrejaId", c.list);
router.get("/:id", c.get);
router.post("/igreja/:igrejaId", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

// Rota para upload de foto do pastor
router.post("/igreja/:igrejaId/:id/foto", upload.single("foto"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Nenhuma foto enviada" });
    
    // O multer guarda na pasta public/logos
    const fotoUrl = '/logos/' + req.file.filename;
    
    const p = await prisma.pastor.update({
      where: { id: Number(req.params.id) },
      data: { foto: fotoUrl }
    });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;