const express = require("express");
const router = express.Router();
const c = require("../controllers/sector.controller");

router.get("/igreja/:igrejaId", c.list);
router.post("/igreja/:igrejaId", c.create);
router.put("/:id/lider", c.setLider);
router.delete("/:id", c.remove);

module.exports = router;