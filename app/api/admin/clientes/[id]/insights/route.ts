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
      .from('client_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: true, data: [], error: error.message })
    }

    const insights = (data || []).map((i: any) => ({
      type: i.tipo || i.type || 'info',
      label: i.titulo || i.title || 'Insight',
      description: i.descripcion || i.description || ''
    }))

    return NextResponse.json({ success: true, data: insights })
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [], error: err.message }, { status: 500 })
  }
}
