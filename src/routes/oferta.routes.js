const express = require("express");
const router = express.Router();
const c = require("../controllers/oferta.controller");

router.get("/igreja/:igrejaId", c.list);
router.get("/estatisticas/:igrejaId", c.estatisticas);
router.get("/relatorio-dizimistas/:igrejaId", c.relatorioDizimistas);

router.post("/igreja/:igrejaId", c.create);
router.get("/consultar/:igrejaId/:codigo", c.consultar);

router.put("/:id/pre-validar", c.preValidar);
router.put("/:id/validar", c.validar);
router.put("/:id/negar", c.negar);

module.exports = router;