-- 125: Restaurar GRANTs estándar de Supabase (faltantes tras clonar el proyecto)
-- ---------------------------------------------------------------------------
-- PROBLEMA: El proyecto clonado quedó sin los GRANTs por defecto de Supabase
-- sobre las tablas de public (anon/authenticated sin SELECT en profiles,
-- productos, etc.) → 403 "permission denied" en consultas del navegador.
-- SOLUCIÓN: Replicar los permisos por defecto de Supabase. La seguridad de
-- filas la siguen controlando las políticas RLS.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Para objetos que se creen en el futuro
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Recargar cache de PostgREST
NOTIFY pgrst, 'reload schema';
