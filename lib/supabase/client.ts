// Browser client para Supabase con @supabase/ssr
// Sincroniza la sesión en cookies automáticamente (compatible con middleware)
// ⚠️ IMPORTANTE: Debe ser un singleton. createBrowserClient solo se llama UNA vez.
import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let _instance: SupabaseClient | null = null

// Singleton — solo se crea UNA instancia de createBrowserClient en toda la app
// Si se crean múltiples instancias, las cookies se pisan entre sí
export function createClient(): SupabaseClient {
  if (!_instance) {
    _instance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return _instance
}