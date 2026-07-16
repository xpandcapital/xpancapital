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
      .from('profiles')
      .select('id, nombre, apellido, email, creado_en, total_compras')
      .eq('referido_por', userId)
      .order('creado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ success: true, data: [], error: error.message })
    }

    const referrals = (data || []).map((r: any) => ({
      id: r.id,
      name: `${r.nombre || ''} ${r.apellido || ''}`.trim() || 'Unknown',
      avatarColor: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      lastPurchase: r.total_compras > 0 ? { name: 'Purchase', price: 0 } : null
    }))

    return NextResponse.json({ success: true, data: referrals })
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [], error: err.message }, { status: 500 })
  }
}
