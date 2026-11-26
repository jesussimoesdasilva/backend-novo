const express = require("express");
const router = express.Router();
const c = require("../controllers/membro.controller");
const upload = require("../middlewares/upload");
const { verificarToken, apenasLideranca } = require("../middlewares/authJwt");

// Públicas
router.post("/igreja/:igrejaId/registo", c.publicRegister);
router.post("/login", c.login);
router.post("/verificar-telefone", c.verificarTelefone);
router.post("/ver-codigo", c.verCodigo);
router.post("/redefinir-senha", c.redefinirSenhaComCodigo);
router.get("/publico/:id", c.getPublico);

// PDFs (abertos em nova aba)
router.get("/pdf/ficha/:membroId", c.gerarFichaMembroPDF);
router.get("/pdf/membros-secretario/:igrejaId", c.gerarPDFMembrosSecretario);
router.get("/pdf/batismos/:igrejaId", c.gerarPDFBatismosSecretario);
router.get("/pdf/presencas/:igrejaId", c.gerarPDFPresencasSecretario);

// Gestão da Liderança
router.get("/igreja/:igrejaId", verificarToken, apenasLideranca, c.list);
router.post("/igreja/:igrejaId", verificarToken, apenasLideranca, c.create);
router.put("/:id/aprovar", verificarToken, apenasLideranca, c.aprovar);
router.put("/:id/promover", verificarToken, apenasLideranca, c.promover);
router.put("/:id/sectores", verificarToken, apenasLideranca, c.setSectores);
router.put("/:id/reset-password", verificarToken, apenasLideranca, c.resetPassword);
router.put("/:id/secretario", verificarToken, apenasLideranca, c.editarMembroSecretario);
router.put("/:id/departamento", verificarToken, apenasLideranca, c.editarDepartamentoMembro);
router.delete("/:id", verificarToken, apenasLideranca, c.remove);

// Próprio Membro autenticado
router.put("/:id/perfil", verificarToken, c.updatePerfil);
router.post("/:id/atividade", verificarToken, c.atualizarAtividade);
router.post("/:id/foto", verificarToken, c.updateFoto);

module.exports = router;
