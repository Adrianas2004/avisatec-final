const axios = require("axios");

const pool = require("../config/db");

const {
  classifyCourse,
} = require("../utils/categoryClassifier");

const {
  enviarNotificacionPush,
} = require("../services/pushNotifications");

const BASE_URL =
  "https://mooc.tecnm.mx/api/courses/v1/courses/?page_size=100";

async function fetchMoocCourses() {

  try {

    console.log("=================================");
    console.log("INICIANDO WORKER MOOC");
    console.log("=================================");

    let currentUrl = BASE_URL;

    let totalProcesados = 0;

    /*
    ========================================
    VERIFICAR SI ES PRIMERA CARGA
    ========================================
    */

    const publicacionesExistentes = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM publicaciones
      WHERE fuente = 'tecnm_mooc'
      `
    );

    const esPrimeraCarga =
      Number(
        publicacionesExistentes.rows[0].total
      ) === 0;

    console.log(
      "¿Primera carga?:",
      esPrimeraCarga
    );

    /*
    ========================================
    RECORRER PAGINACIÓN
    ========================================
    */

    while (currentUrl) {

      console.log("Consultando:", currentUrl);

      const response =
        await axios.get(currentUrl);

      const data = response.data;

      const courses = data.results;

      console.log(
        `Cursos encontrados: ${courses.length}`
      );

      /*
      ========================================
      RECORRER CURSOS
      ========================================
      */

      for (const course of courses) {

        try {

          /*
          ========================================
          VERIFICAR SI YA EXISTE
          ========================================
          */

          const existingCourse =
            await pool.query(
              `
              SELECT id
              FROM publicaciones
              WHERE source_id = $1
              AND fuente = 'tecnm_mooc'
              `,
              [course.id]
            );

          const esNuevo =
            existingCourse.rows.length === 0;

          /*
          ========================================
          GUARDAR O ACTUALIZAR CURSO
          ========================================
          */

          const insertResult =
            await pool.query(
              `
              INSERT INTO publicaciones (
                source_id,
                fuente,
                tipo,
                titulo,
                descripcion,
                link,
                imagen_url,
                estado,
                fecha_inicio,
                fecha_fin,
                metadata,
                updated_at
              )

              VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()
              )

              ON CONFLICT (source_id, fuente)

              DO UPDATE SET
                titulo = EXCLUDED.titulo,
                descripcion = EXCLUDED.descripcion,
                imagen_url = EXCLUDED.imagen_url,
                estado = EXCLUDED.estado,
                fecha_inicio = EXCLUDED.fecha_inicio,
                fecha_fin = EXCLUDED.fecha_fin,
                metadata = EXCLUDED.metadata,
                updated_at = NOW()

              RETURNING id
              `,
              [
                course.id,
                "tecnm_mooc",
                "curso",
                course.name,
                course.short_description || "",
                `https://mooc.tecnm.mx/courses/${course.id}/about`,
                course.media?.image?.raw || null,
                course.pacing || null,
                course.start || null,
                course.end || null,
                course,
              ]
            );

          const publicacionId =
            insertResult.rows[0].id;

          totalProcesados++;

          console.log(
            `Procesado: ${course.name}`
          );

          /*
          ========================================
          SOLO SI ES NUEVO
          ========================================
          */

          if (esNuevo) {

            console.log(
              "NUEVO CURSO DETECTADO"
            );

            /*
            ========================================
            CLASIFICAR CURSO
            ========================================
            */

            const categoriasDetectadas =
              classifyCourse(
                course.name,
                course.short_description || ""
              );

            console.log(
              "Categorías detectadas:"
            );

            console.log(
              categoriasDetectadas
            );

            /*
            ========================================
            CREAR RELACIONES
            ========================================
            */

            for (const categoriaNombre of categoriasDetectadas) {

              const categoriaResult =
                await pool.query(
                  `
                  SELECT id
                  FROM categorias
                  WHERE nombre = $1
                  `,
                  [categoriaNombre]
                );

              if (
                categoriaResult.rows.length > 0
              ) {

                const categoriaId =
                  categoriaResult.rows[0].id;

                await pool.query(
                  `
                  INSERT INTO publicacion_categorias (
                    publicacion_id,
                    categoria_id
                  )

                  VALUES ($1, $2)

                  ON CONFLICT DO NOTHING
                  `,
                  [
                    publicacionId,
                    categoriaId,
                  ]
                );
              }
            }

            /*
            ========================================
            EVITAR PUSH EN PRIMERA CARGA
            ========================================
            */

            if (!esPrimeraCarga) {

              /*
              ========================================
              BUSCAR USUARIOS INTERESADOS
              ========================================
              */

              const usuarios =
                await pool.query(
                  `
                  SELECT DISTINCT
                    u.id,
                    u.expo_push_token

                  FROM usuarios u

                  INNER JOIN intereses_usuario iu
                    ON iu.usuario_id = u.id

                  INNER JOIN categorias c
                    ON c.id = iu.categoria_id

                  WHERE c.nombre = ANY($1)

                  AND u.expo_push_token IS NOT NULL
                  `,
                  [categoriasDetectadas]
                );


                for (const usuario of usuarios.rows) {

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
                      usuario.id,
                      "📚 Nuevo curso disponible",
                      course.name,
                      "nuevo_curso",
                      publicacionId
                    ]
                  );

                }

              const tokens =
                usuarios.rows.map(
                  (u) => u.expo_push_token
                );

              console.log(
                `Usuarios interesados: ${tokens.length}`
              );

              /*
              ========================================
              ENVIAR PUSH
              ========================================
              */

              if (tokens.length > 0) {

                await enviarNotificacionPush(
                  tokens,

                  "📚 Nuevo curso disponible",

                  course.name,

                  {
                    tipo: "nuevo_curso",

                    courseId: publicacionId,
                  }
                );

                console.log(
                  "Push enviado correctamente"
                );
              }
            }
          }

        } catch (error) {

          console.log(
            "================================="
          );

          console.log(
            "ERROR PROCESANDO CURSO"
          );

          console.log(course.name);

          console.log(error.message);

          console.log(
            "================================="
          );

        }
      }

      /*
      ========================================
      SIGUIENTE PÁGINA
      ========================================
      */

      currentUrl =
        data.pagination.next;
    }

    console.log("=================================");

    console.log(
      "WORKER TERMINADO"
    );

    console.log(
      `Total procesados: ${totalProcesados}`
    );

    console.log("=================================");

  } catch (error) {

    console.log(
      "ERROR GENERAL WORKER:"
    );

    console.log(error.message);

  }
}

module.exports = fetchMoocCourses;