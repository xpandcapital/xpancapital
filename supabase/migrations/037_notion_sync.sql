-- Agregar campos de Notion a tabla projects
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS notion_database_id TEXT,
  ADD COLUMN IF NOT EXISTS notion_last_sync TIMESTAMPTZ;

-- Agregar campos de Notion a tabla project_lots
ALTER TABLE project_lots
  ADD COLUMN IF NOT EXISTS notion_page_id TEXT,
  ADD COLUMN IF NOT EXISTS notion_last_sync TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS lot_area NUMERIC;

-- Índice para búsqueda rápida por notion_page_id
CREATE INDEX IF NOT EXISTS idx_project_lots_notion_page_id 
  ON project_lots(notion_page_id) WHERE notion_page_id IS NOT NULL;

-- Vista útil: lotes con info de cliente para sincronización
CREATE OR REPLACE VIEW v_lotes_sync AS
SELECT 
  pl.id,
  pl.project_id,
  p.name as project_name,
  pl.lot_number,
  pl.client_name,
  pl.status,
  pl.total_price,
  pl.lot_area,
  pl.notion_page_id,
  pl.notion_last_sync,
  pl.extra_data->>'celular' as cliente_celular,
  pl.extra_data->>'email' as cliente_email,
  pl.extra_data->>'asesor' as asesor,
  pl.extra_data->>'fecha_venta' as fecha_venta,
  pl.extra_data->>'forma_pago' as forma_pago,
  pl.extra_data->>'notion_url' as notion_url
FROM project_lots pl
LEFT JOIN projects p ON p.id = pl.project_id
ORDER BY p.name, pl.lot_number;
