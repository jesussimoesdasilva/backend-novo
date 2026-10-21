const express = require("express");
const router = express.Router();
const c = require("../controllers/aviso.controller");

router.get("/igreja/:igrejaId", c.list);
router.post("/igreja/:igrejaId", c.create);
router.delete("/:id", c.remove);

module.exports = router;