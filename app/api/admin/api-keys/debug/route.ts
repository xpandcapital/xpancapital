import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { getApiKey } from '@/lib/api-keys'
import { createClient } from '@/lib/supabase/server'

/**
 * Endpoint de diagnóstico para API Keys.
 * GET /api/admin/api-keys/debug
 * Muestra: auth, keys en BD, y si getApiKey encuentra algo.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const result: any = {}

    // 1. Auth
    const auth = await getAuthUser(request)
    result.auth = auth ? {
      userId: auth.userId,
      empresaId: auth.empresaId,
      rol: auth.rol,
    } : null

    if (!auth) {
      return NextResponse.json({ success: false, error: 'No autenticado', debug: result }, { status: 401 })
    }

    // 2. Raw query — todas las api_keys (Service Role debería bypassar RLS)
    const { data: rawKeys, error: rawError } = await supabase
      .from('api_keys')
      .select('*')
    
    result.rawKeys = rawKeys || []
    result.rawError = rawError?.message || null

    // 3. Buscar específicamente gemini_key
    const { data: geminiKeys } = await supabase
      .from('api_keys')
      .select('key_name, empresa_id, user_id, is_global, created_at')
      .eq('key_name', 'gemini_key')
    
    result.geminiKeys = geminiKeys || []

    // 4. getApiKey con los params del usuario autenticado
    const apiKey = await getApiKey(supabase, 'gemini_key', auth.userId, auth.empresaId)
    result.apiKeyFound = !!apiKey
    result.apiKeyLength = apiKey ? apiKey.length : 0

    // 5. Columnas de la tabla
    const { data: columns } = await supabase
      .rpc('get_columns', { table_name: 'api_keys' })
      .maybeSingle()
    
    if (!columns) {
      // Intentar obtener columnas vía información de esquema
      const { data: schemaInfo } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'api_keys')
        .eq('table_schema', 'public')
      
      result.tableColumns = schemaInfo?.map((c: any) => c.column_name) || []
    } else {
      result.tableColumns = columns
    }

    return NextResponse.json({ success: true, debug: result })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
