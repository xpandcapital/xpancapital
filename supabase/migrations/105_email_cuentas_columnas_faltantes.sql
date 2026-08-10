-- Agregar columnas faltantes a email_cuentas que el código ya usa
ALTER TABLE email_cuentas ADD COLUMN IF NOT EXISTS departamento TEXT;
ALTER TABLE email_cuentas ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE email_cuentas ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE email_cuentas ADD COLUMN IF NOT EXISTS plantilla_default_id UUID;
