const express = require("express");

const router = express.Router();

const {
  getCategorias,
} = require("../controllers/categorias.controller");

router.get("/", getCategorias);

module.exports = router;