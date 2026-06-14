const pool = require("../config/db");

/*
========================================
AGREGAR ME INTERESA
========================================
*/

const agregarInteres = async (req, res) => {

  try {

    const {
      usuario_id,
      publicacion_id,
    } = req.body;

    const existe = await pool.query(
      `
      SELECT * FROM cursos_interesados
      WHERE usuario_id = $1
      AND publicacion_id = $2
      `,
      [usuario_id, publicacion_id]
    );

    /*
    ========================================
    SI YA EXISTE -> QUITAR INTERES
    ========================================
    */

    if (existe.rows.length > 0) {

      await pool.query(
        `
        DELETE FROM cursos_interesados
        WHERE usuario_id = $1
        AND publicacion_id = $2
        `,
        [usuario_id, publicacion_id]
      );

      return res.json({
        interested: false,
        message: "Interés eliminado",
      });

    }

    /*
    ========================================
    AGREGAR INTERES
    ========================================
    */

    await pool.query(
      `
      INSERT INTO cursos_interesados
      (
        usuario_id,
        publicacion_id
      )
      VALUES ($1, $2)
      `,
      [usuario_id, publicacion_id]
    );

    res.json({
      interested: true,
      message: "Curso marcado como interesado",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error guardando interés",
    });

  }

};

/*
========================================
CONTAR INTERESADOS
========================================
*/

const contarInteresados = async (req, res) => {

  try {

    const { publicacion_id } = req.params;

    const result = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM cursos_interesados
      WHERE publicacion_id = $1
      `,
      [publicacion_id]
    );

    res.json({
      total: result.rows[0].total,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error obteniendo interesados",
    });

  }

};


 /*
========================================
VERIFICAR SI YA LE INTERESA
========================================
*/

const verificarInteres = async (
  req,
  res
) => {

  try {

    const {
      usuario_id,
      publicacion_id,
    } = req.body;

    const result = await pool.query(
      `
      SELECT *
      FROM cursos_interesados
      WHERE usuario_id = $1
      AND publicacion_id = $2
      `,
      [usuario_id, publicacion_id]
    );

    res.json({
      interested:
        result.rows.length > 0,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error verificando interés",
    });

  }

};

/*
========================================
OBTENER CURSOS INTERESADOS DEL USUARIO
========================================
*/

const obtenerInteresesUsuario =
  async (req, res) => {

    try {

      const { usuario_id } =
        req.params;

      const result = await pool.query(
        `
        SELECT
          p.*
        FROM cursos_interesados ci
        JOIN publicaciones p
        ON p.id = ci.publicacion_id
        WHERE ci.usuario_id = $1
        ORDER BY ci.created_at DESC
        `,
        [usuario_id]
      );

      res.json(result.rows);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Error obteniendo intereses",
      });

    }

};

module.exports = {
  agregarInteres,
  contarInteresados,
  verificarInteres,
  obtenerInteresesUsuario,
};