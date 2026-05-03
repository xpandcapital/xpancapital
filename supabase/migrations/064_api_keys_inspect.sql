-- ============================================================
-- Inspección y limpieza de api_keys viejas
-- ============================================================

-- 1. VER estado actual de api_keys
-- Ejecuta esto en el SQL Editor de Supabase para inspeccionar:
/*
SELECT 
    id,
    empresa_id,
    key_name,
    user_id,
    is_global,
    LENGTH(key_value) as key_len,
    created_at,
    updated_at
FROM api_keys
ORDER BY created_at DESC;
*/

-- 2. VER keys sin user_id (keys viejas antes del sistema personal/global)
-- Estas son las que deberías limpiar si creaste nuevas en API Nube
/*
SELECT 
    id,
    empresa_id,
    key_name,
    user_id,
    is_global,
    created_at
FROM api_keys
WHERE user_id IS NULL
ORDER BY created_at DESC;
*/

-- 3. ELIMINAR keys viejas sin user_id (solo si ya creaste nuevas)
-- ¡CUIDADO! Solo ejecuta si ya guardaste tus keys desde API Nube
/*
DELETE FROM api_keys
WHERE user_id IS NULL
  AND is_global IS NOT TRUE;
*/

-- 4. CAMBIAR keys viejas a globales si quieres mantenerlas
-- (les asigna is_global=true para que sirvan como fallback)
/*
UPDATE api_keys
SET is_global = true
WHERE user_id IS NULL
  AND is_global IS NOT TRUE;
*/

-- 5. VER estado final
/*
SELECT 
    key_name,
    is_global,
    user_id IS NOT NULL as tiene_usuario,
    LENGTH(key_value) as key_len,
    created_at
FROM api_keys
ORDER BY is_global DESC, created_at DESC;
*/
