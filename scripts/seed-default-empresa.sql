-- Insertar empresa por defecto BLIS CORP
-- Ejecutar en Supabase SQL Editor

-- 1. Crear la empresa
INSERT INTO empresas (
  id,
  nombre,
  slug,
  name_legal,
  logo_url,
  color_primario,
  color_secundario,
  color_acento,
  moneda_base,
  idioma,
  zona_horaria,
  activo,
  plan
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'BLIS CORP',
  'blis-corp',
  'BLIS CORP S.A.C.',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200',
  '#B10D24',
  '#000000',
  '#10B981',
  'USD',
  'es',
  'America/Lima',
  true,
  'enterprise'
) ON CONFLICT (id) DO NOTHING;

-- 2. Crear configuración de la empresa
INSERT INTO empresa_config (
  id,
  empresa_id,
  blog_activo,
  tienda_activa,
  academia_activa,
  referidos_activo,
  bliscoins_activo,
  coins_por_lectura,
  segundos_lectura,
  coins_registro,
  coins_referido
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  true,
  true,
  false,
  true,
  true,
  5,
  60,
  100,
  50
) ON CONFLICT (id) DO NOTHING;

-- 3. Crear niveles de cliente por defecto
INSERT INTO niveles_cliente (id, empresa_id, nombre, slug, color, icono, orden, comision_porcentaje) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Bronce', 'bronce', '#CD7F32', 'Award', 1, 5),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Plata', 'plata', '#C0C0C0', 'Award', 2, 10),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Oro', 'oro', '#FFD700', 'Award', 3, 15),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Platino', 'platino', '#E5E4E2', 'Crown', 4, 20)
ON CONFLICT (id) DO NOTHING;

-- 4. Crear categorías de blog por defecto
INSERT INTO blog_categorias (id, empresa_id, nombre, slug) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Inversiones', 'inversiones'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Arquitectura', 'arquitectura'),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', 'Legal', 'legal'),
('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', 'Construcción', 'construccion'),
('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', 'Tips', 'tips'),
('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000001', 'Propietarios', 'propietarios'),
('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000001', 'Curiosidades', 'curiosidades')
ON CONFLICT (id) DO NOTHING;

-- Resultado
SELECT '✅ Empresa BLIS CORP creada exitosamente' as mensaje;
SELECT id, nombre, slug, plan, activo FROM empresas WHERE slug = 'blis-corp';
SELECT * FROM empresa_config WHERE empresa_id = '00000000-0000-0000-0000-000000000001';SELECT id, nombre, slug FROM niveles_cliente WHERE empresa_id = '00000000-0000-0000-0000-000000000001' ORDER BY orden;
SELECT id, nombre, slug FROM blog_categorias WHERE empresa_id = '00000000-0000-0000-0000-000000000001';