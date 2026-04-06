-- ==========================================
-- CONTRACTS RECONCILIATION DATABASE SCHEMA
-- ==========================================

-- Tabla principal de contratos
CREATE TABLE IF NOT EXISTS contract_reconciliation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificación del lote
    lot_id TEXT NOT NULL,
    lot_number TEXT,
    
    -- Datos del cliente
    client_name TEXT NOT NULL,
    client_id TEXT,
    promoter_name TEXT,
    
    -- Datos financieros del contrato
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    initial_fee NUMERIC(15, 2) DEFAULT 0,
    monthly_payment NUMERIC(15, 2) DEFAULT 0,
    total_months INTEGER DEFAULT 0,
    
    -- Fechas del contrato original
    original_sign_date DATE,
    monthly_start_date DATE,
    
    -- Contexto de autorización de retención
    retention_authorized BOOLEAN DEFAULT FALSE,
    retention_start_date DATE,
    retention_end_date DATE,
    retention_authorized_notes TEXT,
    
    -- Estado de pagos del cliente
    payment_status TEXT DEFAULT 'normal', -- 'normal', 'partial', 'delinquent'
    
    -- Monto pagado realmente (ingresado manualmente)
    actual_paid_amount NUMERIC(15, 2) DEFAULT 0,
    
    -- Resultados del cálculo
    original_milestone_date DATE,
    milestone_fulfilled BOOLEAN,
    
    original_expected_to_date NUMERIC(15, 2) DEFAULT 0,
    reconciled_expected_to_date NUMERIC(15, 2) DEFAULT 0,
    actual_balance_owed NUMERIC(15, 2) DEFAULT 0,
    
    -- Comunicación generada
    generated_communication TEXT,
    communication_generated_at TIMESTAMPTZ,
    
    -- Estados
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'reconciled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadatos
    created_by TEXT,
    notes TEXT,
    
    -- Archivo del contrato (URL)
    contract_file_url TEXT,
    contract_file_name TEXT
);

-- Historial de cambios
CREATE TABLE IF NOT EXISTS contract_reconciliation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contract_reconciliation(id) ON DELETE CASCADE,
    
    action TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_contracts_lot_id ON contract_reconciliation(lot_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_name ON contract_reconciliation(client_name);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contract_reconciliation(status);
CREATE INDEX IF NOT EXISTS idx_history_contract_id ON contract_reconciliation_history(contract_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_contract_reconciliation_updated_at ON contract_reconciliation;
CREATE TRIGGER update_contract_reconciliation_updated_at
    BEFORE UPDATE ON contract_reconciliation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Ajustar según necesidades
ALTER TABLE contract_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_reconciliation_history ENABLE ROW LEVEL SECURITY;

-- Policies (ejemplo - ajustar según rol)
CREATE POLICY "Allow all access for authenticated users" ON contract_reconciliation
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access for authenticated users" ON contract_reconciliation_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentarios
COMMENT ON TABLE contract_reconciliation IS 'Tabla para reconciliación de contratos de venta de lotes inmobiliarios';
COMMENT ON TABLE contract_reconciliation_history IS 'Historial de cambios en reconciliaciones';
