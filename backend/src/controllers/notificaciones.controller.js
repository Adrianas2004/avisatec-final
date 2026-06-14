const pool = require("../config/db");

/*
========================================
OBTENER NOTIFICACIONES
========================================
*/
const getNotificaciones = async (req, res) => {

  try {

    const { usuarioId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM notificaciones
      WHERE usuario_id = $1
      ORDER BY created_at DESC
      `,
      [usuarioId]
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo notificaciones"
    });

  }

};

/*
========================================
MARCAR LEIDA
========================================
*/
const marcarLeida = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      `
      UPDATE notificaciones
      SET leida = true
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      success: true
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error actualizando notificación"
    });

  }

};

module.exports = {
  getNotificaciones,
  marcarLeida,
};