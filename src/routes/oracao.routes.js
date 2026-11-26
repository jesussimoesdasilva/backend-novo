const express = require("express");
const router = express.Router();
const c = require("../controllers/oracao.controller");
const { verificarToken, apenasLideranca } = require("../middlewares/authJwt");

router.post("/igreja/:igrejaId", c.create);
router.get("/igreja/:igrejaId/public", c.listPublic);
router.get("/igreja/:igrejaId", verificarToken, apenasLideranca, c.list);
router.put("/:id/status", verificarToken, apenasLideranca, c.updateStatus);
router.delete("/:id", verificarToken, apenasLideranca, c.remove);

module.exports = router;
