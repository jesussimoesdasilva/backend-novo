const express = require("express");
const router = express.Router();
const c = require("../controllers/oracao.controller");

router.post("/igreja/:igrejaId", c.create);
router.get("/igreja/:igrejaId/public", c.listPublic);
router.get("/igreja/:igrejaId", c.list);
router.put("/:id/status", c.updateStatus);
router.delete("/:id", c.remove);

module.exports = router;