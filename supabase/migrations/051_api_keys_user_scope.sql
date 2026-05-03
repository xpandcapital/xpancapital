-- 051: api_keys user_id + is_global (soporte para keys personales vs globales)
-- Ejecutado manualmente en Supabase. Este archivo es documentación.

-- Agregar columnas para soporte personal/global
-- ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
-- ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Actualizar keys existentes como globales
-- UPDATE api_keys SET is_global = true WHERE is_global IS NULL AND user_id IS NULL;

-- Índices condicionales para unicidad
-- CREATE UNIQUE INDEX IF NOT EXISTS api_keys_global_unique ON api_keys(key_name, empresa_id) WHERE is_global = true;
-- CREATE UNIQUE INDEX IF NOT EXISTS api_keys_personal_unique ON api_keys(key_name, empresa_id, user_id) WHERE is_global = false;

SELECT 1;
