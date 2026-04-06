-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX: CORREGIR POLÍTICAS RLS
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- Desactivar RLS temporalmente
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE compras DISABLE ROW LEVEL SECURITY;
ALTER TABLE boveda_transacciones DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Superadmins ven todas las empresas" ON empresas;
DROP POLICY IF EXISTS "Usuarios ven su empresa asignada" ON empresas;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON profiles;
DROP POLICY IF EXISTS "Admins pueden actualizar perfiles de su empresa" ON profiles;
DROP POLICY IF EXISTS "Posts publicados son visibles" ON blog_posts;
DROP POLICY IF EXISTS "Autores pueden crear posts" ON blog_posts;
DROP POLICY IF EXISTS "Productos activos son visibles" ON productos;
DROP POLICY IF EXISTS "Usuarios ven sus propias compras" ON compras;
DROP POLICY IF EXISTS "Usuarios ven sus propias transacciones" ON boveda_transacciones;

-- Activar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE boveda_transacciones ENABLE ROW LEVEL SECURITY;

-- Políticas para EMPRESAS
CREATE POLICY "Empresas visibles para todos" ON empresas
    FOR SELECT USING (activo = true);

-- Políticas para PROFILES
CREATE POLICY "Usuarios ven su propio perfil" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su propio perfil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden crear su perfil" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para BLOG_POSTS
CREATE POLICY "Posts publicados visibles" ON blog_posts
    FOR SELECT USING (estado = 'publicado');

-- Políticas para PRODUCTOS
CREATE POLICY "Productos activos visibles" ON productos
    FOR SELECT USING (activo = true);

-- Políticas para COMPRAS
CREATE POLICY "Usuarios ven sus compras" ON compras
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear compras" ON compras
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para BOVEDA_TRANSACCIONES
CREATE POLICY "Usuarios ven sus transacciones" ON boveda_transacciones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema crea transacciones" ON boveda_transacciones
    FOR INSERT WITH CHECK (true);

SELECT 'RLS Fix completado correctamente' as estado;