const express = require("express");
const router = express.Router();
const c = require("../controllers/presenca.controller");
const { verificarToken, apenasLideranca } = require("../middlewares/authJwt");

router.post("/presenca", verificarToken, apenasLideranca, c.registarPresenca);
router.get("/presenca/igreja/:igrejaId", c.listarPresencas);
router.post("/escala", verificarToken, apenasLideranca, c.criarEscala);
router.get("/escala/igreja/:igrejaId", c.listarEscalas);

module.exports = router;
