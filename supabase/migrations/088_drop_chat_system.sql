-- ============================================================
-- 088: Eliminar sistema de chat (recursión RLS, costo excesivo)
-- Ejecutar en Supabase SQL Editor o npx supabase db push
-- ============================================================

-- 1. ELIMINAR TRIGGERS
DROP TRIGGER IF EXISTS trg_chat_mensajes_ultima_actividad ON chat_mensajes;

-- 2. ELIMINAR FUNCIONES específicas del chat
DROP FUNCTION IF EXISTS user_sala_ids();
DROP FUNCTION IF EXISTS update_sala_ultima_actividad();

-- 3. ELIMINAR TABLAS (orden por dependencias FK)
DROP TABLE IF EXISTS chat_mensajes CASCADE;
DROP TABLE IF EXISTS chat_miembros CASCADE;
DROP TABLE IF EXISTS chat_llamadas CASCADE;
DROP TABLE IF EXISTS chat_presencia CASCADE;
DROP TABLE IF EXISTS chat_visitantes CASCADE;
DROP TABLE IF EXISTS chat_plantillas CASCADE;
DROP TABLE IF EXISTS chat_config CASCADE;
DROP TABLE IF EXISTS chat_salas CASCADE;

-- 4. ELIMINAR del realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS chat_salas;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS chat_miembros;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS chat_mensajes;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS chat_presencia;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS chat_llamadas;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS chat_visitantes;

-- 5. ELIMINAR columna y política específicas del chat en profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS estado_chat;
DROP POLICY IF EXISTS "profiles_update_own_estado_chat" ON profiles;

-- 6. ACTUALIZAR constraint de notificaciones (quitar 'chat')
ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_tipo_check
  CHECK (tipo IN ('sistema', 'lead', 'venta', 'alerta', 'recordatorio', 'info', 'warning', 'success', 'error'));

-- 7. NOTA: Se conservan estas funciones útiles para multi-tenant:
--    - user_empresa_id() → usada por profiles_select_same_empresa
--    - array_append_unique() → utilidad general
--    Se conserva la política profiles_select_same_empresa (lectura entre usuarios de la misma empresa)

SELECT 'Chat system dropped successfully' AS status;
