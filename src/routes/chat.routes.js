const express = require("express");
const router = express.Router();
const c = require("../controllers/chat.controller");

router.get("/contactos/:igrejaId", c.listContactos);
router.get("/mensagens", c.listMensagens);
router.get("/nao-lidas/:igrejaId", c.contarNaoLidas);
router.post("/igreja/:igrejaId", c.enviar);
router.put("/marcar-lidas", c.marcarLidas);

module.exports = router;
