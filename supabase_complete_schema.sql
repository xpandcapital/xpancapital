-- ═══════════════════════════════════════════════════════════════════════════════
-- BLIS CORP - ESQUEMA COMPLETO DE BASE DE DATOS v2.0
-- Multi-tenant | Blog | E-commerce | Blis Coins | Referidos | Gamificación
-- ═══════════════════════════════════════════════════════════════════════════════
-- Ejecutar en orden: Secciones 1-18
-- Última actualización: 2024
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 1: EXTENSIONES Y FUNCIONES BASE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para generar código de referido único
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 2: MULTI-TENANT (EMPRESAS)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE empresas (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug                  TEXT UNIQUE NOT NULL,
    nombre                TEXT NOT NULL,
    nombre_legal          TEXT,
    
    -- Branding
    logo_url              TEXT,
    logo_dark_url         TEXT,
    favicon_url           TEXT,
    color_primario        TEXT DEFAULT '#B10D24',
    color_secundario      TEXT DEFAULT '#000000',
    color_acento          TEXT DEFAULT '#10B981',
    
    -- Configuración regional
    moneda_base           TEXT DEFAULT 'USD',
    monedas_activas       JSONB DEFAULT '["USD"]',
    idioma                TEXT DEFAULT 'es',
    zona_horaria          TEXT DEFAULT 'America/Lima',
    
    -- Fiscal
    pais_fiscal           TEXT DEFAULT 'PE',
    ruc                   TEXT,
    razon_social          TEXT,
    direccion_fiscal      TEXT,
    
    -- Dominios
    dominio_principal     TEXT,
    dominios_alias        JSONB DEFAULT '[]',
    
    -- Estado y límites
    activo                BOOLEAN DEFAULT true,
    plan                  TEXT DEFAULT 'starter' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    plan_limite_usuarios  INTEGER DEFAULT 100,
    plan_limite_productos INTEGER DEFAULT 1000,
    plan_limite_almacenamiento BIGINT DEFAULT 10737418240, -- 10GB en bytes (BIGINT para valores > 2GB)
    
    creado_en             TIMESTAMPTZ DEFAULT now(),
    actualizado_en        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE empresa_config (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID UNIQUE REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Funcionalidades
    blog_activo           BOOLEAN DEFAULT true,
    tienda_activa         BOOLEAN DEFAULT true,
    academia_activa       BOOLEAN DEFAULT false,
    referidos_activo      BOOLEAN DEFAULT true,
    bliscoins_activo      BOOLEAN DEFAULT true,
    
    -- Envíos
    envios_activo         BOOLEAN DEFAULT true,
    envios_gratis_monto   DECIMAL(10,2),
    
    -- Gamificación
    coins_por_lectura     INTEGER DEFAULT 5,
    segundos_lectura      INTEGER DEFAULT 60,
    coins_registro        INTEGER DEFAULT 100,
    coins_referido       INTEGER DEFAULT 50,
    
    -- Legal
    terminos_condiciones  TEXT,
    politica_privacidad   TEXT,
    
    creado_en             TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at_empresas
    BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 3: NIVELES DE CLIENTE (PERSONALIZABLES)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE niveles_cliente (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    slug                  TEXT NOT NULL,
    color                 TEXT DEFAULT '#6B7280',
    icono                 TEXT DEFAULT 'Award',
    orden                 INTEGER DEFAULT 0,
    
    -- Requisitos
    compras_minimas       INTEGER DEFAULT 0,
    coins_minimos         INTEGER DEFAULT 0,
    referidos_minimos     INTEGER DEFAULT 0,
    monto_minimo          DECIMAL(12,2) DEFAULT 0,
    
    -- Beneficios
    descuento_porcentaje  DECIMAL(5,2) DEFAULT 0,
    coins_bonus_porcentaje DECIMAL(5,2) DEFAULT 0,
    envio_gratis          BOOLEAN DEFAULT false,
    soporte_prioritario   BOOLEAN DEFAULT false,
    acceso_eventos        BOOLEAN DEFAULT false,
    
    -- Comisión por referidos
    comision_porcentaje   DECIMAL(5,2) DEFAULT 0,
    comision_tipo        TEXT DEFAULT 'porcentaje' CHECK (comision_tipo IN ('porcentaje', 'monto_fijo_coins', 'monto_fijo_usd')),
    
    creado_en             TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_niveles_slug ON niveles_cliente(empresa_id, slug);
CREATE INDEX idx_niveles_orden ON niveles_cliente(empresa_id, orden);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 4: PERFILES DE USUARIO
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE profiles (
    id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Datos básicos
    email                 TEXT NOT NULL,
    nombre                TEXT,
    apellido              TEXT,
    avatar_url            TEXT,
    telefono              TEXT,
    fecha_nacimiento      DATE,
    
    -- Tipo de cuenta
    tipo_cuenta          TEXT DEFAULT 'persona' CHECK (tipo_cuenta IN ('persona', 'empresa')),
    
    -- Datos de empresa
    empresa_nombre        TEXT,
    empresa_razon_social TEXT,
    empresa_ruc          TEXT,
    empresa_rep_legal    TEXT,
    
    -- Documento de identidad
    tipo_documento       TEXT CHECK (tipo_documento IN ('DNI', 'RUC', 'Cedula', 'Pasaporte', 'CE', 'RUT', 'CURP', 'RFC', 'NIT', 'TI', 'CC', 'CPF', 'CI')),
    numero_documento      TEXT,
    
    -- Nacionalidad y ubicación
    pais                 TEXT DEFAULT 'PE',
    region               TEXT,
    ciudad               TEXT,
    
    -- Datos personales adicionales
    estado_civil        TEXT,
    profesion           TEXT,
    educacion           TEXT,
    
    -- Verificación
    verificado          BOOLEAN DEFAULT false,
    verificado_en       TIMESTAMPTZ,
    verificado_por      UUID REFERENCES auth.users(id),
    
    -- Nivel/Tier
    nivel_id            UUID REFERENCES niveles_cliente(id) ON DELETE SET NULL,
    
    -- Blis Coins
    blis_coins          INTEGER DEFAULT 0,
    coins_totales_ganados INTEGER DEFAULT 0,
    coins_totales_gastados INTEGER DEFAULT 0,
    coins_expiran       DATE,
    
    -- Permisos
    rol                 TEXT DEFAULT 'usuario' CHECK (rol IN ('usuario', 'cliente', 'editor', 'admin', 'superadmin')),
    ha_comprado         BOOLEAN DEFAULT false,
    
    -- Preferencias
    recibir_newsletter  BOOLEAN DEFAULT true,
    recibir_push        BOOLEAN DEFAULT true,
    idioma             TEXT DEFAULT 'es',
    tema               TEXT DEFAULT 'dark',
    courier_preferido  TEXT DEFAULT 'home' CHECK (courier_preferido IN ('pickup', 'home', 'office')),
    
    -- Referidos
    codigo_referido     TEXT UNIQUE,
    referido_por        UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Notas internas
    notas_internas      TEXT,
    es_caso_dificil     BOOLEAN DEFAULT false,
    
    -- Automatizaciones
    cumpleanos_auto_regalo BOOLEAN DEFAULT true,
    recordatorio_inactividad BOOLEAN DEFAULT false,
    
    -- Estado
    cuenta_congelada    BOOLEAN DEFAULT false,
    cuenta_fusionada_con UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Métricas
    ultimo_login       TIMESTAMPTZ,
    total_compras      INTEGER DEFAULT 0,
    total_gastado_usd  DECIMAL(12,2) DEFAULT 0,
    total_referidos    INTEGER DEFAULT 0,
    
    creado_en          TIMESTAMPTZ DEFAULT now(),
    actualizado_en     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_empresa ON profiles(empresa_id);
CREATE INDEX idx_profiles_codigo_referido ON profiles(codigo_referido);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_rol ON profiles(rol);
CREATE INDEX idx_profiles_nivel ON profiles(nivel_id);

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 5: DIRECCIONES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE direcciones (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    tipo                  TEXT CHECK (tipo IN ('envio', 'facturacion', 'oficina', 'otra')),
    etiqueta              TEXT,
    es_principal          BOOLEAN DEFAULT false,
    
    -- Ubicación
    direccion             TEXT NOT NULL,
    direccion2           TEXT,
    ciudad               TEXT NOT NULL,
    region               TEXT,
    codigo_postal        TEXT,
    pais                 TEXT DEFAULT 'PE',
    
    -- Coordenadas
    latitud              DECIMAL(10,8),
    longitud             DECIMAL(11,8),
    
    -- Detalles de envío
    instrucciones        TEXT,
    acceso_dificil       BOOLEAN DEFAULT false,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_direcciones_user ON direcciones(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 6: CONFIGURACIÓN DE ENVÍOS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE envio_zonas (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    regiones              JSONB DEFAULT '[]',
    precio               DECIMAL(10,2) NOT NULL,
    moneda               TEXT DEFAULT 'USD',
    dias_estimados       INTEGER DEFAULT 3,
    
    activo               BOOLEAN DEFAULT true,
    orden                INTEGER DEFAULT 0,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_envio_zonas_empresa ON envio_zonas(empresa_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 7: BLOG - CATEGORÍAS Y TAGS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE blog_categorias (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    slug                  TEXT NOT NULL,
    descripcion           TEXT,
    icono                TEXT DEFAULT 'FileText',
    color                TEXT DEFAULT '#10B981',
    orden                INTEGER DEFAULT 0,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_blog_cat_slug ON blog_categorias(empresa_id, slug);

CREATE TABLE blog_tags (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nombre                TEXT NOT NULL,
    slug                  TEXT NOT NULL,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_blog_tags_slug ON blog_tags(empresa_id, slug);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 8: BLOG - POSTS Y LECTURAS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE blog_posts (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    titulo                TEXT NOT NULL,
    slug                  TEXT NOT NULL,
    contenido             TEXT NOT NULL,
    extracto              TEXT,
    seo_title            TEXT,
    seo_description       TEXT,
    
    -- Imagen
    imagen_portada       TEXT,
    imagen_alt          TEXT,
    
    -- Relaciones
    categoria_id         UUID REFERENCES blog_categorias(id) ON DELETE SET NULL,
    autor_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Estado
    estado               TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
    publicado_en        TIMESTAMPTZ,
    
    -- Configuración de pago
    es_premium           BOOLEAN DEFAULT false,
    metodo_pago          TEXT DEFAULT 'coins' CHECK (metodo_pago IN ('coins', 'dinero', 'ambos')),
    precio_coins         INTEGER DEFAULT 0,
    precio_usd          DECIMAL(10,2) DEFAULT 0,
    
    -- Gamificación
    recompensa_segundos  INTEGER DEFAULT 60,
    recompensa_coins     INTEGER DEFAULT 5,
    
    -- Métricas
    vistas               INTEGER DEFAULT 0,
    tiempo_lectura_minutos INTEGER DEFAULT 1,
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    actualizado_en       TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_blog_posts_slug ON blog_posts(empresa_id, slug);
CREATE INDEX idx_blog_posts_estado ON blog_posts(empresa_id, estado, publicado_en DESC);
CREATE INDEX idx_blog_posts_categoria ON blog_posts(categoria_id);

CREATE TRIGGER set_updated_at_blog_posts
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Tabla pivote posts_tags
CREATE TABLE blog_posts_tags (
    post_id               UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id                UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Lecturas (para gamificación)
CREATE TABLE blog_lecturas (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    post_id               UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    
    tiempo_segundos       INTEGER NOT NULL,
    porcentaje_scroll     DECIMAL(5,2) DEFAULT 0,
    
    recompensa_otorgada   BOOLEAN DEFAULT false,
    coins_ganados         INTEGER DEFAULT 0,
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE (empresa_id, user_id, post_id)
);

CREATE INDEX idx_blog_lecturas_user ON blog_lecturas(user_id);

-- Comentarios
CREATE TABLE blog_comments (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    post_id               UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    contenido             TEXT NOT NULL,
    padre_id             UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    
    estado               TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'oculto', 'spam')),
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    actualizado_en       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_comments_post ON blog_comments(post_id, creado_en DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 9: PRODUCTOS - CATEGORÍAS Y PRODUCTOS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE producto_categorias (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    slug                  TEXT NOT NULL,
    descripcion          TEXT,
    icono                TEXT,
    orden                INTEGER DEFAULT 0,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_prod_cat_slug ON producto_categorias(empresa_id, slug);

CREATE TABLE productos (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    slug                  TEXT NOT NULL,
    descripcion           TEXT,
    contenido             TEXT,
    
    -- Configuración de pago
    metodo_pago           TEXT DEFAULT 'ambos' CHECK (metodo_pago IN ('coins', 'dinero', 'ambos')),
    precio_coins          INTEGER,
    precio_usd            DECIMAL(10,2),
    
    -- Sistema de referidos por producto
    comision_activo       BOOLEAN DEFAULT false,
    comision_tipo         TEXT DEFAULT 'porcentaje' CHECK (comision_tipo IN ('porcentaje', 'monto_fijo_coins', 'monto_fijo_usd')),
    comision_valor        DECIMAL(10,2) DEFAULT 0,
    comision_duracion     INTEGER DEFAULT 0,
    comision_nivel_min    INTEGER DEFAULT 0,
    
    -- Tipo de producto
    tipo                  TEXT DEFAULT 'digital' CHECK (tipo IN ('digital', 'fisico', 'servicio', 'suscripcion')),
    
    -- Categoría
    categoria_id          UUID REFERENCES producto_categorias(id) ON DELETE SET NULL,
    
    -- Media
    imagen_principal      TEXT,
    imagen_alt           TEXT,
    galeria              JSONB DEFAULT '[]',
    
    -- Inventario (para productos físicos)
    stock                INTEGER DEFAULT 0,
    stock_ilimitado      BOOLEAN DEFAULT false,
    
    -- Dimensiones
    peso_kg              DECIMAL(6,3),
    dimensiones          JSONB,
    
    -- Digital
    archivo_url          TEXT,
    archivo_tamano       INTEGER,
    
    -- Estado
    activo              BOOLEAN DEFAULT true,
    destacado           BOOLEAN DEFAULT false,
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    actualizado_en       TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_productos_slug ON productos(empresa_id, slug);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(empresa_id, activo);

CREATE TRIGGER set_updated_at_productos
    BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 10: REFERIDOS Y COMISIONES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE referidos (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    referidor_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
    invitado_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    codigo_referido       TEXT,
    
    -- Estado
    estado                TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'registrado', 'activo', 'inactivo')),
    
    -- Recompensas
    bonus_registro        INTEGER DEFAULT 0,
    bonus_registro_otorgado BOOLEAN DEFAULT false,
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE (empresa_id, invitado_id)
);

CREATE INDEX idx_referidos_codigo ON referidos(empresa_id, codigo_referido);
CREATE INDEX idx_referidos_referidor ON referidos(referidor_id);

CREATE TABLE referidos_comisiones (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    referidor_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
    invitado_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
    compra_id             UUID,
    
    -- Comisión
    monto_coins          INTEGER DEFAULT 0,
    monto_usd            DECIMAL(10,2) DEFAULT 0,
    
    -- Configuración aplicada
    comision_tipo        TEXT,
    comision_valor       DECIMAL(10,2),
    compra_numero        INTEGER DEFAULT 1,
    
    -- Estado
    estado               TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'cancelada')),
    pagada_en           TIMESTAMPTZ,
    
    creado_en           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ref_comisiones_referidor ON referidos_comisiones(referidor_id);
CREATE INDEX idx_ref_comisiones_empresa ON referidos_comisiones(empresa_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 11: COMPRAS Y TRANSACCIONES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE compras (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    producto_id           UUID REFERENCES productos(id) ON DELETE SET NULL,
    
    -- Método usado
    metodo_pago           TEXT NOT NULL CHECK (metodo_pago IN ('coins', 'stripe', 'paypal', 'manual')),
    
    -- Montos
    monto_coins           INTEGER DEFAULT 0,
    monto_usd             DECIMAL(10,2) DEFAULT 0,
    moneda                TEXT DEFAULT 'USD',
    tipo_cambio           DECIMAL(10,4),
    
    -- Referido
    referido_por          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    comision_generada     DECIMAL(10,2) DEFAULT 0,
    comision_estado       TEXT DEFAULT 'pendiente',
    
    -- Transacción externa
    transaction_id       TEXT,
    
    -- Estado
    estado               TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'cancelado', 'reembolsado')),
    
    -- Envío
    direccion_envio_id   UUID REFERENCES direcciones(id),
    codigo_seguimiento   TEXT,
    
    -- Metadata
    notas               TEXT,
    metadata             JSONB DEFAULT '{}',
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    actualizado_en       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_compras_user ON compras(user_id, creado_en DESC);
CREATE INDEX idx_compras_empresa ON compras(empresa_id, creado_en DESC);
CREATE INDEX idx_compras_estado ON compras(estado);

CREATE TRIGGER set_updated_at_compras
    BEFORE UPDATE ON compras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para actualizar ha_comprado y métricas
CREATE OR REPLACE FUNCTION after_compra_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completado' AND OLD.estado != 'completado' THEN
        UPDATE profiles 
        SET ha_comprado = true,
            total_compras = total_compras + 1,
            total_gastado_usd = total_gastado_usd + COALESCE(NEW.monto_usd, 0)
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_compra_update
    AFTER UPDATE ON compras
    FOR EACH ROW EXECUTE FUNCTION after_compra_update();

-- Carrito abandonado
CREATE TABLE carritos_abandonados (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    items                JSONB DEFAULT '[]',
    total_usd            DECIMAL(10,2) DEFAULT 0,
    
    cupon_enviado        BOOLEAN DEFAULT false,
    cupon_enviado_en     TIMESTAMPTZ,
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    actualizado_en        TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE (empresa_id, user_id)
);

CREATE TRIGGER set_updated_at_carritos
    BEFORE UPDATE ON carritos_abandonados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 12: BLIS COINS - PAQUETES Y TRANSACCIONES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE coins_paquetes (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    descripcion          TEXT,
    cantidad              INTEGER NOT NULL,
    precio_usd            DECIMAL(10,2) NOT NULL,
    moneda               TEXT DEFAULT 'USD',
    
    bonus                 INTEGER DEFAULT 0,
    destacado            BOOLEAN DEFAULT false,
    activo              BOOLEAN DEFAULT true,
    orden               INTEGER DEFAULT 0,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_coins_paquetes_empresa ON coins_paquetes(empresa_id);

CREATE TABLE boveda_transacciones (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    tipo                  TEXT NOT NULL CHECK (tipo IN (
        'lectura_blog', 'compra_producto', 'compra_coins',
        'bonus_registro', 'bonus_referido', 'admin_credito',
        'admin_debito', 'reembolso', 'expiracion'
    )),
    
    referencia_tipo      TEXT,
    referencia_id         UUID,
    
    monto                 INTEGER NOT NULL,
    balance_antes        INTEGER NOT NULL,
    balance_despues       INTEGER NOT NULL,
    
    descripcion          TEXT,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_boveda_user ON boveda_transacciones(user_id, creado_en DESC);
CREATE INDEX idx_boveda_empresa ON boveda_transacciones(empresa_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 13: CURSOS Y CERTIFICADOS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE cursos (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    slug                  TEXT NOT NULL,
    descripcion          TEXT,
    
    modulos               JSONB DEFAULT '[]',
    
    precio_coins          INTEGER DEFAULT 0,
    precio_usd            DECIMAL(10,2) DEFAULT 0,
    
    max_intentos          INTEGER DEFAULT 3,
    nota_aprobacion       DECIMAL(5,2) DEFAULT 70.00,
    
    certificado_template  TEXT,
    
    activo               BOOLEAN DEFAULT true,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_cursos_slug ON cursos(empresa_id, slug);

CREATE TABLE curso_progreso (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    curso_id              UUID REFERENCES cursos(id) ON DELETE CASCADE,
    
    progreso              DECIMAL(5,2) DEFAULT 0,
    nota_final            DECIMAL(5,2),
    intentos              INTEGER DEFAULT 0,
    examen_estado         TEXT DEFAULT 'pendiente' CHECK (examen_estado IN ('pendiente', 'aprobado', 'reprobado', 'bloqueado')),
    examen_liberado_en    TIMESTAMPTZ,
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    actualizado_en       TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE (user_id, curso_id)
);

CREATE TRIGGER set_updated_curso_progreso
    BEFORE UPDATE ON curso_progreso
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE certificados (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    curso_id              UUID REFERENCES cursos(id) ON DELETE SET NULL,
    
    nombre                TEXT NOT NULL,
    fecha_emision        TIMESTAMPTZ DEFAULT now(),
    codigo_verificacion   TEXT UNIQUE,
    archivo_url           TEXT,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_certificados_user ON certificados(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 14: EVENTOS PRIVADOS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE eventos (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nombre                TEXT NOT NULL,
    descripcion          TEXT,
    fecha                TIMESTAMPTZ,
    lugar                TEXT,
    
    -- Configuración
    solo_niveles         JSONB DEFAULT '[]',
    cupo                 INTEGER,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE evento_invitaciones (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento_id             UUID REFERENCES eventos(id) ON DELETE CASCADE,
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    estado               TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'rechazado')),
    
    creado_en            TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE (evento_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 15: NOTIFICACIONES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE notificaciones (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    user_id               UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    tipo                  TEXT NOT NULL CHECK (tipo IN (
        'lectura_completada', 'coins_ganados', 'coins_comprados',
        'nuevo_articulo', 'compra_exitosa', 'comentario_respuesta',
        'referido_registro', 'comision_recibida', 'evento_invitacion',
        'nivel_subido', 'sistema'
    )),
    
    titulo                TEXT NOT NULL,
    mensaje              TEXT NOT NULL,
    link                 TEXT,
    
    leida                BOOLEAN DEFAULT false,
    leida_en             TIMESTAMPTZ,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notif_user ON notificaciones(user_id, leida, creado_en DESC);
CREATE INDEX idx_notif_empresa ON notificaciones(empresa_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 16: AUDITORÍA
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE auditoria_log (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id            UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accion                TEXT NOT NULL,
    tabla                 TEXT,
    registro_id           UUID,
    datos_anteriores      JSONB,
    datos_nuevos          JSONB,
    ip                    TEXT,
    user_agent            TEXT,
    
    creado_en            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_auditoria_empresa ON auditoria_log(empresa_id, creado_en DESC);
CREATE INDEX idx_auditoria_user ON auditoria_log(user_id, creado_en DESC);

-- Función para registrar auditoría automáticamente
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditoria_log (empresa_id, user_id, accion, tabla, registro_id, datos_anteriores, datos_nuevos)
    VALUES (
        COALESCE(NEW.empresa_id, OLD.empresa_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 17: ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Activar RLS en todas las tablas principales
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE boveda_transacciones ENABLE ROW LEVEL SECURITY;

-- Políticas para empresas
CREATE POLICY "Superadmins ven todas las empresas" ON empresas
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'superadmin')
    );

CREATE POLICY "Usuarios ven su empresa asignada" ON empresas
    FOR SELECT USING (
        id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    );

-- Políticas para profiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON profiles
    FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')));

CREATE POLICY "Usuarios pueden actualizar su perfil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins pueden actualizar perfiles de su empresa" ON profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin') AND empresa_id = profiles.empresa_id)
    );

-- Políticas para blog_posts
CREATE POLICY "Posts publicados son visibles" ON blog_posts
    FOR SELECT USING (estado = 'publicado' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'editor', 'superadmin')));

CREATE POLICY "Autores pueden crear posts" ON blog_posts
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'editor', 'superadmin'))
    );

-- Políticas para productos
CREATE POLICY "Productos activos son visibles" ON productos
    FOR SELECT USING (activo = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')));

-- Políticas para compras
CREATE POLICY "Usuarios ven sus propias compras" ON compras
    FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')));

-- Políticas para transacciones
CREATE POLICY "Usuarios ven sus propias transacciones" ON boveda_transacciones
    FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')));

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 18: DATOS INICIALES (SEED)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Insertar empresa por defecto
INSERT INTO empresas (id, slug, nombre, color_primario, color_secundario, color_acento) 
VALUES (
    uuid_generate_v4(), 
    'blis-corp', 
    'BLIS Corp', 
    '#B10D24', 
    '#000000', 
    '#10B981'
) ON CONFLICT (slug) DO NOTHING;

-- Insertar configuración de empresa
INSERT INTO empresa_config (empresa_id, blog_activo, tienda_activa, academia_activa, referidos_activo, bliscoins_activo)
SELECT id, true, true, false, true, true FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT (empresa_id) DO NOTHING;

-- Insertar niveles de cliente por defecto
INSERT INTO niveles_cliente (empresa_id, nombre, slug, color, icono, orden, descuento_porcentaje, envio_gratis, soporte_prioritario, acceso_eventos) 
SELECT id, 'Bronze', 'bronze', '#CD7F32', 'Award', 1, 0, false, false, false FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

INSERT INTO niveles_cliente (empresa_id, nombre, slug, color, icono, orden, descuento_porcentaje, envio_gratis, soporte_prioritario, acceso_eventos) 
SELECT id, 'Silver', 'silver', '#C0C0C0', 'Award', 2, 5, false, false, false FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

INSERT INTO niveles_cliente (empresa_id, nombre, slug, color, icono, orden, descuento_porcentaje, envio_gratis, soporte_prioritario, acceso_eventos) 
SELECT id, 'Gold', 'gold', '#FFD700', 'Award', 3, 10, true, true, true FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

INSERT INTO niveles_cliente (empresa_id, nombre, slug, color, icono, orden, descuento_porcentaje, envio_gratis, soporte_prioritario, acceso_eventos) 
SELECT id, 'Platinum', 'platinum', '#E5E4E2', 'Crown', 4, 15, true, true, true FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

-- Insertar paquetes de coins por defecto
INSERT INTO coins_paquetes (empresa_id, nombre, descripcion, cantidad, precio_usd, bonus, destacado, orden) 
SELECT id, 'Pack Básico', 'Ideal para empezar', 500, 4.99, 0, false, 1 FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

INSERT INTO coins_paquetes (empresa_id, nombre, descripcion, cantidad, precio_usd, bonus, destacado, orden) 
SELECT id, 'Pack Starter', 'Perfecto para principiantes', 1200, 9.99, 100, false, 2 FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

INSERT INTO coins_paquetes (empresa_id, nombre, descripcion, cantidad, precio_usd, bonus, destacado, orden) 
SELECT id, 'Pack Pro', 'El más popular', 3000, 19.99, 500, true, 3 FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

INSERT INTO coins_paquetes (empresa_id, nombre, descripcion, cantidad, precio_usd, bonus, destacado, orden) 
SELECT id, 'Pack Enterprise', 'Para equipos grandes', 8000, 49.99, 2000, false, 4 FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

-- Insertar categorías de blog por defecto
INSERT INTO blog_categorias (empresa_id, nombre, slug, descripcion, icono, color)
SELECT id, 'General', 'general', 'Artículos generales', 'FileText', '#10B981' FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

INSERT INTO blog_categorias (empresa_id, nombre, slug, descripcion, icono, color)
SELECT id, 'Tutoriales', 'tutoriales', 'Guías paso a paso', 'BookOpen', '#3B82F6' FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

INSERT INTO blog_categorias (empresa_id, nombre, slug, descripcion, icono, color)
SELECT id, 'Noticias', 'noticias', 'Últimas noticias', 'Newspaper', '#F59E0B' FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

-- Insertar categorías de productos por defecto
INSERT INTO producto_categorias (empresa_id, nombre, slug, descripcion, icono)
SELECT id, 'Productos Digitales', 'productos-digitales', 'Ebooks, cursos y más', 'FileDigit' FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

INSERT INTO producto_categorias (empresa_id, nombre, slug, descripcion, icono)
SELECT id, 'Servicios', 'servicios', 'Consultorías y servicios', 'Briefcase' FROM empresas WHERE slug = 'blis-corp'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIN DEL ESQUEMA
-- ═══════════════════════════════════════════════════════════════════════════════

-- Notas de implementación:
-- 1. Ejecutar este script completo en Supabase SQL Editor
-- 2. Verificar que no hay errores en la consola
-- 3. Las políticas RLS permiten que los usuarios vean sus propios datos
-- 4. Los triggers actualizan automatically updated_at y ha_comprado
-- 5. Los datos iniciales se crean automáticamente
-- 6. Para agregar una nueva empresa, usar INSERT en empresas y empresa_config
-- 7. Para cambiar niveles, usar UPDATE en niveles_cliente

-- Comandos útiles:
-- SELECT * FROM empresas;
-- SELECT * FROM profiles;
-- SELECT * FROM niveles_cliente;
-- SELECT * FROM coins_paquetes;