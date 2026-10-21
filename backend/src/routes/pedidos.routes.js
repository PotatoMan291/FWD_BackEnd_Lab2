const express = require("express");
const router = express.Router();

const controlador = require("../controllers/pedidos.controller");

router.get("/", controlador.listar);
router.get("/:id", controlador.obtener);
router.post("/", controlador.crear);
router.post("/:id/anular", controlador.anular);

module.exports = router;
