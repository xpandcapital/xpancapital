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
      .select('id, accion, detalle, modulo, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ success: true, data: [], error: error.message })
    }

    const history = (data || []).map((h: any) => ({
      id: h.id,
      action: h.accion || h.action || 'Unknown',
      details: h.detalle || h.detalles || h.details || '',
      user: h.modulo || h.module || '',
      date: h.created_at
    }))

    return NextResponse.json({ success: true, data: history })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
