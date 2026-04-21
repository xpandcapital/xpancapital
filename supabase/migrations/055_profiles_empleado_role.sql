-- Add empleado role to profiles.rol CHECK constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_rol_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_rol_check CHECK (rol IN ('usuario', 'cliente', 'editor', 'admin', 'superadmin', 'empleado'));