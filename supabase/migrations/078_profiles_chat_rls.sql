-- Migration: Add cross-profile read policy for chat contacts
-- Allows authenticated users to read profiles from their same empresa

-- Enable RLS on profiles (safe if already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing chat-related profile policies if they exist (idempotent)
DROP POLICY IF EXISTS "profiles_select_same_empresa" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_estado_chat" ON profiles;

-- Policy: Allow authenticated users to read profiles from their same empresa
-- Uses user_empresa_id() helper (SECURITY DEFINER) to avoid infinite recursion
CREATE POLICY "profiles_select_same_empresa"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR empresa_id = user_empresa_id()
  );

-- Policy: Allow users to update their own estado_chat for presence
CREATE POLICY "profiles_update_own_estado_chat"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Ensure estado_chat column exists (safe if already added in 076)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'estado_chat'
  ) THEN
    ALTER TABLE profiles ADD COLUMN estado_chat text DEFAULT 'online' CHECK (estado_chat IN ('online', 'ausente', 'ocupado', 'offline'));
  END IF;
END
$$;

SELECT 'Profiles chat RLS policies created' AS status;
