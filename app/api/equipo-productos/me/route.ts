import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'email es requerido' }, { status: 400 })
    }

    const { data: advisor, error: advisorError } = await supabase
      .from('advisors')
      .select('id')
      .eq('email', email)
      .single()

    if (advisorError || !advisor) {
      return NextResponse.json({ success: true, data: [], isTeamMember: false })
    }

    const { data, error } = await supabase
      .from('equipo_productos')
      .select('*, productos:id_producto(nombre, precio_usd, imagen_principal)')
      .eq('advisor_id', advisor.id)
      .order('asignado_en', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data, isTeamMember: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}