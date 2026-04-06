-- ==========================================
-- PROYECTOS, LOTES Y ASESORES SCHEMA
-- ==========================================

-- Tabla de Asesores (Agentes/Vendedores)
CREATE TABLE IF NOT EXISTS advisors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    phone_code TEXT DEFAULT '+593',
    document_id TEXT,
    
    -- Comisiones
    commission_type TEXT DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
    commission_value NUMERIC(15, 2) DEFAULT 0,
    commission_trigger_percent NUMERIC(5, 2) DEFAULT 30,
    
    -- Estado
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    notes TEXT
);

-- Tabla de Proyectos (macro-proyectos inmobiliarios)
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'EN PLANOS' CHECK (status IN ('EN PLANOS', 'PREVENTA', 'VENTA CON ESCRITURA', 'VENTA FINALIZADA', 'PROYECTO ENTREGADO')),
    website TEXT,
    location TEXT,
    start_date DATE,
    end_date DATE,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#be0b3c',
    secondary_color TEXT,
    
    -- Configuración de fechas del proyecto
    signature_month DATE,
    escritura_month DATE,
    
    -- Estado
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Lotes (dentro de proyectos)
CREATE TABLE IF NOT EXISTS project_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Identificación
    lot_number TEXT NOT NULL,
    lot_area NUMERIC(15, 2) DEFAULT 0,
    
    -- Propietarios (JSONB para múltiples dueños)
    owners JSONB DEFAULT '[]'::jsonb,
    client_name TEXT,
    
    -- Datos financieros
    total_price NUMERIC(15, 2) DEFAULT 0,
    expected_quota NUMERIC(15, 2) DEFAULT 0,
    initial_payment_expected NUMERIC(15, 2) DEFAULT 0,
    initial_payment_paid NUMERIC(15, 2) DEFAULT 0,
    
    -- Fechas específicas del lote
    start_month DATE,
    signature_month DATE,
    escritura_month DATE,
    
    -- Condiciones especiales
    conditions JSONB DEFAULT '{"authorizedHold": false, "regularPayer": true}'::jsonb,
    
    -- Pagos iniciales (JSONB array)
    initial_payments JSONB DEFAULT '[]'::jsonb,
    
    -- Pagos mensuales (JSONB array)
    payments JSONB DEFAULT '[]'::jsonb,
    
    -- Documentos (JSONB array)
    documents JSONB DEFAULT '[]'::jsonb,
    
    -- Recordatorios (JSONB array)
    reminders JSONB DEFAULT '[]'::jsonb,
    
    -- Notas especiales
    special_observations TEXT,
    trade_in_value NUMERIC(15, 2) DEFAULT 0,
    
    -- Comisión del asesor
    agent_id UUID REFERENCES advisors(id) ON DELETE SET NULL,
    
    -- Estado del lote
    status TEXT DEFAULT 'Disponible' CHECK (status IN ('Disponible', 'Reservado', 'Vendido', 'Desistido')),
    
    -- Sorteo
    enters_raffle BOOLEAN DEFAULT FALSE,
    
    -- Penalidades
    late_fees NUMERIC(15, 2) DEFAULT 0,
    refund_amount NUMERIC(15, 2) DEFAULT 0,
    
    -- Contacto alternate
    alternate_contact JSONB DEFAULT '{"name": "", "phone": "", "phone_code": "+593"}'::jsonb,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    
    -- Unique constraint para lot_number dentro de un proyecto
    UNIQUE(project_id, lot_number)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_project_lots_project_id ON project_lots(project_id);
CREATE INDEX IF NOT EXISTS idx_project_lots_lot_number ON project_lots(lot_number);
CREATE INDEX IF NOT EXISTS idx_project_lots_client_name ON project_lots(client_name);
CREATE INDEX IF NOT EXISTS idx_project_lots_status ON project_lots(status);
CREATE INDEX IF NOT EXISTS idx_advisors_name ON advisors(name);
CREATE INDEX IF NOT EXISTS idx_advisors_is_active ON advisors(is_active);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column_projects()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_advisors_updated_at ON advisors;
CREATE TRIGGER update_advisors_updated_at
    BEFORE UPDATE ON advisors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column_projects();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column_projects();

DROP TRIGGER IF EXISTS update_project_lots_updated_at ON project_lots;
CREATE TRIGGER update_project_lots_updated_at
    BEFORE UPDATE ON project_lots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column_projects();

-- Row Level Security (RLS)
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_lots ENABLE ROW LEVEL SECURITY;

-- Policies (permissive for now)
CREATE POLICY "Allow all access for advisors" ON advisors
    FOR ALL USING (true);

CREATE POLICY "Allow all access for projects" ON projects
    FOR ALL USING (true);

CREATE POLICY "Allow all access for project_lots" ON project_lots
    FOR ALL USING (true);

-- Comentarios
COMMENT ON TABLE advisors IS 'Tabla de asesores/agentes de ventas inmobiliarias';
COMMENT ON TABLE projects IS 'Tabla de macro-proyectos inmobiliarios';
COMMENT ON TABLE project_lots IS 'Tabla de lotes dentro de proyectos inmobiliarios';
