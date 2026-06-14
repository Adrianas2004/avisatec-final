const pool = require("../config/db");

/*
========================================
AGREGAR PREREGISTRO
========================================
*/

const agregarPreregistro = async (
  req,
  res
) => {

  try {

    const {
      usuario_id,
      publicacion_id,
      numero_control,
    } = req.body;

    /*
    ========================================
    GENERAR CORREO INSTITUCIONAL
    ========================================
    */

    const correoInstitucional =
      `L${numero_control}@tehuacan.tecnm.mx`;

    /*
    ========================================
    VERIFICAR SI YA EXISTE
    ========================================
    */

    const existe = await pool.query(
      `
      SELECT *
      FROM cursos_preregistro
      WHERE usuario_id = $1
      AND publicacion_id = $2
      `,
      [usuario_id, publicacion_id]
    );

    if (existe.rows.length > 0) {

      return res.json({
        preregistrado: true,
        message:
          "Ya existe preregistro",
      });

    }

    /*
    ========================================
    INSERTAR PREREGISTRO
    ========================================
    */

    await pool.query(
      `
      INSERT INTO cursos_preregistro
      (
        usuario_id,
        publicacion_id,
        correo_institucional
      )
      VALUES ($1, $2, $3)
      `,
      [
        usuario_id,
        publicacion_id,
        correoInstitucional,
      ]
    );

    res.json({
      preregistrado: true,
      message:
        "Preregistro realizado",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error:
        "Error realizando preregistro",
    });

  }

};



/*
========================================
VERIFICAR PREREGISTRO
========================================
*/

const verificarPreregistro =
  async (req, res) => {

    try {

      const {
        usuario_id,
        publicacion_id,
      } = req.body;

      const result = await pool.query(
        `
        SELECT *
        FROM cursos_preregistro
        WHERE usuario_id = $1
        AND publicacion_id = $2
        `,
        [usuario_id, publicacion_id]
      );

      res.json({
        preregistrado:
          result.rows.length > 0,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Error verificando preregistro",
      });

    }

  };



/*
========================================
CONTAR PREREGISTROS
========================================
*/

const contarPreregistros =
  async (req, res) => {

    try {

      const { publicacion_id } =
        req.params;

      const result = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM cursos_preregistro
        WHERE publicacion_id = $1
        `,
        [publicacion_id]
      );

      res.json({
        total:
          result.rows[0].total,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Error obteniendo preregistros",
      });

    }

  };



/*
========================================
OBTENER PREREGISTROS USUARIO
========================================
*/

const obtenerPreregistrosUsuario =
  async (req, res) => {

    try {

      const { usuario_id } =
        req.params;

      const result = await pool.query(
        `
        SELECT publicaciones.*
        FROM cursos_preregistro

        INNER JOIN publicaciones
        ON publicaciones.id =
        cursos_preregistro.publicacion_id

        WHERE cursos_preregistro.usuario_id = $1

        ORDER BY cursos_preregistro.created_at DESC
        `,
        [usuario_id]
      );

      res.json(result.rows);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Error obteniendo preregistros",
      });

    }

  };



module.exports = {
  agregarPreregistro,
  verificarPreregistro,
  contarPreregistros,
  obtenerPreregistrosUsuario,
};