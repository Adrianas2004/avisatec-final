-- =========================================
-- TABLA USUARIOS
-- =========================================

CREATE TABLE IF NOT EXISTS usuarios (

    id SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    apellidos VARCHAR(150),

    email VARCHAR(255) UNIQUE NOT NULL,

    numero_control VARCHAR(20) UNIQUE,

    carrera VARCHAR(150),

    semestre INT,

    rol VARCHAR(50) DEFAULT 'usuario',

    cognito_sub VARCHAR(255),

    foto_url TEXT,

    activo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- TABLA CATEGORIAS
-- =========================================

CREATE TABLE IF NOT EXISTS categorias (

    id SERIAL PRIMARY KEY,

    nombre VARCHAR(100) UNIQUE NOT NULL,

    descripcion TEXT,

    icono VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- TABLA INTERESES USUARIO
-- =========================================

CREATE TABLE IF NOT EXISTS intereses_usuario (

    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,

    categoria_id INT REFERENCES categorias(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY(usuario_id, categoria_id)
);

-- =========================================
-- TABLA FAVORITOS
-- =========================================

CREATE TABLE IF NOT EXISTS favoritos (

    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,

    publicacion_id INT REFERENCES publicaciones(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW(),

    PRIMARY KEY(usuario_id, publicacion_id)
);

-- =========================================
-- TABLA PUBLICACION_CATEGORIAS
-- =========================================

CREATE TABLE IF NOT EXISTS publicacion_categorias (

    publicacion_id INT REFERENCES publicaciones(id) ON DELETE CASCADE,

    categoria_id INT REFERENCES categorias(id) ON DELETE CASCADE,

    PRIMARY KEY(publicacion_id, categoria_id)
);