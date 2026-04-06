-- ==========================================
-- NOTION RECEIPTS SYNC TABLE
-- ==========================================

-- Agregar campo de sync de recibos a projects
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS notion_receipts_database_id TEXT,
  ADD COLUMN IF NOT EXISTS notion_receipts_last_sync TIMESTAMPTZ;

-- Tabla para recibos sincronizados de Notion
CREATE TABLE IF NOT EXISTS notion_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referencias
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES project_lots(id) ON DELETE SET NULL,
    notion_page_id TEXT UNIQUE,
    notion_receipt_id TEXT,
    
    -- Datos del recibo
    lot_number TEXT,
    receipt_number INTEGER,
    amount NUMERIC(15, 2) DEFAULT 0,
    date DATE,
    receipt_type TEXT DEFAULT 'otro' CHECK (receipt_type IN ('cuota', 'inicial', 'refuerzo', 'otro', 'desistido')),
    concept TEXT,
    payment_method TEXT,
    reference TEXT,
    file_url TEXT,
    
    -- Cliente
    client_name TEXT,
    
    -- Desistido
    is_desistido BOOLEAN DEFAULT FALSE,
    
    -- Sincronización
    notion_last_sync TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notion_receipts_lot_id ON notion_receipts(lot_id);
CREATE INDEX IF NOT EXISTS idx_notion_receipts_project_id ON notion_receipts(project_id);
CREATE INDEX IF NOT EXISTS idx_notion_receipts_date ON notion_receipts(date);
CREATE INDEX IF NOT EXISTS idx_notion_receipts_type ON notion_receipts(receipt_type);
CREATE INDEX IF NOT EXISTS idx_notion_receipts_notion_page_id ON notion_receipts(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_notion_receipts_is_desistido ON notion_receipts(is_desistido);

-- RLS
ALTER TABLE notion_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for notion_receipts" ON notion_receipts
    FOR ALL USING (true);

-- Comentarios
COMMENT ON TABLE notion_receipts IS 'Recibos sincronizados desde Notion';
COMMENT ON COLUMN notion_receipts.is_desistido IS 'Indica si el recibo pertenece a un lote desistido';
COMMENT ON COLUMN notion_receipts.receipt_number IS 'Número secuencial del recibo extraído del título (ej: Recibo 17-01 → 1)';