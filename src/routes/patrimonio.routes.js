const express = require("express");
const router = express.Router();
const c = require("../controllers/patrimonio.controller");

// Bens
router.get("/igreja/:igrejaId", c.listBens);
router.post("/igreja/:igrejaId", c.createBem);
router.put("/:id", c.updateBem);
router.put("/:id/devolver", c.devolverBem);

// Membros aptos (com dízimo validado no mês)
router.get("/igreja/:igrejaId/aptos-emprestimo", c.listMembrosAptos);

// Pedidos ao Pastor (Movimentação, Empréstimo, Abate)
router.get("/igreja/:igrejaId/pedidos", c.listPedidos);
router.post("/igreja/:igrejaId/pedidos", c.criarPedido);
router.put("/pedidos/:pedidoId/responder", c.responderPedido);

module.exports = router;
