import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createClient()

    const { data, error } = await supabase
      .from('calendarios')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 })
    }

    const url = new URL(request.url)
    const campanaIdParam = url.searchParams.get('campana_id')
    const userIdParam = url.searchParams.get('user_id')

    if (data.audiencia_tipo === 'leads_campana') {
      if (!campanaIdParam || campanaIdParam !== data.campana_id) {
        return NextResponse.json({ error: 'Calendario no disponible' }, { status: 403 })
      }
    }

    if (data.audiencia_tipo === 'especifico') {
      if (!userIdParam || !data.audiencia_ids?.includes(userIdParam)) {
        return NextResponse.json({ error: 'Calendario no disponible' }, { status: 403 })
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}