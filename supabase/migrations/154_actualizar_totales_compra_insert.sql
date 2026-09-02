-- Migración 154: actualizar totales de compras cuando se inserta directamente como 'completado'
-- El trigger anterior (after_compra_update) solo corría en UPDATE, por lo que las ventas
-- registradas directamente como 'completado' (manuales/checkout) no sumaban en profiles.

CREATE OR REPLACE FUNCTION after_compra_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completado' AND NEW.user_id IS NOT NULL THEN
        UPDATE profiles
        SET ha_comprado = true,
            total_compras = total_compras + 1,
            total_gastado_usd = total_gastado_usd + COALESCE(NEW.monto_usd, 0)
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_compra_insert ON compras;
CREATE TRIGGER trigger_compra_insert
AFTER INSERT ON compras
FOR EACH ROW EXECUTE FUNCTION after_compra_insert();

UPDATE profiles p
SET total_compras = sub.total_compras,
    total_gastado_usd = sub.total_gastado,
    ha_comprado = sub.total_compras > 0
FROM (
    SELECT user_id,
           count(*) AS total_compras,
           sum(COALESCE(monto_usd, 0)) AS total_gastado
    FROM compras
    WHERE estado = 'completado' AND user_id IS NOT NULL
    GROUP BY user_id
) sub
WHERE p.id = sub.user_id;
