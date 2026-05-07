-- ============================================================================
-- 069_fix_rls_security.sql
-- Correccion de politicas RLS inseguras detectadas en auditoria de seguridad.
-- Reemplaza USING (true) y politicas genericas con empresa-scoping por usuario.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. blog_posts
-- Reemplaza USING (true) con empresa-scoping para INSERT/UPDATE/DELETE.
-- SELECT publico: solo posts publicados y visibles.
-- SELECT autenticado: todos los posts de su empresa (incluye borradores).
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "blog_posts_select" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_public_select" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_auth_select" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_auth_insert" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_auth_update" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_auth_delete" ON blog_posts;

CREATE POLICY "blog_posts_public_select" ON blog_posts FOR SELECT
  USING (estado = 'publicado' AND (visibilidad IS NULL OR visibilidad = 'publico'));

CREATE POLICY "blog_posts_auth_select" ON blog_posts FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "blog_posts_auth_insert" ON blog_posts FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "blog_posts_auth_update" ON blog_posts FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "blog_posts_auth_delete" ON blog_posts FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

-- --------------------------------------------------------------------------
-- 2. blog_categorias
-- SELECT permanece publico (necesario para mostrar categorias en front).
-- INSERT/UPDATE/DELETE ahora con empresa-scoping.
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "blog_categorias_insert" ON blog_categorias;
DROP POLICY IF EXISTS "blog_categorias_update" ON blog_categorias;
DROP POLICY IF EXISTS "blog_categorias_delete" ON blog_categorias;
DROP POLICY IF EXISTS "blog_categorias_auth_insert" ON blog_categorias;
DROP POLICY IF EXISTS "blog_categorias_auth_update" ON blog_categorias;
DROP POLICY IF EXISTS "blog_categorias_auth_delete" ON blog_categorias;

CREATE POLICY "blog_categorias_auth_insert" ON blog_categorias FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "blog_categorias_auth_update" ON blog_categorias FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "blog_categorias_auth_delete" ON blog_categorias FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

-- --------------------------------------------------------------------------
-- 3. short_links
-- SELECT permanece publico (necesario para redirecciones).
-- INSERT ahora requiere autenticacion.
-- Nuevo DELETE para usuarios autenticados.
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "short_links_insert" ON short_links;
DROP POLICY IF EXISTS "short_links_auth_insert" ON short_links;
DROP POLICY IF EXISTS "short_links_auth_delete" ON short_links;

CREATE POLICY "short_links_auth_insert" ON short_links FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "short_links_auth_delete" ON short_links FOR DELETE
  USING (auth.role() = 'authenticated');

-- --------------------------------------------------------------------------
-- 4. postulantes
-- Cambia de auth.role()='authenticated' a empresa-scoping por usuario.
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow full access for authenticated users" ON postulantes;
DROP POLICY IF EXISTS "postulantes_select" ON postulantes;
DROP POLICY IF EXISTS "postulantes_insert" ON postulantes;
DROP POLICY IF EXISTS "postulantes_update" ON postulantes;
DROP POLICY IF EXISTS "postulantes_delete" ON postulantes;

CREATE POLICY "postulantes_select" ON postulantes FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "postulantes_insert" ON postulantes FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "postulantes_update" ON postulantes FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "postulantes_delete" ON postulantes FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

-- --------------------------------------------------------------------------
-- 5. leads
-- Sin cambios. INSERT publico (WITH CHECK true) es intencional para
-- formularios web de captura de leads. Las demas operaciones ya estan
-- protegidas con empresa-scoping y verificacion de rol admin en el
-- archivo original 025_leads_table.sql.
-- --------------------------------------------------------------------------

-- ============================================================================
-- NOTA: leads mantiene INSERT WITH CHECK (true) intencionalmente.
-- Los formularios publicos de captura de leads necesitan poder insertar
-- sin autenticacion. Las politicas de SELECT, UPDATE y DELETE ya estan
-- correctamente protegidas con empresa-scoping y verificacion de rol.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 6. email_templates
-- Habilitar RLS (no estaba habilitado) y agregar politicas con
-- empresa-scoping para todas las operaciones.
-- --------------------------------------------------------------------------

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_templates_select" ON email_templates;
DROP POLICY IF EXISTS "email_templates_insert" ON email_templates;
DROP POLICY IF EXISTS "email_templates_update" ON email_templates;
DROP POLICY IF EXISTS "email_templates_delete" ON email_templates;

CREATE POLICY "email_templates_select" ON email_templates FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "email_templates_insert" ON email_templates FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "email_templates_update" ON email_templates FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "email_templates_delete" ON email_templates FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

-- --------------------------------------------------------------------------
-- 7. email_palettes
-- Habilitar RLS (no estaba habilitado) y agregar politicas con
-- empresa-scoping para todas las operaciones.
-- --------------------------------------------------------------------------

ALTER TABLE email_palettes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_palettes_select" ON email_palettes;
DROP POLICY IF EXISTS "email_palettes_insert" ON email_palettes;
DROP POLICY IF EXISTS "email_palettes_update" ON email_palettes;
DROP POLICY IF EXISTS "email_palettes_delete" ON email_palettes;

CREATE POLICY "email_palettes_select" ON email_palettes FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "email_palettes_insert" ON email_palettes FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "email_palettes_update" ON email_palettes FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "email_palettes_delete" ON email_palettes FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

-- --------------------------------------------------------------------------
-- 8. producto_categorias
-- Cambia SELECT publico (USING true) y escritura generica
-- (auth.role()='authenticated') a politicas con empresa-scoping completo.
-- ATENCION: Si categorias se necesitan en paginas publicas (landing,
-- catalogo), usar cliente con service_role key para esas consultas.
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Lectura publica producto_categorias" ON producto_categorias;
DROP POLICY IF EXISTS "Escritura autenticada producto_categorias" ON producto_categorias;
DROP POLICY IF EXISTS "producto_categorias_select" ON producto_categorias;
DROP POLICY IF EXISTS "producto_categorias_insert" ON producto_categorias;
DROP POLICY IF EXISTS "producto_categorias_update" ON producto_categorias;
DROP POLICY IF EXISTS "producto_categorias_delete" ON producto_categorias;

CREATE POLICY "producto_categorias_select" ON producto_categorias FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "producto_categorias_insert" ON producto_categorias FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "producto_categorias_update" ON producto_categorias FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "producto_categorias_delete" ON producto_categorias FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid()));
