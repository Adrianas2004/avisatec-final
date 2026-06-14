const express = require("express");
const router = express.Router();

const pool = require("../config/db");


const {
  getNewCoursesForUser,
} = require(
  "../controllers/publicaciones.controller"
);

/*
========================================
PUBLICACIONES GENERALES
========================================
*/

router.get("/", async (req, res) => {

  try {

    const {
      search = "",
      limit = 20,
      page = 1,
    } = req.query;

    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT *
      FROM publicaciones
      WHERE
        titulo ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2
      OFFSET $3
      `,
      [
        `%${search}%`,
        limit,
        offset,
      ]
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error obteniendo publicaciones"
    });

  }

});



/*
========================================
CURSOS RECOMENDADOS
========================================
*/

router.get("/recomendadas/:usuario_id", async (req, res) => {

  try {

    const { usuario_id } = req.params;

    const result = await pool.query(
      `
      SELECT DISTINCT p.*
      FROM publicaciones p

      INNER JOIN publicacion_categorias pc
        ON p.id = pc.publicacion_id

      INNER JOIN intereses_usuario iu
        ON iu.categoria_id = pc.categoria_id

      WHERE iu.usuario_id = $1

      ORDER BY p.created_at DESC

      LIMIT 50
      `,
      [usuario_id]
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error obteniendo recomendaciones"
    });

  }

});


/*
========================================
NUEVOS PARA TI
========================================
*/

router.get(
  "/new-for-you/:userId",
  getNewCoursesForUser
);


/*
========================================
PUBLICACION POR ID
========================================
*/

router.get("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM publicaciones
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: "Publicación no encontrada"
      });

    }

    res.json(result.rows[0]);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error obteniendo publicación"
    });

  }

});

module.exports = router;