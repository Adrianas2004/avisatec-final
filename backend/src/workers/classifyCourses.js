// src/workers/classifyCourses.js

require("dotenv").config({ path: "../../.env" });
const pool = require("../config/db");
const { classifyCourse } = require("../utils/categoryClassifier");

async function classifyCourses() {
  try {
    console.log("=================================");
    console.log("CLASIFICANDO CURSOS...");
    console.log("=================================");

    // 1. Traer todas las publicaciones
    const publicationsResult = await pool.query(`
      SELECT id, titulo, descripcion
      FROM publicaciones
    `);

    // 2. Traer todas las categorías y armar un mapa nombre → id
    const categoriesResult = await pool.query(`
      SELECT id, nombre FROM categorias
    `);

    const categoriesMap = {};
    categoriesResult.rows.forEach((cat) => {
      categoriesMap[cat.nombre] = cat.id;
    });

    console.log(`Categorías en BD: ${categoriesResult.rows.length}`);
    console.log(`Publicaciones a clasificar: ${publicationsResult.rows.length}`);
    console.log("=================================");

    let sinCategoria = [];
    let totalRelaciones = 0;

    // 3. Clasificar cada publicación
    for (const publication of publicationsResult.rows) {

      const matchedCategories = classifyCourse(
        publication.titulo,
        publication.descripcion
      );

      if (matchedCategories.length === 0) {
        sinCategoria.push(publication.titulo);
        console.log(`⚠️  SIN CATEGORÍA: "${publication.titulo}"`);
        continue;
      }

      for (const categoryName of matchedCategories) {
        const categoryId = categoriesMap[categoryName];

        // Si el nombre retornado por el clasificador no existe en BD, avisar
        if (!categoryId) {
          console.log(`❌ CATEGORÍA NO ENCONTRADA EN BD: "${categoryName}" (curso: ${publication.titulo})`);
          continue;
        }

        await pool.query(`
          INSERT INTO publicacion_categorias (publicacion_id, categoria_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [publication.id, categoryId]);

        totalRelaciones++;
      }

      console.log(`✅ "${publication.titulo}" → ${matchedCategories.join(", ")}`);
    }

    // 4. Resumen final
    console.log("\n=================================");
    console.log("CLASIFICACIÓN TERMINADA");
    console.log(`Total relaciones creadas: ${totalRelaciones}`);
    console.log(`Cursos sin categoría: ${sinCategoria.length}`);
    if (sinCategoria.length > 0) {
      console.log("\nCursos que NO se clasificaron:");
      sinCategoria.forEach((t) => console.log(`  - ${t}`));
    }
    console.log("=================================");

  } catch (error) {
    console.error("Error en classifyCourses:", error);
  } finally {
    await pool.end();
  }
}

classifyCourses();