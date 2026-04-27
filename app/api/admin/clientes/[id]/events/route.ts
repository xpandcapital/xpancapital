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
      .from('client_events')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const events = (data || []).map(e => ({
      id: e.id,
      name: e.nombre,
      description: e.descripcion,
      date: e.fecha,
      accessLink: e.access_link
    }))

    return NextResponse.json({ success: true, data: events })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
