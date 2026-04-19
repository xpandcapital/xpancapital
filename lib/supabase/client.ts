// Browser client para Supabase con @supabase/ssr
// Sincroniza la sesión en cookies automáticamente (compatible con middleware)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}