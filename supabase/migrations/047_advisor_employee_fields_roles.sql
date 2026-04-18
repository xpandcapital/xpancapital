-- Migration 047: Expand advisors with employee fields, add roles table
-- This enables full employee management with inherited postulante data

-- 1. Add employee fields to advisors table
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS puesto TEXT;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'editor' CHECK (rol IN ('usuario', 'cliente', 'editor', 'admin', 'superadmin'));
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS lugar_residencia TEXT;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS documento_identidad TEXT;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS estado_civil TEXT;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS nivel_estudios TEXT;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS aspiracion_salarial TEXT;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS disponibilidad_inmediata BOOLEAN DEFAULT true;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS disponibilidad_viaje BOOLEAN;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS acceso_tecnologia TEXT;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS herramientas TEXT[];
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE advisors ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create roles table with permissions
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  descripcion TEXT,
  permisos JSONB DEFAULT '[]'::jsonb,
  color TEXT DEFAULT '#6b7280',
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 3. Seed default roles
INSERT INTO roles (nombre, label, descripcion, permisos, color) VALUES
  ('usuario', 'Usuario', 'Acceso básico a la plataforma', '["ver_productos", "comprar"]'::jsonb, '#6b7280'),
  ('cliente', 'Cliente', 'Cliente registrado con historial', '["ver_productos", "comprar", "ver_historial", "favoritos"]'::jsonb, '#3b82f6'),
  ('editor', 'Editor', 'Puede crear y editar contenido', '["ver_productos", "comprar", "ver_historial", "favoritos", "editar_contenido", "crear_posts"]'::jsonb, '#8b5cf6'),
  ('admin', 'Admin', 'Administrador con acceso amplio', '["ver_productos", "comprar", "ver_historial", "favoritos", "editar_contenido", "crear_posts", "gestionar_productos", "ver_analiticas", "gestionar_usuarios"]'::jsonb, '#f59e0b'),
  ('superadmin', 'Super Admin', 'Acceso completo al sistema', '["*"]'::jsonb, '#be0b3c')
ON CONFLICT (nombre) DO NOTHING;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_advisors_rol ON advisors(rol);
CREATE INDEX IF NOT EXISTS idx_advisors_auth_user ON advisors(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_advisors_puesto ON advisors(puesto);