-- Migración: 107_transmisiones_monedas_fix.sql
-- Agrega soporte multimoneda real en productos + persistencia de configuración

-- ============================================================
-- 1. Columna precios_multimoneda en productos
-- ============================================================
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precios_multimoneda JSONB DEFAULT '{}';

-- ============================================================
-- 2. Columnas de configuración en monedas_config
-- ============================================================
ALTER TABLE monedas_config 
  ADD COLUMN IF NOT EXISTS multi_moneda_habilitado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moneda_impuestos TEXT NOT NULL DEFAULT 'PEN';

-- ============================================================
-- 3. Insertar o actualizar fila por defecto para cada empresa
-- ============================================================
INSERT INTO monedas_config (empresa_id, moneda_base, monedas_activas, margen_seguridad, multi_moneda_habilitado, moneda_impuestos)
SELECT id, 'USD', '{USD,PEN}', 0.02, false, 'PEN'
FROM empresas
WHERE id NOT IN (SELECT empresa_id FROM monedas_config)
ON CONFLICT (empresa_id) DO NOTHING;
