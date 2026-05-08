-- ============================================================
-- Fix notificaciones table for chat notifications
-- ============================================================

-- First, check if notificaciones table exists and fix its constraints
DO $$
BEGIN
  -- If the table doesn't exist, create it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'notificaciones'
  ) THEN
    CREATE TABLE notificaciones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      tipo TEXT NOT NULL DEFAULT 'sistema' CHECK (tipo IN ('sistema', 'chat', 'lead', 'venta', 'alerta', 'recordatorio')),
      titulo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      link TEXT,
      leido BOOLEAN DEFAULT false,
      creado_en TIMESTAMPTZ DEFAULT now()
    );
    
    CREATE INDEX idx_notificaciones_user ON notificaciones(user_id, leido, creado_en DESC);
    CREATE INDEX idx_notificaciones_empresa ON notificaciones(empresa_id, creado_en DESC);
    
    ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "notificaciones_select_own"
      ON notificaciones FOR SELECT
      USING (user_id = auth.uid());
      
    CREATE POLICY "notificaciones_insert_empresa"
      ON notificaciones FOR INSERT
      WITH CHECK (empresa_id = user_empresa_id());
  ELSE
    -- Table exists, fix the constraint
    ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;
    ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_tipo_check
      CHECK (tipo IN ('sistema', 'chat', 'lead', 'venta', 'alerta', 'recordatorio'));
  END IF;
END
$$;

-- Add enviado_por column if not exists
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS enviado_por UUID REFERENCES profiles(id);
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS destinatario_tipo TEXT CHECK (destinatario_tipo IN ('todos', 'por_rol', 'miembro', 'grupo'));
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS destinatario_ids TEXT[] DEFAULT '{}';

-- Ensure RLS policies exist
DROP POLICY IF EXISTS "notificaciones_select_own" ON notificaciones;
CREATE POLICY "notificaciones_select_own"
  ON notificaciones FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notificaciones_insert_empresa" ON notificaciones;
CREATE POLICY "notificaciones_insert_empresa"
  ON notificaciones FOR INSERT
  WITH CHECK (empresa_id = user_empresa_id());

DROP POLICY IF EXISTS "notificaciones_update_own" ON notificaciones;
CREATE POLICY "notificaciones_update_own"
  ON notificaciones FOR UPDATE
  USING (user_id = auth.uid());

SELECT 'Notificaciones table fixed for chat' AS status;
