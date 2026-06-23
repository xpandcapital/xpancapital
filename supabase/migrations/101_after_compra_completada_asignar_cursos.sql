-- Migración: 101_after_compra_completada_asignar_cursos (actualizada)
-- Trigger que asigna automáticamente cursos al completarse una compra
-- Cubre: webhooks (Izipay/PayPal), pagos offline verificados, registro manual,
--         checkout, y cualquier actualización directa a compras.estado = 'completado'
-- v2: Resuelve user_id desde email en metadata si compras.user_id es NULL

CREATE OR REPLACE FUNCTION after_compra_completada_asignar_cursos()
RETURNS TRIGGER AS $$
DECLARE
    v_item       RECORD;
    v_email      TEXT;
    v_nombre     TEXT;
    v_advisor_id UUID;
    v_user_id    UUID;
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.estado = 'completado' THEN
        RETURN NEW;
    END IF;

    IF NEW.estado != 'completado' THEN
        RETURN NEW;
    END IF;

    v_email  := lower(trim(NEW.metadata->>'email_cliente'));
    v_nombre := COALESCE(NEW.metadata->>'nombre_cliente', 'Cliente');
    v_user_id := NEW.user_id;

    IF v_email IS NULL OR v_email = '' THEN
        RETURN NEW;
    END IF;

    -- Si compras.user_id es NULL, intentar resolver desde profiles por email
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id
        FROM profiles
        WHERE lower(email) = v_email
        LIMIT 1;

        -- Si se encontró, actualizar la compra con el user_id
        IF v_user_id IS NOT NULL THEN
            UPDATE compras SET user_id = v_user_id WHERE id = NEW.id;
        END IF;
    END IF;

    -- Buscar o crear advisor por email
    SELECT id INTO v_advisor_id
    FROM advisors
    WHERE lower(email) = v_email
    LIMIT 1;

    IF v_advisor_id IS NULL THEN
        INSERT INTO advisors (name, email)
        VALUES (v_nombre, v_email)
        RETURNING id INTO v_advisor_id;
    END IF;

    -- Asignar cada curso vinculado a los productos comprados
    FOR v_item IN
        SELECT ci.producto_id, p.curso_id
        FROM compra_items ci
        JOIN productos p ON p.id = ci.producto_id
        WHERE ci.compra_id = NEW.id
          AND p.curso_id IS NOT NULL
    LOOP
        -- Si ya existe el par (advisor_id, curso_id), actualizar user_id SOLO si el actual es NULL
        -- o si el nuevo tiene valor (nunca sobrescribir un user_id válido con NULL)
        INSERT INTO equipo_cursos (
            advisor_id, curso_id, user_id, estado, lecciones_completadas
        ) VALUES (
            v_advisor_id, v_item.curso_id, v_user_id, 'asignado', ARRAY[]::TEXT[]
        )
        ON CONFLICT (advisor_id, curso_id)
        DO UPDATE SET
            user_id  = COALESCE(EXCLUDED.user_id, equipo_cursos.user_id),
            estado   = 'asignado';
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_compra_completada_insert ON compras;
CREATE TRIGGER trigger_compra_completada_insert
AFTER INSERT ON compras
FOR EACH ROW
EXECUTE FUNCTION after_compra_completada_asignar_cursos();

DROP TRIGGER IF EXISTS trigger_compra_completada_update ON compras;
CREATE TRIGGER trigger_compra_completada_update
AFTER UPDATE ON compras
FOR EACH ROW
EXECUTE FUNCTION after_compra_completada_asignar_cursos();
