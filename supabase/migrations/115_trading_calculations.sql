-- Trading Risk Management Calculator History
CREATE TABLE IF NOT EXISTS trading_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    capital DECIMAL(14,2) NOT NULL,
    entry_price DECIMAL(14,6) NOT NULL,
    stop_loss DECIMAL(14,6) NOT NULL,
    take_profit DECIMAL(14,6),
    riesgo_pct DECIMAL(8,2) NOT NULL,
    riesgo_usd DECIMAL(14,2) NOT NULL,
    distancia_sl_pct DECIMAL(8,4) NOT NULL,
    tamano_posicion DECIMAL(18,6) NOT NULL,
    lotes DECIMAL(14,4) NOT NULL,
    tamano_lote INTEGER DEFAULT 100000,
    valor_posicion DECIMAL(14,2) NOT NULL,
    apalancamiento DECIMAL(8,2),
    ratio_rr DECIMAL(8,2),
    distancia_tp_pct DECIMAL(8,4),
    ganancia_potencial DECIMAL(14,2),
    nota TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trading_calculations_user ON trading_calculations(user_id, creado_en DESC);

ALTER TABLE trading_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calculations" ON trading_calculations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" ON trading_calculations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations" ON trading_calculations
    FOR DELETE USING (auth.uid() = user_id);
