-- Add permisos_adicionales column to profiles table
-- This column is referenced by useAuth and permission system but was missing from the schema
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permisos_adicionales JSONB DEFAULT '{}';

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';