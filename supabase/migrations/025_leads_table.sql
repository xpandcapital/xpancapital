-- ═══════════════════════════════════════════════════════════════════════════════
-- XPAND CORP - TABLA DE LEADS
-- Sistema de gestión de leads para formularios de captura
-- ═══════════════════════════════════════════════════════════════════════════════

-- Tabla de leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Datos personales
    nombre VARCHAR(200),
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    ciudad VARCHAR(100),
    
    -- Interés (como TEXT porque projects.id es TEXT)
    proyecto_interes TEXT,
    proyecto_nombre VARCHAR(200),
    mensaje TEXT,
    
    -- Tracking
    fuente VARCHAR(50) DEFAULT 'formulario_web',
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(200),
    utm_content VARCHAR(200),
    utm_term VARCHAR(200),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Estado
    estado VARCHAR(30) DEFAULT 'nuevo' CHECK (estado IN (
        'nuevo',
        'contactado',
        'calificado',
        'interesado',
        'oportunidad',
        'cliente',
        'perdido'
    )),
    
    -- Calificación
    temperatura VARCHAR(20) DEFAULT 'frio' CHECK (temperatura IN ('frio', 'tibio', 'caliente')),
    score INTEGER DEFAULT 0,
    
    -- Métricas
    interacciones INTEGER DEFAULT 1,
    ultima_interaccion TIMESTAMPTZ DEFAULT NOW(),
    
    -- Notas del asesor
    notas TEXT,
    asesor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Auditoría
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_email_empresa UNIQUE(empresa_id, email)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_leads_empresa ON leads(empresa_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_fuente ON leads(fuente);
CREATE INDEX IF NOT EXISTS idx_leads_proyecto ON leads(proyecto_interes);
CREATE INDEX IF NOT EXISTS idx_leads_creado ON leads(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_leads_temperatura ON leads(temperatura);

-- Trigger para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION update_lead_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_lead_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura: usuarios pueden ver leads de su empresa
CREATE POLICY "Usuarios ven leads de su empresa" ON leads
FOR SELECT USING (
    empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
);

-- Política de inserción: pública para formularios web
CREATE POLICY "Permitir inserción pública" ON leads
FOR INSERT WITH CHECK (true);

-- Política de actualización: usuarios pueden actualizar leads de su empresa
CREATE POLICY "Usuarios pueden actualizar leads" ON leads
FOR UPDATE USING (
    empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
);

-- Política de eliminación: solo admins pueden eliminar
CREATE POLICY "Admins pueden eliminar leads" ON leads
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND rol IN ('admin', 'superadmin')
        AND empresa_id = leads.empresa_id
    )
);
