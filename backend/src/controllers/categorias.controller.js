const pool = require("../config/db");

const getCategorias = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT *
      FROM categorias
      ORDER BY nombre ASC
    `);

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error obteniendo categorías",
    });

  }

};

module.exports = {
  getCategorias,
};