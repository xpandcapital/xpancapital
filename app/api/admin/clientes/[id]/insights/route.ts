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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const insights = (data || []).map(i => ({
      id: i.id,
      type: i.tipo,
      title: i.titulo,
      description: i.descripcion,
      metrics: i.metricas,
      recommendations: i.recomendaciones,
      score: i.score,
      date: i.created_at
    }))

    return NextResponse.json({ success: true, data: insights })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
