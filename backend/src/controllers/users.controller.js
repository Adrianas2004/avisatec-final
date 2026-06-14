const pool = require("../config/db");

/*
========================================
OBTENER USUARIO
========================================
*/

const getUserByCognitoSub = async (
  req,
  res
) => {

  try {

    const { cognito_sub } =
      req.params;

    const result =
      await pool.query(
        `
        SELECT *
        FROM usuarios
        WHERE cognito_sub = $1
        `,
        [cognito_sub]
      );

    if (
      result.rows.length === 0
    ) {

      return res.status(404).json({
        exists: false,
      });

    }

    res.json({
      exists: true,
      user: result.rows[0],
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Error obteniendo usuario",
    });

  }

};

/*
========================================
CREAR USUARIO
========================================
*/

const createUser = async (
  req,
  res
) => {

  try {

    const {
      nombre,
      apellidos,
      email,
      carrera,
      semestre,
      cognito_sub,
      soy_maestro,
    } = req.body;

    /*
    ========================================
    VALIDAR CORREO INSTITUCIONAL
    ========================================
    */

    const correoInstitucional =
      email
        .toLowerCase()
        .endsWith(
          "@tehuacan.tecnm.mx"
        );

    if (!correoInstitucional) {

      return res.status(400).json({
        error:
          "Debes usar un correo institucional",
      });

    }

    /*
    ========================================
    DETECTAR ALUMNO
    ========================================
    */

    const alumnoRegex =
      /^L(\d{8})@tehuacan\.tecnm\.mx$/i;

    const alumnoMatch =
      email.match(alumnoRegex);

    let rol = "pendiente";

    let numero_control = null;

    /*
    ========================================
    SI ES ALUMNO
    ========================================
    */

    if (
      alumnoMatch &&
      !soy_maestro
    ) {

      rol = "alumno";

      numero_control =
        alumnoMatch[1];

    }

    /*
    ========================================
    SI MARCO SOY MAESTRO
    ========================================
    */

    if (soy_maestro) {

      rol = "pendiente";

      numero_control = null;

    }

    /*
    ========================================
    CREAR USUARIO
    ========================================
    */

    const result =
      await pool.query(
        `
        INSERT INTO usuarios
        (
          nombre,
          apellidos,
          email,
          numero_control,
          carrera,
          semestre,
          rol,
          cognito_sub,
          activo
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        RETURNING *
        `,
        [
          nombre,
          apellidos,
          email,
          numero_control,
          carrera || null,
          semestre || null,
          rol,
          cognito_sub,
          true,
        ]
      );

    res.status(201).json({
      success: true,
      user: result.rows[0],
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error:
        "Error creando usuario",
    });

  }

};

/*
========================================
GUARDAR INTERESES
========================================
*/

const saveUserInterests =
  async (req, res) => {

    try {

      const {
        usuario_id,
        categorias,
      } = req.body;


      console.log(usuario_id);
      console.log(categorias);

      for (
        const categoriaId
        of categorias
      ) {

        await pool.query(
          `
          INSERT INTO intereses_usuario
          (
            usuario_id,
            categoria_id
          )
          VALUES ($1, $2)
          `,
          [
            usuario_id,
            categoriaId,
          ]
        );

      }

      res.json({
        success: true,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error guardando intereses",
      });

    }

  };

/*
========================================
VERIFICAR INTERESES
========================================
*/

const checkUserInterests =
  async (req, res) => {

    try {

      const { cognito_sub } =
        req.params;

      const userResult =
        await pool.query(
          `
          SELECT id
          FROM usuarios
          WHERE cognito_sub = $1
          `,
          [cognito_sub]
        );

      if (
        userResult.rows.length === 0
      ) {

        return res.status(404).json({
          error:
            "Usuario no encontrado",
        });

      }

      const usuarioId =
        userResult.rows[0].id;

      const interestsResult =
        await pool.query(
          `
          SELECT *
          FROM intereses_usuario
          WHERE usuario_id = $1
          `,
          [usuarioId]
        );

      res.json({
        hasInterests:
          interestsResult.rows
            .length > 0,

        usuario_id:
          usuarioId,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error verificando intereses",
      });

    }

  };


  /*
========================================
ACTUALIZAR INTERESES
========================================
*/

const actualizarIntereses =
  async (req, res) => {

    try {

      const {
        usuario_id,
        categorias,
      } = req.body;

      /*
      ========================================
      ELIMINAR INTERESES ACTUALES
      ========================================
      */

      await pool.query(
        `
        DELETE FROM intereses_usuario
        WHERE usuario_id = $1
        `,
        [usuario_id]
      );

      /*
      ========================================
      INSERTAR NUEVOS
      ========================================
      */

      for (const categoriaId of categorias) {

        await pool.query(
          `
          INSERT INTO intereses_usuario
          (
            usuario_id,
            categoria_id
          )
          VALUES ($1, $2)
          `,
          [
            usuario_id,
            categoriaId,
          ]
        );

      }

      res.json({
        success: true,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Error actualizando intereses",
      });

    }

  };


  /*
========================================
OBTENER INTERESES USUARIO
========================================
*/

const obtenerInteresesUsuario =
  async (req, res) => {

    try {

      const { usuario_id } =
        req.params;

      const result = await pool.query(
        `
        SELECT categoria_id
        FROM intereses_usuario
        WHERE usuario_id = $1
        `,
        [usuario_id]
      );

      const categorias =
        result.rows.map(
          (item) =>
            item.categoria_id
        );

      res.json(categorias);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Error obteniendo intereses",
      });

    }

  };


  /*
========================================
ACTUALIZAR PERFIL
========================================
*/

const actualizarPerfil = 
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        nombre,
        apellidos,
        carrera,
        semestre,
        foto_url,
      } = req.body;

      await pool.query(

        `
        UPDATE usuarios
        SET
          nombre = $1,
          apellidos = $2,
          carrera = $3,
          semestre = $4,
          foto_url = $5,
          updated_at = NOW()
        WHERE id = $6
        `,
        [
          nombre,
          apellidos,
          carrera,
          semestre,
          foto_url,
          id,
        ]

      );

      res.json({
        success: true,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: "Error actualizando perfil",
      });

    }

  };



  /*
========================================
GUARDAR PUSH TOKEN
========================================
*/

const guardarPushToken = 
  async (req, res) => {

    try {

      const { id } = req.params;

      const { expo_push_token } =
        req.body;

      await pool.query(
        `
        UPDATE usuarios
        SET expo_push_token = $1
        WHERE id = $2
        `,
        [
          expo_push_token,
          id,
        ]
      );

      res.json({
        ok: true,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Error guardando push token",
      });

    }

  };






module.exports = {
  getUserByCognitoSub,
  createUser,
  saveUserInterests,
  checkUserInterests,
  actualizarIntereses,
  obtenerInteresesUsuario,
  actualizarPerfil,
  guardarPushToken,
};