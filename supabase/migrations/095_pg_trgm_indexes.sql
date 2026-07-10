-- ============================================================
-- 095: pg_trgm para búsquedas rápidas con ILIKE
-- Sin esto, cada búsqueda (ventas, clientes, leads) hace full table scan
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índices trigram en campos de búsqueda frecuentes
CREATE INDEX IF NOT EXISTS idx_profiles_nombre_trgm ON profiles USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON profiles USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_nombre_trgm ON leads USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_email_trgm ON leads USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_productos_nombre_trgm ON productos USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_blog_posts_titulo_trgm ON blog_posts USING gin (titulo gin_trgm_ops);

SELECT 'pg_trgm enabled and trigram indexes created' AS status;
