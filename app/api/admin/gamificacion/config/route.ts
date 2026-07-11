export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')

    if (!empresaId) {
      return NextResponse.json({ success: false, error: 'empresa_id requerido' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: initialConfig, error } = await supabase
      .from('gamificacion_config')
      .select('*')
      .eq('empresa_id', empresaId)
      .maybeSingle()

    let config = initialConfig

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    if (!config) {
      const { data: nuevo, error: insertErr } = await supabase
        .from('gamificacion_config')
        .insert({ empresa_id: empresaId })
        .select('*')
        .single()

      if (insertErr) {
        return NextResponse.json({ success: false, error: insertErr.message }, { status: 400 })
      }
      config = nuevo
    }

    return NextResponse.json({ success: true, data: config })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { empresa_id, ...updates } = body

    if (!empresa_id) {
      return NextResponse.json({ success: false, error: 'empresa_id requerido' }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: config, error } = await supabase
      .from('gamificacion_config')
      .update({ ...updates, actualizado_en: new Date().toISOString() })
      .eq('empresa_id', empresa_id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: config })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

