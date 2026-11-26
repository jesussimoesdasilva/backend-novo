const express = require("express");
const router = express.Router();
const c = require("../controllers/presenca.controller");

router.post("/presenca", c.registarPresenca);
router.get("/presenca/igreja/:igrejaId", c.listarPresencas);
router.post("/escala", c.criarEscala);
router.get("/escala/igreja/:igrejaId", c.listarEscalas);
router.get("/escala/membro/:membroId", c.listarEscalasMembro);
router.put("/escala/:id", c.editarEscala);
router.put("/escala/:id/responder", c.responderEscalaMembro);
router.delete("/escala/:id", c.apagarEscala);

module.exports = router;
