-- ============================================================
-- 098: Arreglar RLS restante + SECURITY DEFINER view
-- ============================================================

-- 1. compras - RLS activado pero sin política SELECT (causa dashboard en 0)
CREATE POLICY "compras_select_authenticated" ON compras FOR SELECT USING (auth.role() = 'authenticated');

-- 2. contract_reconciliation - sin RLS
ALTER TABLE contract_reconciliation ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "contract_reconciliation_select" ON contract_reconciliation FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "contract_reconciliation_insert" ON contract_reconciliation FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "contract_reconciliation_update" ON contract_reconciliation FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "contract_reconciliation_delete" ON contract_reconciliation FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. v_lotes_sync - SECURITY DEFINER sin search_path → recrear con security_invoker
DROP VIEW IF EXISTS v_lotes_sync;
CREATE VIEW v_lotes_sync WITH (security_invoker = true) AS
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

SELECT 'RLS policies + view fixed' AS status;
