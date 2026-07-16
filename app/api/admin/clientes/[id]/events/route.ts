import { NextRequest, NextResponse } from 'next/server'
import { supabase as sharedSupabase } from '@/lib/supabase/server'

function getSupabase() {
  return sharedSupabase
}

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise
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
