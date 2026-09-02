-- Migración 153: limpiar contenido de auto-publicaciones (producto y blog)
-- Los triggers generaban markdown (**) y copiaban HTML crudo de la descripción del producto.

CREATE OR REPLACE FUNCTION auto_post_producto()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
    v_desc_limpia TEXT;
BEGIN
    IF NEW.activo = true AND NEW.categoria_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM comunidad_posts
            WHERE origen = 'producto' AND origen_id = NEW.id
        ) THEN
            SELECT id INTO v_admin_id FROM profiles
            WHERE empresa_id = NEW.empresa_id AND rol IN ('admin', 'superadmin')
            LIMIT 1;

            IF v_admin_id IS NOT NULL THEN
                v_desc_limpia := btrim(regexp_replace(
                    regexp_replace(COALESCE(NEW.descripcion, ''), '<[^>]*>', '', 'g'),
                    '&[a-zA-Z#0-9]+;', ' ', 'g'
                ));

                INSERT INTO comunidad_posts (
                    empresa_id, autor_id, tipo, contenido, origen, origen_id
                ) VALUES (
                    NEW.empresa_id,
                    v_admin_id,
                    'producto',
                    '🆕 Nuevo producto: ' || NEW.nombre ||
                    CASE WHEN v_desc_limpia <> '' THEN E'\n\n' || v_desc_limpia ELSE '' END,
                    'producto',
                    NEW.id
                );
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auto_post_blog()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    IF NEW.estado = 'publicado' AND (TG_OP = 'INSERT' OR OLD.estado != 'publicado') THEN
        IF NOT EXISTS (
            SELECT 1 FROM comunidad_posts
            WHERE origen = 'blog' AND origen_id = NEW.id
        ) THEN
            SELECT id INTO v_admin_id FROM profiles
            WHERE empresa_id = NEW.empresa_id AND rol = 'admin'
            LIMIT 1;

            INSERT INTO comunidad_posts (
                empresa_id, autor_id, tipo, contenido, origen, origen_id
            ) VALUES (
                NEW.empresa_id,
                COALESCE(NEW.autor_id, v_admin_id),
                'blog',
                '📝 ' || NEW.titulo ||
                CASE WHEN NEW.extracto IS NOT NULL THEN E'\n\n' || NEW.extracto ELSE '' END,
                'blog',
                NEW.id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

UPDATE comunidad_posts
SET contenido = replace(
    btrim(regexp_replace(
        regexp_replace(contenido, '<[^>]*>', '', 'g'),
        '&[a-zA-Z#0-9]+;', ' ', 'g'
    )),
    '**', ''
)
WHERE origen = 'producto';
