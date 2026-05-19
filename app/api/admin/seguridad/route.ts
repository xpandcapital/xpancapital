import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('site_config')
      .select('security_config')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data?.security_config || {} })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { toolId, config } = body

    const { data: existing } = await supabase
      .from('site_config')
      .select('id, security_config')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let securityConfig: Record<string, any> = {}

    if (existing?.security_config && typeof existing.security_config === 'object') {
      securityConfig = existing.security_config as Record<string, unknown>
    }

    if (toolId && config) {
      securityConfig[toolId] = config
    }

    const updateData = {
      security_config: securityConfig,
      actualizado_en: new Date().toISOString()
    }

    let result
    if (existing) {
      const { data: updated, error } = await supabase
        .from('site_config')
        .update(updateData)
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .select('security_config')
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      result = updated
    } else {
      const { data: created, error } = await supabase
        .from('site_config')
        .insert({ ...updateData, empresa_id: DEFAULT_EMPRESA_ID })
        .select('security_config')
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      result = created
    }

    return NextResponse.json({ success: true, data: result?.security_config || {} })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}
