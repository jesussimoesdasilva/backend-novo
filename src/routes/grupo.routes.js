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
router.post("/galeria/:sectorId", c.uploadFotoAtividade); // <-- sem upload
router.delete("/fotos-atividade/:id", c.apagarFotoAtividade);

// GALERIA DO DEPARTAMENTO
router.get("/galeria-departamento/:deptoId", c.obterFotosDoDepartamento);
router.post("/galeria-departamento/:deptoId", c.criarFotoDepartamento); // <-- sem upload
router.delete("/galeria-departamento/:fotoId", c.apagarFotoDepartamento);

module.exports = router;