import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { NextRequest } from 'next/server'

/**
 * Obtiene una API key buscando primero la versión personal del usuario,
 * y si no existe, usa la versión global de la empresa.
 * 
 * Orden de búsqueda:
 * 1. key_name + user_id (personal)
 * 2. key_name + is_global = true (global de empresa)
 * 3. null si no existe
 */
export async function getApiKey(
  supabase: ReturnType<typeof createClient>,
  keyName: string,
  userId: string,
  empresaId: string
): Promise<string | null> {
  // 1. Buscar key personal del usuario
  const { data: personal } = await supabase
    .from('api_keys')
    .select('key_value')
    .eq('key_name', keyName)
    .eq('empresa_id', empresaId)
    .eq('user_id', userId)
    .eq('is_global', false)
    .maybeSingle()

  if (personal?.key_value) {
    return decryptApiKey(personal.key_value)
  }

  // 2. Fallback: buscar key global de la empresa
  const { data: global } = await supabase
    .from('api_keys')
    .select('key_value')
    .eq('key_name', keyName)
    .eq('empresa_id', empresaId)
    .eq('is_global', true)
    .maybeSingle()

  if (global?.key_value) {
    return decryptApiKey(global.key_value)
  }

  return null
}

/**
 * Obtiene múltiples API keys en batch con el mismo fallback personal → global.
 * Retorna un Record donde cada key tiene su valor o null.
 */
export async function getApiKeys(
  supabase: ReturnType<typeof createClient>,
  keyNames: string[],
  userId: string,
  empresaId: string
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {}

  // Buscar personales
  const { data: personals } = await supabase
    .from('api_keys')
    .select('key_name, key_value')
    .eq('empresa_id', empresaId)
    .eq('user_id', userId)
    .eq('is_global', false)
    .in('key_name', keyNames)

  const personalMap = new Map(
    (personals || []).map((p: any) => [p.key_name, decryptApiKey(p.key_value)])
  )

  // Buscar globales para las que no tienen personal
  const missingGlobals = keyNames.filter(k => !personalMap.has(k))
  
  if (missingGlobals.length > 0) {
    const { data: globals } = await supabase
      .from('api_keys')
      .select('key_name, key_value')
      .eq('empresa_id', empresaId)
      .eq('is_global', true)
      .in('key_name', missingGlobals)

    const globalMap = new Map(
      (globals || []).map((g: any) => [g.key_name, decryptApiKey(g.key_value)])
    )

    keyNames.forEach(name => {
      result[name] = personalMap.get(name) || globalMap.get(name) || null
    })
  } else {
    keyNames.forEach(name => {
      result[name] = personalMap.get(name) || null
    })
  }

  return result
}

/**
 * Helper para API routes: obtiene auth + empresaId y luego la key.
 * Uso: const key = await getApiKeyForRequest(request, 'gemini_key')
 */
export async function getApiKeyForRequest(
  request: NextRequest,
  keyName: string
): Promise<string | null> {
  const auth = await getAuthUser(request)
  if (!auth) return null

  const supabase = createClient()
  return getApiKey(supabase, keyName, auth.userId, auth.empresaId)
}
