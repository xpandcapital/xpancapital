export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const noLeidas = searchParams.get('no_leidas') === '1'

    let query = supabase
      .from('security_alerts')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (noLeidas) {
      query = query.eq('leida', false)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, leida } = body

    if (id) {
      const { error } = await supabase
        .from('security_alerts')
        .update({ leida })
        .eq('id', id)
        .eq('empresa_id', DEFAULT_EMPRESA_ID)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
    } else {
      // Marcar todas como leídas
      const { error } = await supabase
        .from('security_alerts')
        .update({ leida: true })
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .eq('leida', false)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('security_alerts')
      .delete()
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Alertas eliminadas' })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

