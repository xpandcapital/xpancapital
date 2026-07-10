-- =============================================
-- MIGRACIÓN: Sistema de Leads y Campañas
-- =============================================

-- 1. TABLA DE ASESORES
CREATE TABLE IF NOT EXISTS asesores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  whatsapp TEXT,
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  
  -- Metadatos
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asesores_empresa ON asesores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_asesores_activo ON asesores(activo);

-- 2. TABLA DE CAMPAÑAS
CREATE TABLE IF NOT EXISTS campanas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  asesor_id UUID REFERENCES asesores(id) ON DELETE SET NULL,
  
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('borrador', 'activa', 'pausada', 'finalizada')),
  
  -- Configuración de notificaciones
  notificar_email BOOLEAN DEFAULT true,
  notificar_whatsapp BOOLEAN DEFAULT false,
  emails_notificacion TEXT[] DEFAULT '{}',
  whatsapp_notificacion TEXT[] DEFAULT '{}',
  
  -- Integración con Notion
  notion_database_id TEXT,
  notion_sync BOOLEAN DEFAULT false,
  
  -- Metadatos
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campanas_empresa ON campanas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_campanas_asesor ON campanas(asesor_id);
CREATE INDEX IF NOT EXISTS idx_campanas_estado ON campanas(estado);

-- 3. TABLA DE LEADS
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  campana_id UUID REFERENCES campanas(id) ON DELETE SET NULL,
  asesor_id UUID REFERENCES asesores(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  
  -- Datos del lead
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  whatsapp TEXT,
  
  -- Datos adicionales (JSON flexible)
  datos JSONB DEFAULT '{}',
  
  -- Campos personalizados
  ciudad TEXT,
  presupuesto TEXT,
  interes TEXT,
  mensaje TEXT,
  
  -- Etiquetas y estado
  estado TEXT DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'calificado', 'cliente', 'perdido')),
  etiquetas TEXT[] DEFAULT '{}',
  notas TEXT,
  
  -- Tracking
  origen TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadatos
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now(),
  contactado_en TIMESTAMPTZ,
  convertido_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leads_empresa ON leads(empresa_id);
CREATE INDEX IF NOT EXISTS idx_leads_campana ON leads(campana_id);
CREATE INDEX IF NOT EXISTS idx_leads_asesor ON leads(asesor_id);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_creado ON leads(creado_en DESC);

-- 4. TABLA DE INTEGRACIONES
CREATE TABLE IF NOT EXISTS integraciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp', 'email', 'notion', 'zapier', 'webhook')),
  nombre TEXT NOT NULL,
  
  -- Configuración (varía según tipo)
  config JSONB DEFAULT '{}',
  
  -- Estado
  activa BOOLEAN DEFAULT true,
  ultima_sincronizacion TIMESTAMPTZ,
  
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integraciones_empresa ON integraciones(empresa_id);
CREATE INDEX IF NOT EXISTS idx_integraciones_tipo ON integraciones(tipo);

-- 5. AGREGAR CAMPOS DE CONFIGURACIÓN A TEMPLATES
-- Ya existen en la tabla, solo añadimos campos de formulario

-- 6. FUNCIÓN PARA NOTIFICAR NUEVO LEAD
CREATE OR REPLACE FUNCTION notificar_nuevo_lead(
  p_lead_id UUID
)
RETURNS void AS $$
DECLARE
  v_lead leads%ROWTYPE;
  v_campana campanas%ROWTYPE;
  v_asesor asesores%ROWTYPE;
BEGIN
  -- Obtener datos del lead
  SELECT * INTO v_lead FROM leads WHERE id = p_lead_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Obtener campaña
  IF v_lead.campana_id IS NOT NULL THEN
    SELECT * INTO v_campana FROM campanas WHERE id = v_lead.campana_id;
    
    -- Si hay asesor asignado, obtenerlo
    IF v_campana.asesor_id IS NOT NULL THEN
      SELECT * INTO v_asesor FROM asesores WHERE id = v_campana.asesor_id;
    END IF;
  END IF;
  
  -- Aquí iría la lógica de notificación
  -- Por ahora solo registramos en logs
  
  -- Actualizar timestamp
  UPDATE leads SET actualizado_en = now() WHERE id = p_lead_id;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER PARA NOTIFICAR NUEVO LEAD
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

CREATE TRIGGER trigger_nuevo_lead
AFTER INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION trigger_nuevo_lead();

-- 8. POLÍTICAS RLS
ALTER TABLE asesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE integraciones ENABLE ROW LEVEL SECURITY;

-- Políticas para asesores
CREATE POLICY "asesores_empresa" ON asesors
  FOR ALL USING (empresa_id = auth.jwt() ->> 'empresa_id');

-- Políticas para campañas
CREATE POLICY "campanas_empresa" ON campanas
  FOR ALL USING (empresa_id = auth.jwt() ->> 'empresa_id');

-- Políticas para leads
CREATE POLICY "leads_empresa" ON leads
  FOR ALL USING (empresa_id = auth.jwt() ->> 'empresa_id');

-- Políticas para integraciones
CREATE POLICY "integraciones_empresa" ON integraciones
  FOR ALL USING (empresa_id = auth.jwt() ->> 'empresa_id');

-- 9. DATOS DE EJEMPLO
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

-- 10. ÍNDICES ADICIONALES PARA BÚSQUEDA
CREATE INDEX IF NOT EXISTS idx_leads_busqueda ON leads USING GIN (
  to_tsvector('spanish', nombre || ' ' || COALESCE(email, '') || ' ' || COALESCE(telefono, ''))
);

CREATE INDEX IF NOT EXISTS idx_leads_datos ON leads USING GIN (datos);

COMMIT;