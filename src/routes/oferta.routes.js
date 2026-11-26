const express = require("express");
const router = express.Router();
const c = require("../controllers/oferta.controller");
const { verificarToken, apenasLideranca } = require("../middlewares/authJwt");

router.get("/igreja/:igrejaId", verificarToken, apenasLideranca, c.list);
router.get("/estatisticas/:igrejaId", verificarToken, apenasLideranca, c.estatisticas);
router.get("/relatorio-dizimistas/:igrejaId", verificarToken, apenasLideranca, c.relatorioDizimistas);

router.get("/meus-dizimos/:membroId", verificarToken, c.meusDizimos);

// Públicas (qualquer pessoa pode ofertar e consultar pelo código)
router.post("/igreja/:igrejaId", c.create);
router.get("/consultar/:igrejaId/:codigo", c.consultar);
router.get("/comprovativo/:igrejaId/:codigo", c.gerarComprovativoPDF);

// Relatórios e ações da Tesouraria / Pastor
router.get("/pdf/membros/:igrejaId", c.gerarPDFMembros);
router.get("/pdf/departamentos/:igrejaId", c.gerarPDFDepartamentos);
router.get("/pdf/sectores/:igrejaId", c.gerarPDFSectores);
router.get("/relatorio-fidelidade/:igrejaId", verificarToken, apenasLideranca, c.relatorioFidelidade);
router.delete("/igreja/:igrejaId/zerar", verificarToken, apenasLideranca, c.zerarFinancas);

router.put("/:id/pre-validar", verificarToken, apenasLideranca, c.preValidar);
router.put("/:id/validar", verificarToken, apenasLideranca, c.validar);
router.put("/:id/negar", verificarToken, apenasLideranca, c.negar);

module.exports = router;
