const express = require("express");
const router = express.Router();
const c = require("../controllers/membro.controller");
const upload = require("../middlewares/upload");

// Públicas
router.post("/igreja/:igrejaId/registo", c.publicRegister);
router.post("/login", c.login);
router.post("/verificar-telefone", c.verificarTelefone);
router.post("/ver-codigo", c.verCodigo);
router.post("/redefinir-senha", c.redefinirSenhaComCodigo);

// Gestão
router.get("/igreja/:igrejaId", c.list);
router.post("/igreja/:igrejaId", c.create);
router.put("/:id/aprovar", c.aprovar);
router.put("/:id/promover", c.promover);
router.put("/:id/sectores", c.setSectores);
router.put("/:id/reset-password", c.resetPassword);
router.delete("/:id", c.remove);

// NOVO: Edição do próprio perfil
router.put("/:id/perfil", c.updatePerfil);
router.post("/:id/foto", upload.single("foto"), c.updateFoto);

module.exports = router;