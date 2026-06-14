const express = require("express");

const router = express.Router();

const {
  agregarPreregistro,
  verificarPreregistro,
  contarPreregistros,
  obtenerPreregistrosUsuario,
} = require(
  "../controllers/preregistro.controller"
);

/*
========================================
AGREGAR PREREGISTRO
========================================
*/

router.post(
  "/",
  agregarPreregistro
);

/*
========================================
VERIFICAR PREREGISTRO
========================================
*/

router.post(
  "/verificar",
  verificarPreregistro
);

/*
========================================
CONTAR PREREGISTROS
========================================
*/

router.get(
  "/:publicacion_id",
  contarPreregistros
);

/*
========================================
OBTENER PREREGISTROS USUARIO
========================================
*/

router.get(
  "/usuario/:usuario_id",
  obtenerPreregistrosUsuario
);

module.exports = router;