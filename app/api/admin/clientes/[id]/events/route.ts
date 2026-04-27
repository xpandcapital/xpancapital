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
      return NextResponse.json({ success: true, data: [], error: error.message })
    }

    const events = (data || []).map((e: any) => ({
      id: e.id,
      name: e.nombre || e.name || 'Unknown',
      description: e.descripcion || e.description || '',
      date: e.fecha || e.date,
      access: e.access_link || e.has_access || false
    }))

    return NextResponse.json({ success: true, data: events })
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [], error: err.message }, { status: 500 })
  }
}
