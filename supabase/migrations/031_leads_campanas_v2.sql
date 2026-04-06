-- =============================================
-- MIGRACIÓN CORREGIDA: Sistema de Leads y Campañas
-- Ejecutar solo las partes que fallaron
-- =============================================

-- 1. TABLA DE ASESORES (si no existe)
CREATE TABLE IF NOT EXISTS asesores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  whatsapp TEXT,
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices de asesores (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_asesores_empresa ON asesores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_asesores_activo ON asesores(activo);

-- 2. TABLA DE CAMPAÑAS (si no existe)
CREATE TABLE IF NOT EXISTS campanas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  asesor_id UUID REFERENCES asesores(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('borrador', 'activa', 'pausada', 'finalizada')),
  notificar_email BOOLEAN DEFAULT true,
  notificar_whatsapp BOOLEAN DEFAULT false,
  emails_notificacion TEXT[] DEFAULT '{}',
  whatsapp_notificacion TEXT[] DEFAULT '{}',
  notion_database_id TEXT,
  notion_sync BOOLEAN DEFAULT false,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices de campañas
CREATE INDEX IF NOT EXISTS idx_campanas_empresa ON campanas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_campanas_asesor ON campanas(asesor_id);
CREATE INDEX IF NOT EXISTS idx_campanas_estado ON campanas(estado);

-- 3. TABLA DE LEADS - Solo agregar columnas nuevas si la tabla ya existe
DO $$ 
BEGIN
  -- Agregar columnas nuevas a leads si no existen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'campana_id') THEN
    ALTER TABLE leads ADD COLUMN campana_id UUID REFERENCES campanas(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'asesor_id') THEN
    ALTER TABLE leads ADD COLUMN asesor_id UUID REFERENCES asesores(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'template_id') THEN
    ALTER TABLE leads ADD COLUMN template_id UUID REFERENCES templates(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'whatsapp') THEN
    ALTER TABLE leads ADD COLUMN whatsapp TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'datos') THEN
    ALTER TABLE leads ADD COLUMN datos JSONB DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'presupuesto') THEN
    ALTER TABLE leads ADD COLUMN presupuesto TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'interes') THEN
    ALTER TABLE leads ADD COLUMN interes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'etiquetas') THEN
    ALTER TABLE leads ADD COLUMN etiquetas TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notas') THEN
    ALTER TABLE leads ADD COLUMN notas TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'contactado_en') THEN
    ALTER TABLE leads ADD COLUMN contactado_en TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'convertido_en') THEN
    ALTER TABLE leads ADD COLUMN convertido_en TIMESTAMPTZ;
  END IF;
END $$;

-- Índices de leads (IF NOT EXISTS para evitar errores)
CREATE INDEX IF NOT EXISTS idx_leads_campana ON leads(campana_id);
CREATE INDEX IF NOT EXISTS idx_leads_asesor ON leads(asesor_id);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);

-- 4. TABLA DE INTEGRACIONES (si no existe)
CREATE TABLE IF NOT EXISTS integraciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp', 'email', 'notion', 'zapier', 'webhook')),
  nombre TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  activa BOOLEAN DEFAULT true,
  ultima_sincronizacion TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices de integraciones
CREATE INDEX IF NOT EXISTS idx_integraciones_empresa ON integraciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_integraciones_tipo ON integraciones(tipo);

-- 5. FUNCIÓN PARA NOTIFICAR NUEVO LEAD
CREATE OR REPLACE FUNCTION notificar_nuevo_lead(
  p_lead_id UUID
)
RETURNS void AS $$
DECLARE
  v_lead leads%ROWTYPE;
  v_campana campanas%ROWTYPE;
  v_asesor asesores%ROWTYPE;
BEGIN
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  IF v_lead.campana_id IS NOT NULL THEN
    SELECT * INTO v_campana FROM campanas WHERE id = v_lead.campana_id;
    
    IF v_campana.asesor_id IS NOT NULL THEN
      SELECT * INTO v_asesor FROM asesores WHERE id = v_campana.asesor_id;
    END IF;
  END IF;
  
  UPDATE leads SET actualizado_en = now() WHERE id = p_lead_id;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER PARA NOTIFICAR NUEVO LEAD
CREATE OR REPLACE FUNCTION trigger_nuevo_lead()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM pg_notify('nuevo_lead', json_build_object(
      'id', NEW.id,
      'nombre', NEW.nombre,
      'email', NEW.email,
      'telefono', NEW.telefono,
      'campana_id', NEW.campana_id,
      'asesor_id', NEW.asesor_id,
      'empresa_id', NEW.empresa_id
    )::text);
    
    PERFORM notificar_nuevo_lead(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_nuevo_lead') THEN
    CREATE TRIGGER trigger_nuevo_lead
    AFTER INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION trigger_nuevo_lead();
  END IF;
END $$;

-- 7. POLÍTICAS RLS
ALTER TABLE asesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE integraciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas con CAST a UUID
CREATE POLICY "asesores_empresa" ON asesores
  FOR ALL USING (empresa_id::text = auth.jwt() ->> 'empresa_id');

CREATE POLICY "campanas_empresa" ON campanas
  FOR ALL USING (empresa_id::text = auth.jwt() ->> 'empresa_id');

CREATE POLICY "integraciones_empresa" ON integraciones
  FOR ALL USING (empresa_id::text = auth.jwt() ->> 'empresa_id');

-- 8. DATOS DE EJEMPLO (INSERT IF NOT EXISTS)
INSERT INTO asesores (empresa_id, nombre, email, telefono, whatsapp)
SELECT 
  '6186f014-c8c7-4027-9f08-8acf2bae3eae'::UUID,
  'Kevin Valdez',
  'kevin@bliscorp.com',
  '+51 999 888 777',
  '51999888777'
WHERE NOT EXISTS (SELECT 1 FROM asesores WHERE email = 'kevin@bliscorp.com');

INSERT INTO campanas (empresa_id, nombre, descripcion, estado)
SELECT 
  '6186f014-c8c7-4027-9f08-8acf2bae3eae'::UUID,
  'Campaña Principal',
  'Campaña principal de captación de leads',
  'activa'
WHERE NOT EXISTS (SELECT 1 FROM campanas WHERE nombre = 'Campaña Principal');

INSERT INTO campanas (empresa_id, nombre, descripcion, estado)
SELECT 
  '6186f014-c8c7-4027-9f08-8acf2bae3eae'::UUID,
  'Inversores Premium',
  'Captación de inversores de alto valor',
  'activa'
WHERE NOT EXISTS (SELECT 1 FROM campanas WHERE nombre = 'Inversores Premium');

-- 9. ÍNDICES ADICIONALES
CREATE INDEX IF NOT EXISTS idx_leads_busqueda ON leads USING GIN (
  to_tsvector('spanish', nombre || ' ' || COALESCE(email, '') || ' ' || COALESCE(telefono, ''))
);

CREATE INDEX IF NOT EXISTS idx_leads_datos ON leads USING GIN (datos);