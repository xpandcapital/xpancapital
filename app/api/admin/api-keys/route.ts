import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { encryptApiKey, decryptApiKey, maskKey } from '@/lib/api-crypto'

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const unmasked = searchParams.get('unmasked') === 'true'

    let query = supabase
      .from('api_keys')
      .select('key_name, key_value, created_at, updated_at')
      .eq('empresa_id', EMPRESA_ID)

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
    const supabase = createClient()
    const body = await request.json()
    const { key_name, key_value } = body

    if (!key_name) {
      return NextResponse.json({ error: 'key_name es requerido' }, { status: 400 })
    }

    const encryptedValue = encryptApiKey(key_value || '')

    const { data, error } = await supabase
      .from('api_keys')
      .upsert({
        key_name,
        key_value: encryptedValue,
        empresa_id: EMPRESA_ID,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key_name,empresa_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, key: { key_name: data.key_name, has_value: !!(key_value) } })
  } catch (error) {
    console.error('[API Keys] POST error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { keys } = body as { keys: Record<string, string> }

    if (!keys || typeof keys !== 'object') {
      return NextResponse.json({ error: 'keys object es requerido' }, { status: 400 })
    }

    let saved = 0
    let errors = 0

    for (const [key_name, key_value] of Object.entries(keys)) {
      const encryptedValue = encryptApiKey(key_value || '')
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          key_name,
          key_value: encryptedValue,
          empresa_id: EMPRESA_ID,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key_name,empresa_id' })

      if (error) errors++
      else saved++
    }

    return NextResponse.json({ success: true, saved, errors })
  } catch (error) {
    console.error('[API Keys] PUT error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const key_name = searchParams.get('key_name')

    if (!key_name) {
      return NextResponse.json({ error: 'key_name es requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('key_name', key_name)
      .eq('empresa_id', EMPRESA_ID)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Keys] DELETE error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
