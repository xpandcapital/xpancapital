-- Tabla de servidores de correo corporativo (IMAP/SMTP por dominio)
CREATE TABLE IF NOT EXISTS email_servidores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  dominio TEXT NOT NULL,
  imap_host TEXT NOT NULL,
  imap_port INTEGER DEFAULT 993,
  imap_secure BOOLEAN DEFAULT true,
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER DEFAULT 465,
  smtp_secure BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de cuentas de correo de empleados
CREATE TABLE IF NOT EXISTS email_cuentas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  servidor_id UUID REFERENCES email_servidores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_enc TEXT NOT NULL,
  nombre_mostrado TEXT,
  firma TEXT,
  last_sync TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_servidores_empresa ON email_servidores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_email_servidores_dominio ON email_servidores(dominio);
CREATE INDEX IF NOT EXISTS idx_email_cuentas_servidor ON email_cuentas(servidor_id);
CREATE INDEX IF NOT EXISTS idx_email_cuentas_user ON email_cuentas(user_id);

-- Triggers para actualizar actualizado_en
CREATE OR REPLACE FUNCTION update_email_servidores_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_servidores_updated
  BEFORE UPDATE ON email_servidores
  FOR EACH ROW
  EXECUTE FUNCTION update_email_servidores_timestamp();

CREATE TRIGGER update_email_cuentas_updated
  BEFORE UPDATE ON email_cuentas
  FOR EACH ROW
  EXECUTE FUNCTION update_email_servidores_timestamp();

-- Row Level Security
ALTER TABLE email_servidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_cuentas ENABLE ROW LEVEL SECURITY;

-- Políticas: email_servidores (solo admin/TI)
CREATE POLICY "Usuarios pueden ver servidores de su empresa" ON email_servidores
  FOR SELECT USING (empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true));

CREATE POLICY "Admins pueden gestionar servidores" ON email_servidores
  FOR INSERT WITH CHECK (
    empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true)
    AND current_setting('request.jwt.claims->>rol', true) IN ('superadmin', 'admin')
  );

CREATE POLICY "Admins pueden actualizar servidores" ON email_servidores
  FOR UPDATE USING (
    empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true)
    AND current_setting('request.jwt.claims->>rol', true) IN ('superadmin', 'admin')
  );

CREATE POLICY "Admins pueden eliminar servidores" ON email_servidores
  FOR DELETE USING (
    empresa_id::text = current_setting('request.jwt.claims->>empresa_id', true)
    AND current_setting('request.jwt.claims->>rol', true) IN ('superadmin', 'admin')
  );

-- Políticas: email_cuentas (cada usuario ve solo sus cuentas)
CREATE POLICY "Usuarios pueden ver sus cuentas" ON email_cuentas
  FOR SELECT USING (user_id::text = current_setting('request.jwt.claims->>sub', true));

CREATE POLICY "Usuarios pueden crear sus cuentas" ON email_cuentas
  FOR INSERT WITH CHECK (user_id::text = current_setting('request.jwt.claims->>sub', true));

CREATE POLICY "Usuarios pueden actualizar sus cuentas" ON email_cuentas
  FOR UPDATE USING (user_id::text = current_setting('request.jwt.claims->>sub', true));

CREATE POLICY "Usuarios pueden eliminar sus cuentas" ON email_cuentas
  FOR DELETE USING (user_id::text = current_setting('request.jwt.claims->>sub', true));
