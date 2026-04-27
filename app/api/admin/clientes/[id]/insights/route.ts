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
