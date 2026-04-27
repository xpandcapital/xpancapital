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
      .from('profiles')
      .select('id, nombre, apellido, email, creado_en, total_compras')
      .eq('referido_por', userId)
      .order('creado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const referrals = (data || []).map(r => ({
      id: r.id,
      name: `${r.nombre || ''} ${r.apellido || ''}`.trim(),
      email: r.email,
      avatarColor: '#' + Math.floor(Math.random()*16777215).toString(16),
      commissionBC: 0,
      commissionCash: 0,
      commissionPercent: 5,
      lastPurchase: r.total_compras > 0 ? r.creado_en : null,
      joinedDate: r.creado_en
    }))

    return NextResponse.json({ success: true, data: referrals })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
