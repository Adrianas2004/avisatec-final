const axios = require("axios");
const pool = require("../config/db");
const { enviarNotificacionPush } = require("../services/pushNotifications");

const API_AVISOS = "http://163.192.134.248/api/publicaciones?fuente=manual";

async function avisosWorker() {
  try {
    console.log("=================================");
    console.log("INICIANDO WORKER AVISOS");
    console.log("=================================");

    const response = await axios.get(API_AVISOS);

    const publicaciones = response.data.publicaciones || [];

    console.log(`Avisos encontrados: ${publicaciones.length}`);

    for (const aviso of publicaciones) {
      try {
        /*
        ========================================
        ¿YA EXISTE?
        ========================================
        */

        const existe = await pool.query(
          `
          SELECT aviso_id
          FROM avisos_externos
          WHERE aviso_id = $1
          `,
          [aviso.id]
        );

        if (existe.rows.length > 0) {
          continue;
        }

        console.log(`NUEVO AVISO DETECTADO: ${aviso.titulo}`);

        /*
        ========================================
        GUARDAR CONTROL
        ========================================
        */

        await pool.query(
          `
          INSERT INTO avisos_externos (
            aviso_id,
            titulo
          )
          VALUES ($1,$2)
          `,
          [aviso.id, aviso.titulo]
        );

        /*
        ========================================
        OBTENER TOKENS
        ========================================
        */

        const usuarios = await pool.query(
          `
          SELECT
            id,
            expo_push_token
          FROM usuarios
          WHERE expo_push_token IS NOT NULL
          `
        );

        const tokens = usuarios.rows.map((u) => u.expo_push_token);

        console.log(`Tokens encontrados: ${tokens.length}`);

        /*
        ========================================
        GUARDAR NOTIFICACION
        ========================================
        */

        for (const usuario of usuarios.rows) {
            await pool.query(
                `
                INSERT INTO notificaciones (
                usuario_id,
                titulo,
                mensaje,
                tipo,
                aviso_id
                )
                VALUES ($1,$2,$3,$4,$5)
                `,
                [
                usuario.id,
                "📢 Nuevo aviso",
                aviso.titulo,
                "nuevo_aviso",
                aviso.id
                ]
            );
            }

        /*
        ========================================
        PUSH
        ========================================
        */

        if (tokens.length > 0) {
          await enviarNotificacionPush(
            tokens,
            "📢 Nuevo aviso",
            aviso.titulo,
            {
              tipo: "nuevo_aviso",
              avisoId: aviso.id,
            }
          );

          console.log("Push enviada");
        }
      } catch (error) {
        console.log("ERROR PROCESANDO AVISO");
        console.log(error.message);
      }
    }

    console.log("=================================");
    console.log("WORKER AVISOS TERMINADO");
    console.log("=================================");
  } catch (error) {
    console.log("ERROR WORKER AVISOS");
    console.log(error.message);
  }
}

module.exports = avisosWorker;