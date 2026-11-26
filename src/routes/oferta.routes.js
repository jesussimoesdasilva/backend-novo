const express = require("express");
const router = express.Router();
const c = require("../controllers/oferta.controller");

router.get("/igreja/:igrejaId", c.list);
router.get("/estatisticas/:igrejaId", c.estatisticas);
router.get("/relatorio-dizimistas/:igrejaId", c.relatorioDizimistas);
router.get("/meus-dizimos/:membroId", c.meusDizimos);

router.post("/igreja/:igrejaId", c.create);
router.get("/consultar/:igrejaId/:codigo", c.consultar);
router.get("/comprovativo/:igrejaId/:codigo", c.gerarComprovativoPDF);
router.get("/pdf/membros/:igrejaId", c.gerarPDFMembros);
router.get("/pdf/departamentos/:igrejaId", c.gerarPDFDepartamentos);
router.get("/pdf/sectores/:igrejaId", c.gerarPDFSectores);
router.get("/relatorio-fidelidade/:igrejaId", c.relatorioFidelidade);
router.delete("/igreja/:igrejaId/zerar", c.zerarFinancas);

router.put("/:id/pre-validar", c.preValidar);
router.put("/:id/validar", c.validar);
router.put("/:id/negar", c.negar);

module.exports = router;