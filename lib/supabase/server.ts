// Cliente admin para API routes (Service Role - bypass RLS)
// Usar createClient() para crear instancias con service role
// Usar supabaseAdmin como singleton para conveniencia
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export const supabase = createClient()

// Admin client singleton (service role, bypass RLS) para importar en API routes
export const supabaseAdmin = supabase