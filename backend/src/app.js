require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fetchMoocCourses = require("./workers/moocWorker");
const publicacionesRoutes = require("./routes/publicaciones.routes");
const usersRoutes = require("./routes/users.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const interesesRoutes = require("./routes/intereses.routes");
const preregistroRoutes = require("./routes/preregistro.routes");
const notificacionesRoutes = require("./routes/notificaciones.routes");
const avisosWorker = require("./workers/avisosWorker");
const pool = require("./config/db");

/*
========================================
CONTROL DE EJECUCIÓN
========================================
*/
let ejecutandoMooc = false;
let ejecutandoAvisos = false;


const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/publicaciones", publicacionesRoutes);
app.use("/users", usersRoutes);
app.use("/categorias", categoriasRoutes);
app.use("/intereses", interesesRoutes);
app.use("/preregistro", preregistroRoutes);
app.use("/notificaciones", notificacionesRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "API AvisaTec funcionando 🚀",
      postgres_time: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error conectando a PostgreSQL",
    });
  }
});

// ✅ NUEVO — cron-job.org llama este endpoint cada 30 min para disparar el worker MOOC
app.get("/internal/run-mooc", (req, res) => {
  const secret = req.headers["x-secret"];
  if (secret !== process.env.WORKER_SECRET) {
    return res.status(401).json({ error: "No autorizado" });
  }
  if (ejecutandoMooc) {
    return res.json({ status: "Ya en ejecución, espera..." });
  }
  console.log("🔔 Worker MOOC disparado por cron externo");
  fetchMoocCourses();
  res.json({ status: "Worker MOOC iniciado" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

/*
========================================
EJECUCIÓN INICIAL
========================================
*/
fetchMoocCourses();
avisosWorker();



setInterval(async () => {
  if (ejecutandoMooc) return;
  ejecutandoMooc = true;
  try {
    console.log("Ejecutando worker MOOC");
    await fetchMoocCourses();
  } catch (error) {
    console.log(error);
  } finally {
    ejecutandoMooc = false;
  }
}, 30 * 60 * 1000);

setInterval(async () => {
  if (ejecutandoAvisos) return;
  ejecutandoAvisos = true;
  try {
    console.log("Ejecutando worker Avisos");
    await avisosWorker();
  } catch (error) {
    console.log(error);
  } finally {
    ejecutandoAvisos = false;
  }
}, 30 * 1000);