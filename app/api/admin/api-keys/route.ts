import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encryptApiKey, decryptApiKey, maskKey } from '@/lib/api-crypto'
import { getAuthUser, isAdmin } from '@/lib/supabase/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const unmasked = searchParams.get('unmasked') === 'true'

    // Construir query base
    let query = supabase
      .from('api_keys')
      .select('key_name, key_value, is_global, user_id, created_at, updated_at')
      .eq('empresa_id', auth.empresaId)

    // Filtrar por visibilidad:
    // - Superadmin ve TODO (globales + personales de todos)
    // - Otros usuarios ven globales + sus propias personales
    if (!isAdmin(auth)) {
      query = query.or(`is_global.eq.true,user_id.eq.${auth.userId}`)
    }

    if (service) {
      query = query.ilike('key_name', `${service}%`)
    } else {
      query = query.order('key_name')
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (service) {
      const result = data.reduce((acc: Record<string, string>, row: { key_name: string; key_value: string | null }) => {
        acc[row.key_name] = decryptApiKey(row.key_value || '')
        return acc
      }, {})
      return NextResponse.json({ success: true, keys: result })
    }

    const keys = data.map(row => ({
      key_name: row.key_name,
      key_value: unmasked ? decryptApiKey(row.key_value || '') : maskKey(decryptApiKey(row.key_value || '')),
      has_value: !!(row.key_value && row.key_value.length > 0 && row.key_value !== ''),
      is_global: row.is_global,
      user_id: row.user_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    return NextResponse.json({ success: true, keys })
  } catch (error) {
    console.error('[API Keys] GET error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = createClient()
    const body = await request.json()
    const { key_name, key_value, is_global } = body

    if (!key_name) {
      return NextResponse.json({ error: 'key_name es requerido' }, { status: 400 })
    }

    // Validar permisos para crear/editar globales
    const wantGlobal = is_global === true
    if (wantGlobal && !isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo admin puede crear/editar APIs globales' }, { status: 403 })
    }

    const encryptedValue = encryptApiKey(key_value || '')

    // Verificar si ya existe una key con ese nombre
    const { data: existing } = await supabase
      .from('api_keys')
      .select('id, key_name, is_global, user_id')
      .eq('empresa_id', auth.empresaId)
      .eq('key_name', key_name)
      .maybeSingle()

    // Si existe y es global, solo admin puede editar
    if (existing && existing.is_global && !isAdmin(auth)) {
      return NextResponse.json({ error: 'No puedes editar una API global' }, { status: 403 })
    }

    // Si existe y es personal de otro usuario, no puede editar
    if (existing && !existing.is_global && existing.user_id !== auth.userId) {
      return NextResponse.json({ error: 'No puedes editar una API de otro usuario' }, { status: 403 })
    }

    const rowData = {
      key_name,
      key_value: encryptedValue,
      empresa_id: auth.empresaId,
      user_id: wantGlobal ? null : auth.userId,
      is_global: wantGlobal,
      updated_at: new Date().toISOString(),
    }

    let data, error
    if (existing) {
      const res = await supabase
        .from('api_keys')
        .update(rowData)
        .eq('id', existing.id)
        .select()
        .single()
      data = res.data
      error = res.error
    } else {
      const res = await supabase
        .from('api_keys')
        .insert(rowData)
        .select()
        .single()
      data = res.data
      error = res.error
    }

    if (error) {
      console.error(`[API Keys] POST error for ${key_name}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, key: { key_name: data.key_name, has_value: !!(key_value) } })
  } catch (error) {
    console.error('[API Keys] POST error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = createClient()
    const body = await request.json()
    const { keys } = body as { keys: Record<string, { value: string; is_global?: boolean }> }

    if (!keys || typeof keys !== 'object') {
      return NextResponse.json({ error: 'keys object es requerido' }, { status: 400 })
    }

    let saved = 0
    let errors = 0

    for (const [key_name, config] of Object.entries(keys)) {
      const key_value = config.value || ''
      const wantGlobal = config.is_global === true

      // Validar permisos
      if (wantGlobal && !isAdmin(auth)) {
        errors++
        continue
      }

      const encryptedValue = encryptApiKey(key_value)

      // Verificar existencia y permisos
      const { data: existing } = await supabase
        .from('api_keys')
        .select('id, key_name, is_global, user_id')
        .eq('empresa_id', auth.empresaId)
        .eq('key_name', key_name)
        .maybeSingle()

      if (existing && existing.is_global && !isAdmin(auth)) {
        errors++
        continue
      }

      if (existing && !existing.is_global && existing.user_id !== auth.userId) {
        errors++
        continue
      }

      const rowData = {
        key_name,
        key_value: encryptedValue,
        empresa_id: auth.empresaId,
        user_id: wantGlobal ? null : auth.userId,
        is_global: wantGlobal,
        updated_at: new Date().toISOString(),
      }

      let error = null
      if (existing) {
        // UPDATE existing row
        const { error: updateErr } = await supabase
          .from('api_keys')
          .update(rowData)
          .eq('id', existing.id)
        error = updateErr
      } else {
        // INSERT new row
        const { error: insertErr } = await supabase
          .from('api_keys')
          .insert(rowData)
        error = insertErr
      }

      if (error) {
        console.error(`[API Keys] PUT error for ${key_name}:`, error)
        errors++
      } else {
        saved++
      }
    }

    return NextResponse.json({ success: true, saved, errors })
  } catch (error) {
    console.error('[API Keys] PUT error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const key_name = searchParams.get('key_name')

    if (!key_name) {
      return NextResponse.json({ error: 'key_name es requerido' }, { status: 400 })
    }

    // Verificar existencia y permisos antes de borrar
    const { data: existing } = await supabase
      .from('api_keys')
      .select('is_global, user_id')
      .eq('empresa_id', auth.empresaId)
      .eq('key_name', key_name)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Key no encontrada' }, { status: 404 })
    }

    if (existing.is_global && !isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo admin puede borrar APIs globales' }, { status: 403 })
    }

    if (!existing.is_global && existing.user_id !== auth.userId) {
      return NextResponse.json({ error: 'No puedes borrar una API de otro usuario' }, { status: 403 })
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('key_name', key_name)
      .eq('empresa_id', auth.empresaId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Keys] DELETE error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
