# CONFIGURACIÓN PERSISTENTE - GUÍA DE RESPALDO

## ⚠️ IMPORTANTE: Las configuraciones se guardan en SUPABASE

Tus configuraciones están seguras en la base de datos de Supabase. Si se están perdiendo, verifica lo siguiente:

## Verificación Rápida

Ejecuta este SQL en Supabase Dashboard para verificar que tus configuraciones existen:

```sql
-- Ver configuración de monedas
SELECT * FROM monedas_config WHERE empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

-- Ver configuración del sitio
SELECT * FROM site_config WHERE empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

-- Ver categorías de productos
SELECT * FROM producto_categorias WHERE empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

-- Ver productos
SELECT COUNT(*) as total_productos FROM productos WHERE empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae';
```

## Configuraciones que Deberían Persistir

### 1. Configuración de Monedas (`monedas_config`)
- Moneda base
- Monedas activas
- Margen de seguridad

### 2. Configuración del Sitio (`site_config`)
- Nombre del sitio
- Colores
- Logo
- Footer settings

### 3. Categorías de Productos (`producto_categorias`)
- Nombre
- Slug
- Color
- Orden

### 4. Productos (`productos`)
- Todos los productos creados
- Precios
- Stock
- Imágenes

### 5. Estados de Productos (`producto_estados`)
- Disponible
- Agotado
- Pre-venta
- etc.

## Si las Configuraciones se Pierden

### Posibles Causas:

1. **Alguien ejecutó DROP TABLE o TRUNCATE manualmente**
   - Solución: Restaurar desde backup

2. **Las variables de entorno de Supabase cambiaron**
   - Verificar que `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` sean correctas

3. **Se borró la empresa de la tabla `empresas`**
   - Las configuraciones tienen `ON DELETE CASCADE`
   - Solución: No borrar la empresa

### Script de Respaldo Manual

```sql
-- Crear tabla de respaldo
CREATE TABLE IF NOT EXISTS config_backup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla VARCHAR(50) NOT NULL,
    datos JSONB NOT NULL,
    respaldado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Respaldar configuración de monedas
INSERT INTO config_backup (tabla, datos)
SELECT 'monedas_config', to_jsonb(m.*)
FROM monedas_config m
WHERE empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

-- Respaldar categorías
INSERT INTO config_backup (tabla, datos)
SELECT 'producto_categorias', to_jsonb(c.*)
FROM producto_categorias c
WHERE empresa_id = '6186f014-c8c7-4027-9f08-8acf2bae3eae';

-- Ver respaldos
SELECT * FROM config_backup ORDER BY respaldado_en DESC;
```

## Restaurar desde Respaldo

```sql
-- Restaurar monedas_config
INSERT INTO monedas_config (empresa_id, moneda_base, monedas_activas, margen_seguridad)
SELECT 
    (datos->>'empresa_id')::UUID,
    datos->>'moneda_base',
    ARRAY(SELECT jsonb_array_elements_text(datos->'monedas_activas')),
    (datos->>'margen_seguridad')::DECIMAL
FROM config_backup
WHERE tabla = 'monedas_config'
ORDER BY respaldado_en DESC
LIMIT 1
ON CONFLICT (empresa_id) DO UPDATE SET
    moneda_base = EXCLUDED.moneda_base,
    monedas_activas = EXCLUDED.monedas_activas,
    margen_seguridad = EXCLUDED.margen_seguridad;
```

## Configuraciones por Defecto (Si se pierden todo)

```sql
-- Restaurar configuración de monedas
INSERT INTO monedas_config (empresa_id, moneda_base, monedas_activas, margen_seguridad)
VALUES (
    '6186f014-c8c7-4027-9f08-8acf2bae3eae',
    'PEN',
    ARRAY['PEN', 'USD', 'EUR', 'MXN'],
    0.02
)
ON CONFLICT (empresa_id) DO NOTHING;

-- Restaurar estados de productos
INSERT INTO producto_estados (empresa_id, nombre, slug, color, orden, es_default) VALUES
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Disponible', 'disponible', '#10b981', 0, true),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Bajo Stock', 'bajo-stock', '#f59e0b', 1, false),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Agotado', 'agotado', '#ef4444', 2, false),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Ilimitado', 'ilimitado', '#06b6d4', 3, false),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Pre-venta', 'pre-venta', '#3b82f6', 4, false)
ON CONFLICT (empresa_id, slug) DO NOTHING;

-- Restaurar unidades de medida
INSERT INTO unidades_medida (empresa_id, nombre, abreviatura, tipo, orden) VALUES
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Unidades', 'un.', 'quantity', 0),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Kilogramos', 'kg', 'weight', 1),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Gramos', 'g', 'weight', 2),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Litros', 'L', 'volume', 3),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Mililitros', 'ml', 'volume', 4),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Metros', 'm', 'distance', 5),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Centímetros', 'cm', 'distance', 6),
    ('6186f014-c8c7-4027-9f08-8acf2bae3eae', 'Pares', 'par', 'quantity', 7)
ON CONFLICT (empresa_id, abreviatura) DO NOTHING;
```

## Verificación de Variables de Entorno (Vercel)

Asegúrate de que estas variables estén configuradas en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://srjhrhiesienkofisvnv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhyaGllc2llbmtvZmlzdm52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEwODM4OSwiZXhwIjoyMDg5Njg0Mzg5fQ.OB-MHB9z6sIDxXC_c3yWYdxhVUCFOwa7zcxaYzqlhdY
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyamhyaGllc2llbmtvZmlzdm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDgzODksImV4cCI6MjA4OTY4NDM4OX0.uZ2g5UqJJpT9Xr3K9MibImfgqbYS_3sXBXOXGusCviE
```

## Reportar Problema

Si después de verificar todo sigues perdiendo configuraciones, por favor:

1. Ve a Supabase Dashboard → Logs
2. Busca errores recientes
3. Copia los mensajes de error
4. Envíamelos para investigar

---

**Nota**: Los deploys en Vercel NO deberían afectar los datos en Supabase. Si estás perdiendo configuraciones con cada deploy, hay algo más que está causando el problema.
