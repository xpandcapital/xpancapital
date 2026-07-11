-- ═══════════════════════════════════════════════════════════════════════════════
-- Xpand Capital - SISTEMA DE TEMPLATES
-- Tabla para gestionar plantillas de contenido (landing, blog, tienda, etc.)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Tabla principal de templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Identificación
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    
    -- Tipo de contenido que muestra
    tipo_contenido VARCHAR(30) NOT NULL CHECK (tipo_contenido IN (
        'landing',
        'blog',
        'blog_post',
        'tienda',
        'producto',
        'curso',
        'leccion',
        'proyecto',
        'funnel',
        'captura',
        'checkout',
        'thankyou'
    )),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN (
        'borrador',
        'revision',
        'listo',
        'activo'
    )),
    
    -- Es el principal de su tipo (default para esas rutas)
    es_principal BOOLEAN DEFAULT false,
    
    -- Visibilidad en navegación
    mostrar_en_menu BOOLEAN DEFAULT true,
    mostrar_en_footer BOOLEAN DEFAULT true,
    
    -- Configuración de secciones (JSONB dinámico según tipo)
    secciones JSONB NOT NULL DEFAULT '{}',
    
    -- SEO
    meta_titulo VARCHAR(200),
    meta_descripcion TEXT,
    meta_keywords TEXT[],
    og_imagen TEXT,
    
    -- Preview
    thumbnail_url TEXT,
    descripcion TEXT,
    
    -- Auditoría
    creado_por UUID REFERENCES profiles(id),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW(),
    publicado_en TIMESTAMPTZ,
    
    CONSTRAINT unique_slug_empresa UNIQUE(empresa_id, slug)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_templates_empresa ON templates(empresa_id);
CREATE INDEX IF NOT EXISTS idx_templates_tipo ON templates(tipo_contenido);
CREATE INDEX IF NOT EXISTS idx_templates_estado ON templates(estado);
CREATE INDEX IF NOT EXISTS idx_templates_activos ON templates(empresa_id) WHERE estado = 'activo';
CREATE INDEX IF NOT EXISTS idx_templates_menu ON templates(empresa_id, mostrar_en_menu) WHERE mostrar_en_menu = true AND estado = 'activo';

-- Solo UN principal por tipo por empresa
CREATE UNIQUE INDEX IF NOT EXISTS idx_templates_principal_por_tipo 
ON templates(empresa_id, tipo_contenido) 
WHERE es_principal = true AND estado = 'activo';

-- Tabla de historial de versiones (para deshacer cambios)
CREATE TABLE IF NOT EXISTS template_versiones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    secciones JSONB NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    creado_por UUID REFERENCES profiles(id),
    notas TEXT,
    UNIQUE(template_id, version)
);

CREATE INDEX IF NOT EXISTS idx_template_versiones ON template_versiones(template_id, version DESC);

-- Trigger para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION update_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_template_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versiones ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura: usuarios pueden ver templates de su empresa
CREATE POLICY "Usuarios ven templates de su empresa" ON templates
FOR SELECT USING (
    empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
);

-- Políticas de inserción: usuarios pueden crear templates
CREATE POLICY "Usuarios pueden crear templates" ON templates
FOR INSERT WITH CHECK (
    empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
);

-- Políticas de actualización: usuarios pueden actualizar templates de su empresa
CREATE POLICY "Usuarios pueden actualizar templates" ON templates
FOR UPDATE USING (
    empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
);

-- Políticas de eliminación: solo admins pueden eliminar
CREATE POLICY "Admins pueden eliminar templates" ON templates
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND rol IN ('admin', 'superadmin')
        AND empresa_id = templates.empresa_id
    )
);

-- Políticas para versiones
CREATE POLICY "Usuarios pueden ver versiones" ON template_versiones
FOR SELECT USING (
    template_id IN (
        SELECT id FROM templates 
        WHERE empresa_id IN (
            SELECT empresa_id FROM profiles WHERE id = auth.uid()
        )
    )
);

CREATE POLICY "Usuarios pueden crear versiones" ON template_versiones
FOR INSERT WITH CHECK (
    template_id IN (
        SELECT id FROM templates 
        WHERE empresa_id IN (
            SELECT empresa_id FROM profiles WHERE id = auth.uid()
        )
    )
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DATOS INICIALES - Migrar contenido actual de landing_secciones
-- ═══════════════════════════════════════════════════════════════════════════════

-- Insertar template principal de landing por defecto
-- (Se migrará el contenido real desde landing_secciones vía script)
INSERT INTO templates (
    empresa_id,
    nombre,
    slug,
    tipo_contenido,
    estado,
    es_principal,
    mostrar_en_menu,
    mostrar_en_footer,
    secciones,
    descripcion
)
VALUES (
    '6186f014-c8c7-4027-9f08-8acf2bae3eae',
    'Landing Principal',
    '',
    'landing',
    'activo',
    true,
    true,
    true,
    '{
        "hero": {
            "title1": "XPAND",
            "title2": "CORP",
            "subtitle": "Tu Próximo Gran Patrimonio",
            "description": "Desarrollamos Macro-Lotes y Terrenos con alta plusvalía.",
            "primaryBtnText": "Comprar Terrenos",
            "primaryBtnLink": "/tienda",
            "secondaryBtnText": "Trayectoria",
            "secondaryBtnLink": "#trayectoria",
            "videoBackground": "/videos/cyber-bg.mp4"
        },
        "trayectoria": {
            "yearsExperience": "10+",
            "lotsDelivered": "2500+",
            "missionTitle": "Nuestra Misión",
            "missionText": "Transformar el horizonte inmobiliario.",
            "videoUrl": "",
            "videoThumbnail": "/images/miniatura-de-video.webp"
        },
        "process": {
            "title": "Metodología",
            "subtitle": "Nuestra Ruta de Éxito",
            "steps": []
        },
        "operaciones": {
            "title": "Backstage",
            "subtitle": "Operaciones en Campo",
            "sliderImages": [],
            "stats": {
                "sales": "5M",
                "urbanizations": "12",
                "clients": "850",
                "conferences": "45"
            }
        },
        "insights": {
            "title": "Mercado",
            "subtitle1": "Inteligencia Inmobiliaria",
            "subtitle2": "Datos",
            "description": "",
            "insights": [],
            "stats": []
        },
        "calculadora": {
            "title": "Plusvalía",
            "subtitle": "Simulador",
            "description": "",
            "planosRatio": "50",
            "preventaRatio": "75",
            "escrituraRatio": "91",
            "tirValue": "22"
        },
        "mapa": {
            "title": "Mapa",
            "subtitle": "Dominio Territorial",
            "description": "",
            "locations": []
        },
        "catalog": {
            "title": "Tienda",
            "subtitle": "Recursos de Élite"
        },
        "equipo": {
            "title": "Liderazgo",
            "ceoName": "Kevin Valdez",
            "ceoRole": "CEO",
            "ceoQuote": "",
            "ceoDescription1": "",
            "ceoDescription2": "",
            "ceoImage": "/images/kevin-valdez.webp",
            "members": []
        },
        "testimonials": {
            "title": "Experiencias",
            "subtitle": "Testimonios",
            "items": [
                {
                    "quote": "Xpand Capital redefinió nuestra estrategia de inversión.",
                    "author": "Rafael S.",
                    "role": "Inversor",
                    "image": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&q=80"
                }
            ]
        },
        "faq": {
            "title": "Transparencia",
            "items": []
        },
        "footer": {
            "description": "Liderando la transformación digital.",
            "copyright": "© 2026 Xpand Capital.",
            "logoVertical": "/images/logo-blis-vertical.png",
            "logoHorizontal": "/images/blis-logo.png",
            "socials": {}
        }
    }',
    'Template principal de la landing page'
) ON CONFLICT (empresa_id, slug) DO NOTHING;

-- Crear versión inicial
INSERT INTO template_versiones (template_id, version, secciones, notas)
SELECT id, 1, secciones, 'Versión inicial'
FROM templates 
WHERE empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae' 
AND slug = '' 
AND tipo_contenido = 'landing'
ON CONFLICT DO NOTHING;

