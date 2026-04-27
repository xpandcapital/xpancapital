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
      .from('auditoria_log')
      .select('id, accion, detalle, modulo, tabla, creado_en')
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ success: true, data: [], error: error.message })
    }

    const history = (data || []).map((h: any) => ({
      id: h.id,
      action: h.accion || 'Unknown',
      details: h.detalle || '',
      user: h.tabla || '',
      date: h.creado_en
    }))

    return NextResponse.json({ success: true, data: history })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
