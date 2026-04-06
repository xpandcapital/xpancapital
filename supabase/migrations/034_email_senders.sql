-- Tabla de remitentes de correo
CREATE TABLE IF NOT EXISTS email_senders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  provider TEXT DEFAULT 'smtp',
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 465,
  smtp_user TEXT,
  smtp_pass TEXT,
  api_key TEXT,
  is_default BOOLEAN DEFAULT false,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de campañas de correo
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  sender_id UUID REFERENCES email_senders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  status TEXT DEFAULT 'draft',
  recipients JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  error_message TEXT,
  enviado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_senders_empresa ON email_senders(empresa_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_empresa ON email_campaigns(empresa_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sender ON email_campaigns(sender_id);

-- Trigger para actualizar actualizado_en
CREATE OR REPLACE FUNCTION update_email_senders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_senders_updated
  BEFORE UPDATE ON email_senders
  FOR EACH ROW
  EXECUTE FUNCTION update_email_senders_timestamp();

CREATE TRIGGER update_email_campaigns_updated
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_email_senders_timestamp();

-- Row Level Security
ALTER TABLE email_senders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus remitentes" ON email_senders
  FOR SELECT USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden crear remitentes" ON email_senders
  FOR INSERT WITH CHECK (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden actualizar sus remitentes" ON email_senders
  FOR UPDATE USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden eliminar sus remitentes" ON email_senders
  FOR DELETE USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden ver sus campañas" ON email_campaigns
  FOR SELECT USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden crear campañas" ON email_campaigns
  FOR INSERT WITH CHECK (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden actualizar sus campañas" ON email_campaigns
  FOR UPDATE USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Usuarios pueden eliminar sus campañas" ON email_campaigns
  FOR DELETE USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));