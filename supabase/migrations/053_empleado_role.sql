-- Add empleado role to advisors.rol CHECK constraint
ALTER TABLE advisors DROP CONSTRAINT IF EXISTS advisors_rol_check;
ALTER TABLE advisors ADD CONSTRAINT advisors_rol_check CHECK (rol IN ('usuario', 'cliente', 'editor', 'admin', 'superadmin', 'empleado'));

-- Add empleado role to roles table if not exists
INSERT INTO roles (nombre, label, descripcion, permisos, color, orden)
VALUES ('empleado', 'Empleado', 'Empleado interno con acceso limitado', '["ver_productos", "comprar", "ver_historial"]', '#10b981', 6)
ON CONFLICT (nombre) DO NOTHING;