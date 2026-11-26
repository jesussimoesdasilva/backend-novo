const express = require("express");
const router = express.Router();
const c = require("../controllers/sector.controller");
const { verificarToken, apenasLideranca } = require("../middlewares/authJwt")

router.get("/igreja/:igrejaId", verificarToken, apenasLideranca, c.list);
router.post("/igreja/:igrejaId", c.create);
router.put("/:id/lider", c.setLider);
router.delete("/:id", c.remove);

module.exports = router;