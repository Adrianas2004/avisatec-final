CREATE TABLE publicaciones (
    id SERIAL PRIMARY KEY,

    source_id VARCHAR(255) NOT NULL,
    fuente VARCHAR(100) NOT NULL,

    tipo VARCHAR(50),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,

    link TEXT,
    imagen_url TEXT,

    estado VARCHAR(50),

    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,

    hash_origen VARCHAR(255),

    metadata JSONB,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(source_id, fuente)
);