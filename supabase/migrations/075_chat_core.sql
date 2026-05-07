-- Migration: chat core tables
-- Fixes infinite recursion in RLS policies using SECURITY DEFINER helper functions

-- ============================================================
-- Helper function: get user's sala IDs (SECURITY DEFINER to bypass RLS recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION user_sala_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT sala_id FROM chat_miembros WHERE user_id = auth.uid();
$$;

-- ============================================================
-- Helper function: get user's empresa ID
-- ============================================================
CREATE OR REPLACE FUNCTION user_empresa_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT empresa_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- Table: chat_salas
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_salas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('directo', 'grupal', 'soporte', 'ventas', 'ia', 'visitante')),
  nombre text,
  descripcion text,
  creado_por uuid REFERENCES profiles(id) ON DELETE SET NULL,
  asignado_a uuid REFERENCES profiles(id) ON DELETE SET NULL,
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'archivado', 'bloqueado')),
  metadata jsonb NOT NULL DEFAULT '{}',
  ultimo_mensaje jsonb,
  ultima_actividad timestamptz DEFAULT now(),
  creado_en timestamptz DEFAULT now()
);

ALTER TABLE chat_salas ENABLE ROW LEVEL SECURITY;

-- Policies for chat_salas
DROP POLICY IF EXISTS "chat_salas_select_miembro" ON chat_salas;
CREATE POLICY "chat_salas_select_miembro"
  ON chat_salas FOR SELECT
  USING (id IN (SELECT user_sala_ids()));

DROP POLICY IF EXISTS "chat_salas_insert_miembro" ON chat_salas;
CREATE POLICY "chat_salas_insert_miembro"
  ON chat_salas FOR INSERT
  WITH CHECK (creado_por = auth.uid());

DROP POLICY IF EXISTS "chat_salas_update_miembro" ON chat_salas;
CREATE POLICY "chat_salas_update_miembro"
  ON chat_salas FOR UPDATE
  USING (id IN (SELECT user_sala_ids()))
  WITH CHECK (id IN (SELECT user_sala_ids()));

-- ============================================================
-- Table: chat_miembros
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_miembros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sala_id uuid NOT NULL REFERENCES chat_salas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rol_sala text NOT NULL DEFAULT 'miembro' CHECK (rol_sala IN ('admin', 'miembro', 'observador')),
  ultima_lectura timestamptz,
  silenciado boolean NOT NULL DEFAULT false,
  bloqueado_por uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notificaciones boolean NOT NULL DEFAULT true,
  agregado_en timestamptz DEFAULT now(),
  UNIQUE(sala_id, user_id)
);

ALTER TABLE chat_miembros ENABLE ROW LEVEL SECURITY;

-- Policies for chat_miembros (NO recursive subqueries to same table)
DROP POLICY IF EXISTS "chat_miembros_select_own" ON chat_miembros;
CREATE POLICY "chat_miembros_select_own"
  ON chat_miembros FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_miembros_select_sala" ON chat_miembros;
CREATE POLICY "chat_miembros_select_sala"
  ON chat_miembros FOR SELECT
  USING (sala_id IN (SELECT user_sala_ids()));

DROP POLICY IF EXISTS "chat_miembros_insert_admin" ON chat_miembros;
CREATE POLICY "chat_miembros_insert_admin"
  ON chat_miembros FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR (
      sala_id IN (SELECT user_sala_ids())
      AND EXISTS (
        SELECT 1 FROM chat_miembros cm2
        WHERE cm2.sala_id = chat_miembros.sala_id
          AND cm2.user_id = auth.uid()
          AND cm2.rol_sala = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "chat_miembros_update_own" ON chat_miembros;
CREATE POLICY "chat_miembros_update_own"
  ON chat_miembros FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Table: chat_mensajes
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sala_id uuid NOT NULL REFERENCES chat_salas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tipo text NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagen', 'video', 'audio', 'archivo', 'sistema', 'ia')),
  contenido text,
  archivo_url text,
  archivo_nombre text,
  archivo_size integer,
  archivo_mime text,
  archivo_eliminado boolean NOT NULL DEFAULT false,
  reply_to uuid REFERENCES chat_mensajes(id) ON DELETE SET NULL,
  fijado boolean NOT NULL DEFAULT false,
  editado boolean NOT NULL DEFAULT false,
  eliminado boolean NOT NULL DEFAULT false,
  leido_por uuid[] NOT NULL DEFAULT '{}',
  programado_para timestamptz,
  enviado boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  creado_en timestamptz DEFAULT now()
);

ALTER TABLE chat_mensajes ENABLE ROW LEVEL SECURITY;

-- Policies for chat_mensajes
DROP POLICY IF EXISTS "chat_mensajes_select_miembro" ON chat_mensajes;
CREATE POLICY "chat_mensajes_select_miembro"
  ON chat_mensajes FOR SELECT
  USING (sala_id IN (SELECT user_sala_ids()));

DROP POLICY IF EXISTS "chat_mensajes_insert_miembro" ON chat_mensajes;
CREATE POLICY "chat_mensajes_insert_miembro"
  ON chat_mensajes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND sala_id IN (SELECT user_sala_ids())
  );

DROP POLICY IF EXISTS "chat_mensajes_update_own" ON chat_mensajes;
CREATE POLICY "chat_mensajes_update_own"
  ON chat_mensajes FOR UPDATE
  USING (
    user_id = auth.uid()
    AND sala_id IN (SELECT user_sala_ids())
  )
  WITH CHECK (
    user_id = auth.uid()
    AND sala_id IN (SELECT user_sala_ids())
  );

DROP POLICY IF EXISTS "chat_mensajes_update_fijado" ON chat_mensajes;
CREATE POLICY "chat_mensajes_update_fijado"
  ON chat_mensajes FOR UPDATE
  USING (
    sala_id IN (SELECT user_sala_ids())
  )
  WITH CHECK (
    sala_id IN (SELECT user_sala_ids())
  );

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chat_salas_empresa ON chat_salas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chat_salas_estado ON chat_salas(estado);
CREATE INDEX IF NOT EXISTS idx_chat_salas_ultima_actividad ON chat_salas(ultima_actividad DESC);
CREATE INDEX IF NOT EXISTS idx_chat_miembros_sala ON chat_miembros(sala_id);
CREATE INDEX IF NOT EXISTS idx_chat_miembros_user ON chat_miembros(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_sala ON chat_mensajes(sala_id);
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_creado ON chat_mensajes(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_chat_mensajes_eliminado ON chat_mensajes(eliminado) WHERE eliminado = false;

-- ============================================================
-- Realtime publication
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_salas;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_miembros;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_mensajes;

-- ============================================================
-- Trigger: update ultima_actividad on new message
-- ============================================================
CREATE OR REPLACE FUNCTION update_sala_ultima_actividad()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE chat_salas
  SET ultima_actividad = NEW.creado_en,
      ultimo_mensaje = jsonb_build_object(
        'id', NEW.id,
        'contenido', NEW.contenido,
        'tipo', NEW.tipo,
        'user_id', NEW.user_id,
        'creado_en', NEW.creado_en
      )
  WHERE id = NEW.sala_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_mensajes_ultima_actividad ON chat_mensajes;
CREATE TRIGGER trg_chat_mensajes_ultima_actividad
  AFTER INSERT ON chat_mensajes
  FOR EACH ROW
  EXECUTE FUNCTION update_sala_ultima_actividad();
