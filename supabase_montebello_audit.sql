-- ==========================================
-- MONTEBELLO MASTER RECONCILIATION SCHEMA
-- ==========================================

-- Asegurar que la tabla principal tiene todos los campos de analítica
ALTER TABLE contract_reconciliation 
ADD COLUMN IF NOT EXISTS total_expected_installments NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_actual_installments_paid NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS installments_debt NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_on_deed NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_installments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_installments_total NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price_venta NUMERIC(15, 2) DEFAULT 0;

-- Tabla para el desglose de recibos detectados masivamente
CREATE TABLE IF NOT EXISTS contract_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contract_reconciliation(id) ON DELETE CASCADE,
    file_name TEXT,
    amount NUMERIC(15, 2),
    date DATE,
    receipt_type TEXT, -- 'cuota', 'inicial', 'refuerzo'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
