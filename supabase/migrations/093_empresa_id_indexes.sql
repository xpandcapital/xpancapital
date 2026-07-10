-- ============================================================
-- 093: Índices empresa_id en tablas críticas (sin índice = full table scan)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_empresa_id ON profiles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_productos_empresa_id ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_compras_empresa_id ON compras(empresa_id);

SELECT 'Indexes created on profiles, productos, compras' AS status;
