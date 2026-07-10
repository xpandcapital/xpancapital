-- Dashboard y admin necesitan leer todos los compra_items
-- La política actual solo deja ver tus propias compras (user_id = auth.uid())
CREATE POLICY "compra_items_select_authenticated"
  ON compra_items FOR SELECT
  USING (auth.role() = 'authenticated');
