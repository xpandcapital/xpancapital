-- Migration: chat advanced tables (config, templates, presence, visitors, calls)
-- Handles pre-existing tables by adding missing columns

-- ============================================================
-- Add estado_chat to profiles if not exists
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'estado_chat'
  ) THEN
    ALTER TABLE profiles ADD COLUMN estado_chat text DEFAULT 'online' CHECK (estado_chat IN ('online', 'ausente', 'ocupado', 'offline'));
  END IF;
END
$$;

-- ============================================================
-- Table: chat_config
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  widget_activo boolean NOT NULL DEFAULT true,
  widget_color text NOT NULL DEFAULT '#ef4444',
  widget_posicion text NOT NULL DEFAULT 'bottom-right',
  widget_mensaje_bienvenida text,
  widget_mensaje_fuera_horario text,
  horario_atencion jsonb NOT NULL DEFAULT '{}',
  ia_activa boolean NOT NULL DEFAULT false,
  ia_modelo text DEFAULT 'gemini-1.5-flash',
  ia_prompt_sistema text,
  ia_max_tokens integer DEFAULT 1024,
  derivacion_automatica boolean NOT NULL DEFAULT false,
  derivacion_despues_mensajes integer DEFAULT 3,
  palabras_clave_derivacion text[] DEFAULT '{}',
  notificar_email boolean NOT NULL DEFAULT true,
  notificar_push boolean NOT NULL DEFAULT true,
  sonido_nuevo_mensaje boolean NOT NULL DEFAULT true,
  permitir_archivos boolean NOT NULL DEFAULT true,
  max_file_size_mb integer DEFAULT 10,
  tipos_archivo_permitidos text[] DEFAULT ARRAY['jpg','jpeg','png','gif','pdf','doc','docx','txt'],
  paginas_widget text[] DEFAULT ARRAY['/','/tienda','/blog','/contacto','/proyectos'],
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  UNIQUE(empresa_id)
);

ALTER TABLE chat_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_config_select_empresa" ON chat_config;
CREATE POLICY "chat_config_select_empresa"
  ON chat_config FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_config_update_admin" ON chat_config;
CREATE POLICY "chat_config_update_admin"
  ON chat_config FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

-- ============================================================
-- Table: chat_plantillas
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_plantillas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  departamento text NOT NULL DEFAULT 'general',
  titulo text NOT NULL,
  contenido text NOT NULL,
  atajo text,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz DEFAULT now(),
  creado_por uuid REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE chat_plantillas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_plantillas_select_empresa" ON chat_plantillas;
CREATE POLICY "chat_plantillas_select_empresa"
  ON chat_plantillas FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_plantillas_insert_empresa" ON chat_plantillas;
CREATE POLICY "chat_plantillas_insert_empresa"
  ON chat_plantillas FOR INSERT
  WITH CHECK (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_plantillas_update_empresa" ON chat_plantillas;
CREATE POLICY "chat_plantillas_update_empresa"
  ON chat_plantillas FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

-- ============================================================
-- Table: chat_presencia
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_presencia (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  estado text NOT NULL DEFAULT 'online' CHECK (estado IN ('online', 'ausente', 'ocupado', 'offline')),
  ultimo_ping timestamptz DEFAULT now(),
  esta_escribiendo_en uuid REFERENCES chat_salas(id) ON DELETE SET NULL,
  dispositivo text DEFAULT 'web'
);

-- Add empresa_id if missing (table may exist from prior migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_presencia' AND column_name = 'empresa_id'
  ) THEN
    ALTER TABLE chat_presencia ADD COLUMN empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE;
  END IF;
END
$$;

ALTER TABLE chat_presencia ENABLE ROW LEVEL SECURITY;

-- CRITICAL FIX: Allow authenticated users to manage their own presence
DROP POLICY IF EXISTS "chat_presencia_select_own" ON chat_presencia;
CREATE POLICY "chat_presencia_select_own"
  ON chat_presencia FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_presencia_select_empresa" ON chat_presencia;
CREATE POLICY "chat_presencia_select_empresa"
  ON chat_presencia FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_presencia_insert_own" ON chat_presencia;
CREATE POLICY "chat_presencia_insert_own"
  ON chat_presencia FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_presencia_update_own" ON chat_presencia;
CREATE POLICY "chat_presencia_update_own"
  ON chat_presencia FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_presencia_delete_own" ON chat_presencia;
CREATE POLICY "chat_presencia_delete_own"
  ON chat_presencia FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- Table: chat_visitantes
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_visitantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  nombre text NOT NULL,
  email text,
  sala_id uuid NOT NULL REFERENCES chat_salas(id) ON DELETE CASCADE,
  pagina_origen text,
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'resuelto', 'abandonado')),
  ultima_actividad timestamptz DEFAULT now(),
  creado_en timestamptz DEFAULT now()
);

-- Add empresa_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_visitantes' AND column_name = 'empresa_id'
  ) THEN
    ALTER TABLE chat_visitantes ADD COLUMN empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Add UTM columns if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_visitantes' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE chat_visitantes ADD COLUMN utm_source text;
    ALTER TABLE chat_visitantes ADD COLUMN utm_medium text;
    ALTER TABLE chat_visitantes ADD COLUMN utm_campaign text;
  END IF;
END
$$;

ALTER TABLE chat_visitantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_visitantes_select_empresa" ON chat_visitantes;
CREATE POLICY "chat_visitantes_select_empresa"
  ON chat_visitantes FOR SELECT
  USING (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "chat_visitantes_update_empresa" ON chat_visitantes;
CREATE POLICY "chat_visitantes_update_empresa"
  ON chat_visitantes FOR UPDATE
  USING (empresa_id = user_empresa_id())
  WITH CHECK (empresa_id = user_empresa_id());

-- ============================================================
-- Table: chat_llamadas
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_llamadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sala_id uuid REFERENCES chat_salas(id) ON DELETE SET NULL,
  iniciada_por uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recibida_por uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('audio', 'video')),
  estado text NOT NULL DEFAULT 'llamando' CHECK (estado IN ('llamando', 'conectada', 'finalizada', 'perdida', 'rechazada')),
  inicio_en timestamptz DEFAULT now(),
  fin_en timestamptz,
  duracion_segundos integer,
  metadata jsonb DEFAULT '{}',
  creado_en timestamptz DEFAULT now()
);

-- Add senalizacion if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_llamadas' AND column_name = 'senalizacion'
  ) THEN
    ALTER TABLE chat_llamadas ADD COLUMN senalizacion jsonb DEFAULT '{}';
  END IF;
END
$$;

ALTER TABLE chat_llamadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_llamadas_select_participante" ON chat_llamadas;
CREATE POLICY "chat_llamadas_select_participante"
  ON chat_llamadas FOR SELECT
  USING (iniciada_por = auth.uid() OR recibida_por = auth.uid());

DROP POLICY IF EXISTS "chat_llamadas_insert_participante" ON chat_llamadas;
CREATE POLICY "chat_llamadas_insert_participante"
  ON chat_llamadas FOR INSERT
  WITH CHECK (iniciada_por = auth.uid());

DROP POLICY IF EXISTS "chat_llamadas_update_participante" ON chat_llamadas;
CREATE POLICY "chat_llamadas_update_participante"
  ON chat_llamadas FOR UPDATE
  USING (iniciada_por = auth.uid() OR recibida_por = auth.uid())
  WITH CHECK (iniciada_por = auth.uid() OR recibida_por = auth.uid());

-- ============================================================
-- Helper function: array_append_unique (for marking messages read)
-- ============================================================
CREATE OR REPLACE FUNCTION array_append_unique(arr uuid[], elem uuid)
RETURNS uuid[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT array_agg(DISTINCT x)
  FROM unnest(array_append(arr, elem)) AS x
  WHERE x IS NOT NULL;
$$;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chat_config_empresa ON chat_config(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chat_plantillas_empresa ON chat_plantillas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chat_plantillas_activo ON chat_plantillas(activo);
CREATE INDEX IF NOT EXISTS idx_chat_presencia_empresa ON chat_presencia(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chat_presencia_ping ON chat_presencia(ultimo_ping);
CREATE INDEX IF NOT EXISTS idx_chat_visitantes_sala ON chat_visitantes(sala_id);
CREATE INDEX IF NOT EXISTS idx_chat_visitantes_session ON chat_visitantes(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_visitantes_estado ON chat_visitantes(estado);
CREATE INDEX IF NOT EXISTS idx_chat_llamadas_sala ON chat_llamadas(sala_id);
CREATE INDEX IF NOT EXISTS idx_chat_llamadas_recibida ON chat_llamadas(recibida_por);
CREATE INDEX IF NOT EXISTS idx_chat_llamadas_estado ON chat_llamadas(estado);

-- ============================================================
-- Realtime publication
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_presencia;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_llamadas;

-- Note: chat_visitantes and chat_config are NOT added to realtime by default
-- to avoid noise. Add them if needed.
