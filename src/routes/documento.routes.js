const express = require("express");
const router = express.Router();
const c = require("../controllers/documento.controller");

router.get("/igreja/:igrejaId", c.listarDocumentos);
router.post("/", c.criarDocumento);
router.delete("/:id", c.apagarDocumento);

module.exports = router;