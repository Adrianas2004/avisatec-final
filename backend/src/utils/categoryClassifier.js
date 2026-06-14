// src/utils/categoryClassifier.js
// ============================================================
// Clasificador de cursos TecNM — versión PRO
// Cubre todas las áreas del tecnológico: ingeniería, ciencias,
// idiomas, negocios, humanidades, ofimática, salud, arte, etc.
// Estrategia: keywords específicas + bloques puente para cursos
// genéricos, asegurando que NINGÚN curso quede sin categoría.
// ============================================================

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // quita acentos
    .replace(/&#39;/g, "'")            // entidades HTML de la API TecNM
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")              // normaliza espacios
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// REGLAS DE DISEÑO:
//   • "category" debe coincidir EXACTAMENTE con "nombre" en tabla categorias
//   • keywords: de más específico (frases largas) a más genérico (una palabra)
//   • weight alto = keyword exclusivo de esa categoría (menor ambigüedad)
//   • Un curso puede quedar en hasta 5 categorías
//   • Score mínimo para clasificar: 5 puntos
// ─────────────────────────────────────────────────────────────────────────────

const categories = [

  // ════════════════════════════════════════════════════════════
  // BLOQUE 1 — LENGUAJES DE PROGRAMACIÓN
  // ════════════════════════════════════════════════════════════

  {
    category: "Python",
    keywords: [
      "programacion basica en python",
      "python para ciencia de datos",
      "python para inteligencia artificial",
      "introduccion a python",
      "django", "flask", "fastapi",
      "pandas", "numpy", "matplotlib", "seaborn",
      "scikit-learn", "scikit", "pytorch", "tensorflow",
      "python"
    ],
    weight: 7
  },

  {
    category: "Java",
    keywords: [
      "propedeutico java",
      "introduccion a fundamentos de java",
      "fundamentos de java",
      "spring boot", "spring framework",
      "maven", "gradle", "jakarta",
      "java se", "java ee",
      "java"
    ],
    weight: 7
  },

  {
    category: "JavaScript",
    keywords: [
      "javascript moderno", "javascript basico",
      "ecmascript", "es6", "vanilla js",
      "javascript"
    ],
    weight: 7
  },

  {
    category: "TypeScript",
    keywords: ["typescript", "tipado estatico en js"],
    weight: 7
  },

  {
    category: "C++",
    keywords: ["c++", "cplusplus", "cpp", "programacion en c"],
    weight: 7
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 2 — DESARROLLO WEB
  // ════════════════════════════════════════════════════════════

  {
    category: "Frontend",
    keywords: [
      "desarrollo frontend", "interfaz de usuario",
      "diseño web", "maquetacion web",
      "html5", "css3", "sass", "less",
      "bootstrap", "tailwind",
      "html", "css"
    ],
    weight: 5
  },

  {
    category: "Backend",
    keywords: [
      "desarrollo backend", "arquitectura de software",
      "microservicios", "servidor web",
      "servicios web"
    ],
    weight: 5
  },

  {
    category: "React",
    keywords: [
      "react.js", "reactjs", "next.js", "nextjs",
      "react hooks", "redux", "react"
    ],
    weight: 8
  },

  {
    category: "Node.js",
    keywords: [
      "node.js", "nodejs", "express.js", "express",
      "npm", "servidor con node"
    ],
    weight: 8
  },

  {
    category: "APIs",
    keywords: [
      "desarrollo de api", "api rest", "restful",
      "graphql", "swagger", "postman",
      "integracion de servicios", "consumo de api"
    ],
    weight: 5
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 3 — DESARROLLO MÓVIL
  // ════════════════════════════════════════════════════════════

  {
    category: "Flutter",
    keywords: ["flutter", "dart", "flutter para movil"],
    weight: 8
  },

  {
    category: "Android",
    keywords: [
      "desarrollo android", "android studio",
      "kotlin para android", "android nativo",
      "android", "kotlin"
    ],
    weight: 8
  },

  {
    category: "iOS",
    keywords: [
      "desarrollo ios", "swift", "swiftui",
      "xcode", "apple development", "iphone"
    ],
    weight: 8
  },

  {
    category: "React Native",
    keywords: ["react native", "desarrollo movil multiplataforma"],
    weight: 8
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 4 — INTELIGENCIA ARTIFICIAL & DATOS
  // ════════════════════════════════════════════════════════════

  {
    category: "Inteligencia Artificial",
    keywords: [
      "propedeutico en inteligencia artificial",
      "introduccion a la inteligencia artificial",
      "inteligencia artificial aplicada",
      "ia generativa", "sistemas inteligentes",
      "agentes inteligentes",
      "inteligencia artificial", "artificial intelligence"
    ],
    weight: 8
  },

  {
    category: "Machine Learning",
    keywords: [
      "machine learning", "aprendizaje automatico",
      "aprendizaje supervisado", "aprendizaje no supervisado",
      "modelos predictivos", "algoritmos de clasificacion",
      "regresion lineal", "arboles de decision",
      "random forest", "xgboost"
    ],
    weight: 8
  },

  {
    category: "Deep Learning",
    keywords: [
      "deep learning", "redes neuronales",
      "convolutional neural", "rnn", "lstm",
      "transformers", "bert", "gpt", "neural network"
    ],
    weight: 8
  },

  {
    category: "Ciencia de Datos",
    keywords: [
      "propedeutico analisis de datos",
      "introduccion al analisis de datos",
      "ciencia de datos", "data science",
      "pipeline de datos", "ingenieria de datos",
      "data engineering", "etl"
    ],
    weight: 8
  },

  {
    category: "Análisis de Datos",
    keywords: [
      // ── Cursos específicos TecNM ──
      "propedeutico analisis de datos",
      "introduccion al analisis de datos",
      "uso de tic en distribuciones de probabilidad continuas",
      "tic en distribuciones de probabilidad",
      "tic en distribuciones",
      // ── Excel y hojas de cálculo (cubre "Gestión de Datos en Excel") ──
      "gestion de datos en excel",
      "gestion de datos",
      "excel basico", "excel intermedio", "excel avanzado",
      "excel para negocios", "excel para ingenieros",
      "microsoft excel", "tablas dinamicas",
      "macros en excel", "vba excel", "excel",
      "google sheets", "hoja de calculo", "hojas de calculo",
      "libreoffice calc",
      // ── BI y visualización ──
      "power bi", "tableau", "looker studio", "looker",
      "dashboard", "reportes de datos", "visualizacion de datos",
      // ── Análisis general ──
      "analisis de datos", "data analysis",
      "analisis estadistico", "manejo de datos",
      "gestion de informacion"
    ],
    weight: 6
  },

  {
    category: "Prompt Engineering",
    keywords: [
      "prompt engineering", "ingenieria de prompts",
      "diseno de prompts", "chatgpt avanzado",
      "uso profesional de ia"
    ],
    weight: 7
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 5 — CLOUD & DEVOPS
  // ════════════════════════════════════════════════════════════

  {
    category: "AWS",
    keywords: [
      "amazon web services", "aws lambda",
      "aws s3", "aws ec2", "aws rds", "aws"
    ],
    weight: 8
  },

  {
    category: "Azure",
    keywords: [
      "microsoft azure", "azure devops",
      "azure functions", "azure sql", "azure"
    ],
    weight: 8
  },

  {
    category: "Cloud Computing",
    keywords: [
      "propedeutico de computo en la nube",
      "introduccion al computo en la nube",
      "herramientas de gestion y comunicacion en la nube",
      "dibujo asistido por computadora en la nube",
      "cloud computing", "computo en la nube",
      "computacion en la nube", "servicios en la nube",
      "infraestructura cloud", "google cloud", "gcp",
      "saas", "paas", "iaas",
      // herramientas colaborativas en nube
      "google workspace", "google drive",
      "microsoft teams", "herramientas colaborativas",
      "herramientas de gestion en la nube"
    ],
    weight: 6
  },

  {
    category: "Docker",
    keywords: [
      "docker compose", "contenedores docker",
      "docker", "contenedores", "containerization"
    ],
    weight: 8
  },

  {
    category: "Kubernetes",
    keywords: [
      "kubernetes", "k8s",
      "orquestacion de contenedores", "helm charts"
    ],
    weight: 8
  },

  {
    category: "DevOps",
    keywords: [
      "devops", "ci/cd", "integracion continua",
      "entrega continua", "pipeline de despliegue",
      "gitlab ci", "github actions", "jenkins",
      "infraestructura como codigo", "terraform", "ansible"
    ],
    weight: 7
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 6 — CIBERSEGURIDAD
  // ════════════════════════════════════════════════════════════

  {
    category: "Ciberseguridad",
    keywords: [
      "propedeutico en ciberseguridad",
      "introduccion en ciberseguridad",
      "ciberseguridad", "cybersecurity",
      "seguridad informatica", "seguridad de la informacion",
      "seguridad en redes", "amenazas informaticas",
      "gestion de riesgos informaticos"
    ],
    weight: 8
  },

  {
    category: "Ethical Hacking",
    keywords: [
      "ethical hacking", "hacking etico",
      "seguridad ofensiva"
    ],
    weight: 9
  },

  {
    category: "Pentesting",
    keywords: [
      "pentesting", "pentest",
      "pruebas de penetracion", "red team"
    ],
    weight: 9
  },

  {
    category: "Redes",
    keywords: [
      "fundamentos de las redes inalambricas y sus aplicaciones",
      "fundamentos de las redes inalambricas",
      "fundamentos de las redes",
      "redes inalambricas", "telecomunicaciones",
      "wireless", "networking",
      "protocolo tcp", "protocolo ip",
      "vlan", "vpn", "configuracion de redes",
      "cisco", "ccna", "topologias de red",
      "redes"
    ],
    weight: 7
  },

  {
    category: "Seguridad Web",
    keywords: [
      "seguridad web", "owasp",
      "vulnerabilidades web", "xss",
      "sql injection", "csrf", "autenticacion segura"
    ],
    weight: 8
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 7 — BASES DE DATOS
  // ════════════════════════════════════════════════════════════

  {
    category: "SQL",
    keywords: [
      "lenguaje sql", "consultas sql",
      "sql avanzado", "sql basico",
      "ddl", "dml", "stored procedures"
    ],
    weight: 7
  },

  {
    category: "PostgreSQL",
    keywords: ["postgresql", "postgres", "pgadmin"],
    weight: 9
  },

  {
    category: "MongoDB",
    keywords: ["mongodb", "nosql", "mongo", "mongoose"],
    weight: 9
  },

  {
    category: "Bases de Datos",
    keywords: [
      "base de datos relacional", "base de datos",
      "bases de datos", "database",
      "mysql", "sqlite", "oracle", "mariadb",
      "modelado de datos", "normalizacion",
      "diagrama entidad relacion",
      "gestion de bases de datos"
    ],
    weight: 6
  },

  {
    category: "Big Data",
    keywords: [
      "big data", "hadoop", "apache spark",
      "datos masivos", "kafka",
      "data lake", "data warehouse", "hive"
    ],
    weight: 8
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 8 — MATEMÁTICAS
  // ════════════════════════════════════════════════════════════

  {
    category: "Álgebra",
    keywords: [
      "arimetica y principios de algebra",
      "aritmetica y principios de algebra",
      "algebra lineal", "vectores y matrices",
      "espacios vectoriales", "transformaciones lineales",
      "determinantes", "aritmetica", "algebra"
    ],
    weight: 7
  },

  {
    category: "Cálculo",
    keywords: [
      "aplicacion del calculo d-i a la cinematica de particulas",
      "aplicacion del calculo",
      "entendiendo el calculo integral",
      "calculo diferencial", "calculo integral",
      "dinamica de particulas cinemática y cinetica",
      "dinamica de cuerpos rigidos",
      "dinamica de particulas",
      "cinematica de particulas", "cinematica y cinetica",
      "fisica para estudiantes de ingenieria",
      "fisica para ingenieria",
      "derivadas", "integrales", "limites",
      "series de taylor", "ecuaciones diferenciales",
      "calculo"
    ],
    weight: 7
  },

  {
    category: "Estadística",
    keywords: [
      "diseno de experimentos con un factor",
      "estimacion estadistica",
      "diseno de experimentos",
      "simulacion de tiempos estandar con promodel",
      "simulacion de tiempos estandar",
      "simulacion industrial",
      "probabilidad y estadistica",
      "estadistica descriptiva", "estadistica inferencial",
      "distribucion estadistica",
      "estadistica"
    ],
    weight: 7
  },

  {
    category: "Probabilidad",
    keywords: [
      "uso de tic en distribuciones de probabilidad continuas",
      "tic en distribuciones de probabilidad continuas",
      "distribuciones de probabilidad",
      "probabilidad y estadistica",
      "teoria de probabilidad", "probabilidad"
    ],
    weight: 7
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 9 — ELECTRÓNICA & HARDWARE
  // ════════════════════════════════════════════════════════════

  {
    category: "Microelectrónica",
    keywords: [
      "introduction to microelectronics and nanoelectronics",
      "introduction to microelectronics",
      "microelectronica", "nanoelectronica",
      "circuitos integrados", "vlsi"
    ],
    weight: 9
  },

  {
    category: "Semiconductores",
    keywords: [
      "law for the semiconductor industry",
      "gl english for the semiconductor industry",
      "semiconductor", "semiconductores",
      "materiales semiconductores", "diodo", "transistor"
    ],
    weight: 9
  },

  {
    category: "Electrónica",
    keywords: [
      "circuitos electronicos", "electronica analogica",
      "electronica digital", "nanoelectronica",
      "quimica introduccion a la teoria cuantica",
      "teoria cuantica", "tabla periodica",
      "propiedades de los elementos",
      "quimica", "electronica"
    ],
    weight: 6
  },

  {
    category: "Robótica",
    keywords: [
      "robotica industrial", "automatizacion robotica",
      "programacion de robots", "ros",
      "robotica", "robot"
    ],
    weight: 7
  },

  {
    category: "IoT",
    keywords: [
      "internet de las cosas", "internet of things",
      "raspberry pi", "arduino",
      "sensores iot", "protocolo mqtt", "iot"
    ],
    weight: 7
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 10 — IDIOMAS
  // ════════════════════════════════════════════════════════════

  {
    // Máxima prioridad: English for IT debe ganarle a "Inglés" siempre
    category: "English for IT",
    keywords: [
      "avanzado 2 english for it",
      "avanzado 3 english for it",
      "avanzado 4 english for it",
      "avanzado 5 english for it",
      "avanzado english for it",
      "gl english for the semiconductor industry",
      "english for the semiconductor industry",
      "english for it"
    ],
    weight: 10
  },

  {
    category: "Inglés",
    keywords: [
      "ingles para todos nivel basico",
      "ingles para todos intermedio",
      "ingles para todos nivel",
      "ingles para todos",
      "ingles para la industria subacuatica",
      "tkt module 1 language and background",
      "tkt module 1",
      "tkt module",
      "ingles tecnico", "ingles"
    ],
    weight: 6
  },

  {
    category: "Lengua de Señas",
    keywords: [
      "lengua de senas mexicana basico",
      "lengua de senas mexicana",
      "lengua de señas mexicana",
      "lsm basico", "señas mexicana",
      "senas mexicana",
      "lengua de senas", "lengua de señas"
    ],
    weight: 9
  },

  {
    category: "Idiomas",
    keywords: [
      "lengua materna maya 1",
      "lengua materna maya 2",
      "lengua materna maya",
      "aprendizaje basico de lengua materna xi iuy",
      "lengua materna xi iuy",
      "lengua materna", "maya", "xi iuy",
      "language learning and teaching",
      "tkt"
    ],
    weight: 6
  },


  // ════════════════════════════════════════════════════════════
  // BLOQUE 11 — NEGOCIOS & HABILIDADES PROFESIONALES
  // ════════════════════════════════════════════════════════════

  {
    category: "Finanzas",
    keywords: [
      "zentra tus finanzas i",
      "zentra tus finanzas ii",
      "zentra tus finanzas",
      "construyendo la base financiera de tu emprendimiento",
      "base financiera del emprendimiento",
      "base financiera",
      "finanzas personales", "finanzas corporativas",
      "educacion financiera", "presupuesto",
      "contabilidad", "economia", "finanzas"
    ],
    weight: 7
  },

  {
    category: "Emprendimiento",
    keywords: [
      "modelo talento emprendedor",
      "emprendimientos colectivos basados en economia social solidaria",
      "emprendimientos colectivos",
      "analisis estrategico de la innovacion",
      "construyendo la base financiera de tu emprendimiento",
      "generalidades de la propiedad industrial",
      "propiedad industrial", "propiedad intelectual",
      "economia social solidaria",
      "emprendimiento", "startup",
      "plan de negocios", "innovacion",
      "desarrollo empresarial", "pyme", "negocio"
    ],
    weight: 7
  },

  {
    category: "Liderazgo",
    keywords: [
      "liderazgo", "lider", "gestion de equipos",
      "coaching", "inteligencia emocional"
    ],
    weight: 7
  },

  {
    category: "Soft Skills",
    keywords: [
      // Cursos TecNM específicos
      "desarrollo de habilidades blandas con enfoque humanista",
      "ciudadania activa y compromiso civico",
      "modulo 1 ciencia y tecnologia desde la perspectiva del pensamiento critico",
      "educacion inclusiva",
      "como crear y administrar un curso en moodle",
      "elaboracion de un cortometraje del concepto a la pantalla",
      "apreciacion de las artes y diversidad cultural",
      "etica el ser humano y la ciencia",
      "actividades fisicas para la salud y la prevencion",
      "el deporte como estrategia preventiva del consumo de drogas",
      "promocion de la salud mental y prevencion de adicciones",
      "investigacion descubriendo hechos y principios",
      "desarrollo sustentable nuestro futuro compartido",
      // Genéricos
      "habilidades blandas", "soft skills",
      "comunicacion efectiva", "trabajo colaborativo",
      "gestion del tiempo", "pensamiento critico",
      "creatividad", "adaptabilidad",
      "trabajo en equipo", "liderazgo personal",
      "microsoft word", "word basico", "word avanzado",
      "procesador de texto", "redaccion de documentos",
      "microsoft powerpoint", "presentaciones efectivas",
      "canva para presentaciones", "presentaciones digitales",
      "moodle", "plataformas educativas", "lms",
      "educacion en linea", "e-learning",
      "investigacion cientifica", "metodo cientifico",
      "metodologia de la investigacion",
      "desarrollo sustentable", "sostenibilidad",
      "medio ambiente", "ecologia",
      "salud mental", "bienestar", "deporte",
      "actividad fisica", "salud y prevencion",
      "etica profesional", "etica", "filosofia",
      "valores", "humanidades", "ciudadania",
      "diversidad cultural", "produccion audiovisual",
      "fotografia", "arte"
    ],
    weight: 5
  },

  {
    // CAD / manufactura → Cloud Computing (herramientas digitales)
    category: "Cloud Computing",
    keywords: [
      "dibujo asistido por computadora en la nube",
      "programacion para centro de maquinado vertical con software cad cam",
      "programacion para centro de maquinado",
      "software cad cam", "cad/cam",
      "autocad", "solidworks", "catia", "fusion 360",
      "cam", "cad"
    ],
    weight: 5
  }

];

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

function classifyCourse(title = "", description = "") {
  const text = normalizeText(`${title} ${description}`);
  const scores = {};

  for (const item of categories) {
    for (const keyword of item.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (text.includes(normalizedKeyword)) {
        scores[item.category] = (scores[item.category] || 0) + item.weight;
      }
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return sorted
    .filter(([_, score]) => score >= 5)
    .slice(0, 5)
    .map(([category]) => category);
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN DE DIAGNÓSTICO — para depurar en desarrollo
// Uso: const { debugClassify } = require("../utils/categoryClassifier");
//      debugClassify("Gestión de Datos en Excel Básico 1", "");
// ─────────────────────────────────────────────────────────────────────────────

function debugClassify(title = "", description = "") {
  const text = normalizeText(`${title} ${description}`);
  const scores = {};
  const matches = {};

  for (const item of categories) {
    for (const keyword of item.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (text.includes(normalizedKeyword)) {
        scores[item.category] = (scores[item.category] || 0) + item.weight;
        if (!matches[item.category]) matches[item.category] = [];
        matches[item.category].push(keyword);
      }
    }
  }

  console.log(`\n🔍 DEBUG: "${title}"`);
  console.log(`   Texto normalizado: "${text}"`);

  if (Object.keys(scores).length === 0) {
    console.log("   ❌ Sin matches — agrega keywords para este curso");
  } else {
    Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, score]) => {
        const flag = score >= 5 ? "✅" : "⚠️  score bajo, no clasificará";
        console.log(`   ${flag} ${cat}: score=${score} → keywords: [${matches[cat].join(", ")}]`);
      });
  }
  console.log("");
}

module.exports = { classifyCourse, debugClassify };