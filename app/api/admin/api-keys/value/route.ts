import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { decryptApiKey } from '@/lib/api-crypto'
import { getAuthUser, isAdmin } from '@/lib/supabase/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const keyName = searchParams.get('key')

    if (!keyName) {
      return NextResponse.json({ error: 'key parameter is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('key_value, is_global, user_id')
      .eq('key_name', keyName)
      .eq('empresa_id', auth.empresaId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Key not found', value: null }, { status: 404 })
    }

    // Verificar visibilidad
    if (!data.is_global && !isAdmin(auth) && data.user_id !== auth.userId) {
      return NextResponse.json({ error: 'No autorizado', value: null }, { status: 403 })
    }

    return NextResponse.json({ value: decryptApiKey(data.key_value) })
  } catch (error) {
    console.error('[API Keys Value] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
