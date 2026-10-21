const express = require("express");
const router = express.Router();
const c = require("../controllers/igreja.controller");
const upload = require("../middlewares/upload");

router.get("/", c.listIgrejas);
router.post("/login", c.login);
router.get("/:id", c.getIgreja);
router.post("/", c.addIgreja);
router.put("/:id", c.editIgreja);
router.delete("/:id", c.removeIgreja);

// NOVAS ROTAS DE PERSONALIZAÇÃO
router.post("/:id/logo", upload.single("logo"), c.uploadLogo);
router.post("/:id/imagens-hero", upload.array("imagens", 5), c.uploadImagensHero);
router.put("/:id/cor-fundo", c.salvarCorFundo);
router.put("/:id/cor-barra-topo", c.salvarCorBarraTopo); // NOVO

module.exports = router;