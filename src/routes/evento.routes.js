const express = require("express");
const router = express.Router();
const c = require("../controllers/evento.controller");

router.get("/igreja/:igrejaId", c.list);
router.post("/igreja/:igrejaId", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;