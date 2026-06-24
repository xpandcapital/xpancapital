-- =====================================================
-- Migración: 103_comunidad_social.sql
-- Sistema de Comunidad Social — Muro, Encuestas, Eventos
-- =====================================================

-- ═══════════════════════════════════════════════════════
-- 1. FEED PRINCIPAL
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS comunidad_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL DEFAULT 'post'
        CHECK (tipo IN ('post','encuesta','evento','producto','blog','anuncio')),
    contenido TEXT,
    origen TEXT CHECK (origen IN ('manual','producto','blog')),
    origen_id UUID,
    fijado BOOLEAN DEFAULT false,
    oculto BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- 2. MEDIA ADJUNTA (imágenes/videos/archivos)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS comunidad_post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES comunidad_posts(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('imagen','video','archivo')),
    url_original TEXT NOT NULL,
    url_comprimida TEXT,
    url_thumbnail TEXT,
    mime_type TEXT NOT NULL,
    nombre_archivo TEXT,
    tamaño_original BIGINT NOT NULL,
    tamaño_comprimido BIGINT,
    duracion_segundos INTEGER,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- 3. ENCUESTAS
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS comunidad_encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID UNIQUE NOT NULL REFERENCES comunidad_posts(id) ON DELETE CASCADE,
    pregunta TEXT NOT NULL,
    multiple BOOLEAN DEFAULT false,
    fecha_cierre TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comunidad_encuesta_opciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encuesta_id UUID NOT NULL REFERENCES comunidad_encuestas(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comunidad_encuesta_votos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opcion_id UUID NOT NULL REFERENCES comunidad_encuesta_opciones(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(opcion_id, usuario_id)
);

-- ═══════════════════════════════════════════════════════
-- 4. EVENTOS COMUNITARIOS
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS comunidad_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID UNIQUE NOT NULL REFERENCES comunidad_posts(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ,
    hora_inicio TIME,
    hora_fin TIME,
    ubicacion TEXT,
    ubicacion_url TEXT,
    es_digital BOOLEAN DEFAULT false,
    url_evento TEXT,
    tipo TEXT DEFAULT 'presencial'
        CHECK (tipo IN ('presencial','digital','hibrido')),
    capacidad INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comunidad_evento_inscritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES comunidad_eventos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    estado TEXT DEFAULT 'inscrito'
        CHECK (estado IN ('inscrito','cancelado','asistio')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(evento_id, usuario_id)
);

-- ═══════════════════════════════════════════════════════
-- 5. REACCIONES
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS comunidad_post_reacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES comunidad_posts(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tipo TEXT DEFAULT 'like'
        CHECK (tipo IN ('like','celebrar','apoyar','interesante','triste')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(post_id, usuario_id)
);

-- ═══════════════════════════════════════════════════════
-- 6. COMENTARIOS (anidados)
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS comunidad_post_comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES comunidad_posts(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    padre_id UUID REFERENCES comunidad_post_comentarios(id) ON DELETE CASCADE,
    oculto BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_cposts_empresa     ON comunidad_posts(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cposts_created     ON comunidad_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cposts_tipo        ON comunidad_posts(tipo);
CREATE INDEX IF NOT EXISTS idx_cposts_origen      ON comunidad_posts(origen, origen_id);
CREATE INDEX IF NOT EXISTS idx_cposts_autor       ON comunidad_posts(autor_id);

CREATE INDEX IF NOT EXISTS idx_cmedia_post        ON comunidad_post_media(post_id);

CREATE INDEX IF NOT EXISTS idx_cencuesta_post     ON comunidad_encuestas(post_id);

CREATE INDEX IF NOT EXISTS idx_cvotos_opcion      ON comunidad_encuesta_votos(opcion_id);
CREATE INDEX IF NOT EXISTS idx_cvotos_usuario     ON comunidad_encuesta_votos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_ceventos_post      ON comunidad_eventos(post_id);
CREATE INDEX IF NOT EXISTS idx_ceventos_fecha     ON comunidad_eventos(fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_cinscritos_evento  ON comunidad_evento_inscritos(evento_id);
CREATE INDEX IF NOT EXISTS idx_cinscritos_usuario ON comunidad_evento_inscritos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_creacciones_post   ON comunidad_post_reacciones(post_id);
CREATE INDEX IF NOT EXISTS idx_creacciones_user   ON comunidad_post_reacciones(usuario_id);

CREATE INDEX IF NOT EXISTS idx_ccomentarios_post  ON comunidad_post_comentarios(post_id);
CREATE INDEX IF NOT EXISTS idx_ccomentarios_padre ON comunidad_post_comentarios(padre_id);

-- ═══════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════
ALTER TABLE comunidad_posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad_post_media         ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad_encuestas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad_encuesta_opciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad_encuesta_votos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad_eventos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad_evento_inscritos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad_post_reacciones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunidad_post_comentarios   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comunidad_posts_select" ON comunidad_posts FOR SELECT USING (true);
CREATE POLICY "comunidad_posts_insert" ON comunidad_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_posts_update" ON comunidad_posts FOR UPDATE USING (true);
CREATE POLICY "comunidad_posts_delete" ON comunidad_posts FOR DELETE USING (true);

CREATE POLICY "comunidad_media_select" ON comunidad_post_media FOR SELECT USING (true);
CREATE POLICY "comunidad_media_insert" ON comunidad_post_media FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_media_update" ON comunidad_post_media FOR UPDATE USING (true);
CREATE POLICY "comunidad_media_delete" ON comunidad_post_media FOR DELETE USING (true);

CREATE POLICY "comunidad_encuestas_select" ON comunidad_encuestas FOR SELECT USING (true);
CREATE POLICY "comunidad_encuestas_insert" ON comunidad_encuestas FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_encuestas_update" ON comunidad_encuestas FOR UPDATE USING (true);
CREATE POLICY "comunidad_encuestas_delete" ON comunidad_encuestas FOR DELETE USING (true);

CREATE POLICY "comunidad_opciones_select" ON comunidad_encuesta_opciones FOR SELECT USING (true);
CREATE POLICY "comunidad_opciones_insert" ON comunidad_encuesta_opciones FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_opciones_update" ON comunidad_encuesta_opciones FOR UPDATE USING (true);
CREATE POLICY "comunidad_opciones_delete" ON comunidad_encuesta_opciones FOR DELETE USING (true);

CREATE POLICY "comunidad_votos_select" ON comunidad_encuesta_votos FOR SELECT USING (true);
CREATE POLICY "comunidad_votos_insert" ON comunidad_encuesta_votos FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_votos_delete" ON comunidad_encuesta_votos FOR DELETE USING (true);

CREATE POLICY "comunidad_eventos_select" ON comunidad_eventos FOR SELECT USING (true);
CREATE POLICY "comunidad_eventos_insert" ON comunidad_eventos FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_eventos_update" ON comunidad_eventos FOR UPDATE USING (true);
CREATE POLICY "comunidad_eventos_delete" ON comunidad_eventos FOR DELETE USING (true);

CREATE POLICY "comunidad_inscritos_select" ON comunidad_evento_inscritos FOR SELECT USING (true);
CREATE POLICY "comunidad_inscritos_insert" ON comunidad_evento_inscritos FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_inscritos_update" ON comunidad_evento_inscritos FOR UPDATE USING (true);
CREATE POLICY "comunidad_inscritos_delete" ON comunidad_evento_inscritos FOR DELETE USING (true);

CREATE POLICY "comunidad_reacciones_select" ON comunidad_post_reacciones FOR SELECT USING (true);
CREATE POLICY "comunidad_reacciones_insert" ON comunidad_post_reacciones FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_reacciones_update" ON comunidad_post_reacciones FOR UPDATE USING (true);
CREATE POLICY "comunidad_reacciones_delete" ON comunidad_post_reacciones FOR DELETE USING (true);

CREATE POLICY "comunidad_comentarios_select" ON comunidad_post_comentarios FOR SELECT USING (true);
CREATE POLICY "comunidad_comentarios_insert" ON comunidad_post_comentarios FOR INSERT WITH CHECK (true);
CREATE POLICY "comunidad_comentarios_update" ON comunidad_post_comentarios FOR UPDATE USING (true);
CREATE POLICY "comunidad_comentarios_delete" ON comunidad_post_comentarios FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════
-- TRIGGERS: AUTO-PUBLICACIONES
-- ═══════════════════════════════════════════════════════

-- Producto nuevo/activado -> auto-post
CREATE OR REPLACE FUNCTION auto_post_producto()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    IF NEW.activo = true AND NEW.categoria_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM comunidad_posts
            WHERE origen = 'producto' AND origen_id = NEW.id
        ) THEN
            SELECT id INTO v_admin_id FROM profiles
            WHERE empresa_id = NEW.empresa_id AND rol IN ('admin', 'superadmin')
            LIMIT 1;

            IF v_admin_id IS NOT NULL THEN
                INSERT INTO comunidad_posts (
                    empresa_id, autor_id, tipo, contenido, origen, origen_id
                ) VALUES (
                    NEW.empresa_id,
                    v_admin_id,
                    'producto',
                    '🆕 **' || NEW.nombre || '**' ||
                    CASE WHEN NEW.descripcion IS NOT NULL THEN E'\n\n' || NEW.descripcion ELSE '' END,
                    'producto',
                    NEW.id
                );
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_post_producto ON productos;
CREATE TRIGGER trg_auto_post_producto
AFTER INSERT OR UPDATE OF activo ON productos
FOR EACH ROW EXECUTE FUNCTION auto_post_producto();

-- Blog post publicado -> auto-post
CREATE OR REPLACE FUNCTION auto_post_blog()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    IF NEW.estado = 'publicado' AND (TG_OP = 'INSERT' OR OLD.estado != 'publicado') THEN
        IF NOT EXISTS (
            SELECT 1 FROM comunidad_posts
            WHERE origen = 'blog' AND origen_id = NEW.id
        ) THEN
            SELECT id INTO v_admin_id FROM profiles
            WHERE empresa_id = NEW.empresa_id AND rol = 'admin'
            LIMIT 1;

            INSERT INTO comunidad_posts (
                empresa_id, autor_id, tipo, contenido, origen, origen_id
            ) VALUES (
                NEW.empresa_id,
                COALESCE(NEW.autor_id, v_admin_id),
                'blog',
                '📝 **' || NEW.titulo || '**' ||
                CASE WHEN NEW.extracto IS NOT NULL THEN E'\n\n' || NEW.extracto ELSE '' END,
                'blog',
                NEW.id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_post_blog ON blog_posts;
CREATE TRIGGER trg_auto_post_blog
AFTER INSERT OR UPDATE OF estado ON blog_posts
FOR EACH ROW EXECUTE FUNCTION auto_post_blog();
