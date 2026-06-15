const path = require("path");

require("dotenv").config({
path: path.resolve(__dirname, "../.env"),
});

console.log("__dirname =", __dirname);
console.log("DATABASE_URL =", process.env.DATABASE_URL);

require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);

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
1,
"📚 Nuevo curso disponible",
"Curso de prueba",
"nuevo_curso",
13252,
]
);

await enviarNotificacionPush(
[
"ExponentPushToken[W1IPoWJcuIc_r3fup1jwqi]"
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