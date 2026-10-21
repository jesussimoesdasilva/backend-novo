const express = require("express");
const router = express.Router();
const c = require("../controllers/departamento.controller");

// Rotas fixas primeiro
router.get("/igreja/:igrejaId", c.list);
router.post("/igreja/:igrejaId", c.create);

// Rotas com parâmetros específicos
router.put("/sectores/:sectorId/lider", c.setLiderSector);

// Rotas genéricas com :id por último
router.get("/:id", c.getById);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;