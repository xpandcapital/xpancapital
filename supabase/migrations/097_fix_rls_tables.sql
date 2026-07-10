-- ============================================================
-- 097: Arreglar RLS en tablas sin protección
-- ============================================================

-- 1. producto_categorias - RLS policies existen pero RLS no está activado
ALTER TABLE producto_categorias ENABLE ROW LEVEL SECURITY;

-- 2. trading_history - tabla pública sin RLS
ALTER TABLE trading_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trading_history_select" ON trading_history FOR SELECT USING (true);
CREATE POLICY "trading_history_insert" ON trading_history FOR INSERT WITH CHECK (true);
CREATE POLICY "trading_history_update" ON trading_history FOR UPDATE USING (true);

-- 3. trading_open_positions - tabla pública sin RLS
ALTER TABLE trading_open_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trading_open_positions_select" ON trading_open_positions FOR SELECT USING (true);
CREATE POLICY "trading_open_positions_insert" ON trading_open_positions FOR INSERT WITH CHECK (true);
CREATE POLICY "trading_open_positions_update" ON trading_open_positions FOR UPDATE USING (true);
CREATE POLICY "trading_open_positions_delete" ON trading_open_positions FOR DELETE USING (true);

-- 4. trading_global_state - tabla pública sin RLS
ALTER TABLE trading_global_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trading_global_state_select" ON trading_global_state FOR SELECT USING (true);
CREATE POLICY "trading_global_state_insert" ON trading_global_state FOR INSERT WITH CHECK (true);
CREATE POLICY "trading_global_state_update" ON trading_global_state FOR UPDATE USING (true);

SELECT 'RLS fixed on 4 tables' AS status;
