const express = require("express");
const router = express.Router();
const c = require("../controllers/patrimonio.controller");
const { verificarToken, apenasLideranca } = require("../middlewares/authJwt");

// Bens
router.get("/igreja/:igrejaId", verificarToken, apenasLideranca, c.listBens);
router.post("/igreja/:igrejaId", verificarToken, apenasLideranca, c.createBem);
router.put("/:id", verificarToken, apenasLideranca, c.updateBem);
router.put("/:id/devolver", verificarToken, apenasLideranca, c.devolverBem);

// Membros aptos (com dízimo validado no mês)
router.get("/igreja/:igrejaId/aptos-emprestimo", verificarToken, apenasLideranca, c.listMembrosAptos);

// Pedidos ao Pastor (Movimentação, Empréstimo, Abate)
router.get("/igreja/:igrejaId/pedidos", verificarToken, apenasLideranca, c.listPedidos);
router.post("/igreja/:igrejaId/pedidos", verificarToken, apenasLideranca, c.criarPedido);
router.put("/pedidos/:pedidoId/responder", verificarToken, apenasLideranca, c.responderPedido);

module.exports = router;
