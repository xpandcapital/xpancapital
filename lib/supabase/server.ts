import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  _client = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return _client
}

export function createClient() {
  return getClient()
}

function createSupabaseProxy(): SupabaseClient {
  const handler: ProxyHandler<object> = {
    get(_, prop: string) {
      return (getClient() as unknown as Record<string, unknown>)[prop]
    },
  }
  return new Proxy({}, handler) as unknown as SupabaseClient
}

// Lazy singleton - only creates client on first access (safe for build time)
export const supabase = createSupabaseProxy()

export const supabaseAdmin = supabase