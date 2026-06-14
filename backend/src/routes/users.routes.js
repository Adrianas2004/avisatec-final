const express = require("express");

const router = express.Router();

const {
  getUserByCognitoSub,
  createUser,
  saveUserInterests,
  checkUserInterests,
  actualizarIntereses,
  obtenerInteresesUsuario,
  actualizarPerfil,
  guardarPushToken,
} = require("../controllers/users.controller");

router.put(
  "/push-token/:id",
  guardarPushToken
);

router.get("/:cognito_sub", getUserByCognitoSub);

router.get(
  "/:cognito_sub/intereses",
  checkUserInterests
);

router.put("/:id", actualizarPerfil);

router.post("/", createUser);

router.post(
  "/intereses",
  saveUserInterests
);

router.get(
  "/intereses/:usuario_id",
  obtenerInteresesUsuario
);


router.put(
  "/intereses/actualizar",
  actualizarIntereses
);



module.exports = router;