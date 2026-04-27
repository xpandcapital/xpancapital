import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const userId = params.id

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const history = (data || []).map(h => ({
      id: h.id,
      action: h.accion,
      detail: h.detalle,
      module: h.modulo,
      date: h.creado_en
    }))

    return NextResponse.json({ success: true, data: history })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
