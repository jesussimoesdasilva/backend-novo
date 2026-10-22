const express = require("express");
const router = express.Router();
const c = require("../controllers/midia.controller");
const uploadMidia = require("../middlewares/uploadMidia");

router.get("/igreja/:igrejaId", c.list);
router.post("/igreja/:igrejaId", c.create);
router.delete("/:id", c.remove);

module.exports = router;