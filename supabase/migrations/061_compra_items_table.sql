-- Migration: 061_compra_items_table
-- Creates the compra_items table needed for the purchases system

CREATE TABLE IF NOT EXISTS compra_items (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compra_id         UUID REFERENCES compras(id) ON DELETE CASCADE NOT NULL,
    producto_id       UUID REFERENCES productos(id) ON DELETE SET NULL,
    cantidad          INTEGER NOT NULL DEFAULT 1,
    precio_unitario   DECIMAL(10,2) NOT NULL,
    subtotal          DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_compra_items_compra ON compra_items(compra_id);
CREATE INDEX idx_compra_items_producto ON compra_items(producto_id);

-- Enable RLS
ALTER TABLE compra_items ENABLE ROW LEVEL SECURITY;

-- Policies: users can read their own purchase items
CREATE POLICY "Users can view their own purchase items"
    ON compra_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM compras
            WHERE compras.id = compra_items.compra_id
            AND compras.user_id = auth.uid()
        )
    );

-- Service role can do anything (for API operations)
CREATE POLICY "Service role full access to compra_items"
    ON compra_items FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON TABLE compra_items IS 'Line items for purchase orders';