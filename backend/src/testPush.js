require("dotenv").config();

console.log(process.env.DB_PASSWORD);

const pool = require("./config/db");

const {
  enviarNotificacionPush,
} = require("./services/pushNotifications");

async function test() {

  await pool.query(
    `
    INSERT INTO notificaciones (
      usuario_id,
      titulo,
      mensaje,
      tipo,
      course_id
    )
    VALUES ($1,$2,$3,$4,$5)
    `,
    [
      11,
      "📚 Nuevo curso disponible",
      "Curso de prueba",
      "nuevo_curso",
      13252,
    ]
  );

  await enviarNotificacionPush(
    [
      "ExponentPushToken[QKRIQZAeQu_TMi29TMt4hY]"
    ],
    "📚 Nuevo curso disponible",
    "Curso de prueba",
    {
      tipo: "nuevo_curso",
      courseId: 13252,
    }
  );

  console.log("Push enviada y guardada");

}

test();