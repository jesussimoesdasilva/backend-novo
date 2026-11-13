const express = require("express");
const router = express.Router();
const c = require("../controllers/grupo.controller");
const upload = require("../middlewares/upload");

// CHAT DO DEPARTAMENTO
router.get("/mensagens/depto/:deptoId", c.listarMensagensDepto);
router.post("/mensagens/depto/:deptoId", c.enviarMensagemDepto);

// CHAT DO SECTOR
router.get("/mensagens/sector/:sectorId", c.listarMensagensSector);
router.post("/mensagens/sector/:sectorId", c.enviarMensagemSector);

// MODERAÇÃO
router.put("/mensagens/:msgId/silenciar", c.silenciarMensagem);

// GALERIA DO SECTOR
router.get("/galeria/:sectorId", c.listarFotosSector);
router.post("/galeria/:sectorId", upload.single("foto"), c.uploadFotoAtividade);
router.delete("/fotos-atividade/:id", c.apagarFotoAtividade); // <-- NOVA ROTA (apagar foto do sector)

// GALERIA DO DEPARTAMENTO (NOVAS)
router.get("/galeria-departamento/:deptoId", c.obterFotosDoDepartamento);
router.post("/galeria-departamento/:deptoId", upload.single("foto"), c.criarFotoDepartamento);
router.delete("/galeria-departamento/:fotoId", c.apagarFotoDepartamento);

module.exports = router;