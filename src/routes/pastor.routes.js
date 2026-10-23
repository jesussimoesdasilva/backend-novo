const express = require("express");
const router = express.Router();
const c = require("../controllers/pastor.controller");
const prisma = require("../config/prisma");

// NOVA ROTA: LOGIN DO PASTOR (tem de estar antes das outras)
router.post("/login", c.login);

router.get("/igreja/:igrejaId", c.list);
router.get("/:id", c.get);
router.post("/igreja/:igrejaId", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

// Rota para atualizar foto do pastor (recebe o link do Cloudinary)
router.put("/:id/foto", async (req, res) => {
  try {
    const { fotoUrl } = req.body;
    if (!fotoUrl) return res.status(400).json({ message: "Nenhuma foto enviada" });
    
    const p = await prisma.pastor.update({
      where: { id: Number(req.params.id) },
      data: { foto: fotoUrl }
    });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;