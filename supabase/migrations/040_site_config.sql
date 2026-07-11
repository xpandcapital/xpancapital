-- Site-wide configuration table for logos, SEO, social links, etc.
CREATE TABLE IF NOT EXISTS site_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Branding
    site_name VARCHAR(100) DEFAULT 'Xpand Capital',
    site_tagline VARCHAR(200) DEFAULT 'Luxury Tech Real Estate',
    logo_horizontal TEXT,
    logo_vertical TEXT,
    logo_horizontal_light TEXT,
    logo_vertical_light TEXT,
    favicon TEXT,
    
    -- Colors
    primary_color VARCHAR(20) DEFAULT '#B10D24',
    secondary_color VARCHAR(20) DEFAULT '#10B981',
    background_color VARCHAR(20) DEFAULT '#000000',
    text_color VARCHAR(20) DEFAULT '#FFFFFF',
    accent_color VARCHAR(20) DEFAULT '#B10D24',
    
    -- SEO Defaults
    meta_title VARCHAR(200),
    meta_description TEXT,
    meta_keywords TEXT[],
    og_image TEXT,
    
    -- Social Links
    social_instagram TEXT,
    social_facebook TEXT,
    social_youtube TEXT,
    social_tiktok TEXT,
    social_linkedin TEXT,
    social_twitter TEXT,
    social_whatsapp TEXT,
    
    -- Footer
    footer_description TEXT,
    footer_copyright VARCHAR(100) DEFAULT '© 2026 Xpand Capital. Todos los derechos reservados.',
    
    -- Contact
    contact_email TEXT,
    contact_phone TEXT,
    contact_address TEXT,
    
    -- Auditoría
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Solo un config por empresa
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_config_empresa ON site_config(empresa_id);

-- Trigger para actualizar fecha
CREATE OR REPLACE FUNCTION update_site_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_site_config
    BEFORE UPDATE ON site_config
    FOR EACH ROW EXECUTE FUNCTION update_site_config_updated_at();

-- Insertar config por defecto
INSERT INTO site_config (empresa_id, site_name, site_tagline, primary_color, secondary_color, background_color, text_color, accent_color)
VALUES (
    '6186f014-c8c7-4027-9f08-8acf2bae3eae',
    'Xpand Capital',
    'Luxury Tech Real Estate',
    '#B10D24',
    '#10B981',
    '#000000',
    '#FFFFFF',
    '#B10D24'
) ON CONFLICT (empresa_id) DO NOTHING;

-- RLS
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver config" ON site_config
FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins pueden editar config" ON site_config
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND rol IN ('admin', 'superadmin')
        AND empresa_id = site_config.empresa_id
    )
);
