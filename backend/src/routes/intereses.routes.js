const express = require("express");

const router = express.Router();

const {
  agregarInteres,
  contarInteresados,
  verificarInteres,
  obtenerInteresesUsuario,
} = require("../controllers/intereses.controller");

/*
========================================
ME INTERESA
========================================
*/

router.post(
  "/",
  agregarInteres
);

/*
========================================
VERIFICAR INTERES
========================================
*/

router.post(
  "/verificar",
  verificarInteres
);


/*
========================================
INTERESES DEL USUARIO
========================================
*/

router.get(
  "/usuario/:usuario_id",
  obtenerInteresesUsuario
);


/*
========================================
TOTAL INTERESADOS
========================================
*/

router.get(
  "/:publicacion_id",
  contarInteresados
);

module.exports = router;