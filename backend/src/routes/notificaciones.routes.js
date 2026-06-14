const express = require("express");

const router = express.Router();

const {
  getNotificaciones,
  marcarLeida,
} = require("../controllers/notificaciones.controller");

router.get(
  "/:usuarioId",
  getNotificaciones
);

router.patch(
  "/:id/read",
  marcarLeida
);

module.exports = router;