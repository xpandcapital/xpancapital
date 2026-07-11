export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const motivo = searchParams.get('motivo')
    const pais = searchParams.get('pais')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const dias = parseInt(searchParams.get('dias') || '1')
    const stats = searchParams.get('stats') === '1'

    // Ventana unificada: mismas 24h rodantes que el dashboard
    const desde = new Date()
    desde.setDate(desde.getDate() - dias)

    if (stats) {
      const [
        { count: totalPeriodo },
        { data: paisStats },
        { data: ipStats },
        { data: rutaStats },
        { data: horaData },
      ] = await Promise.all([
        supabase.from('security_logs').select('*', { count: 'exact', head: true })
          .eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString()),
        supabase.from('security_logs').select('pais')
          .eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString()).limit(5000),
        supabase.from('security_logs').select('ip')
          .eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString()).limit(5000),
        supabase.from('security_logs').select('ruta')
          .eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString()).limit(5000),
        supabase.from('security_logs').select('created_at')
          .eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString()).order('created_at', { ascending: true }).limit(5000),
      ])

      const paisesUnicos = new Set((paisStats || []).map(p => p.pais))
      const ipsUnicas = new Set((ipStats || []).map(p => p.ip))

      const paisCounts: Record<string, number> = {}
      for (const p of (paisStats || [])) paisCounts[p.pais] = (paisCounts[p.pais] || 0) + 1

      const rutaCounts: Record<string, number> = {}
      for (const r of (rutaStats || [])) rutaCounts[r.ruta] = (rutaCounts[r.ruta] || 0) + 1

      const porHora: Record<string, number> = {}
      let picoHora: { hora: number; count: number } | null = null
      for (const l of (horaData || [])) {
        const h = new Date(l.created_at).getHours()
        const key = `${h}h`
        porHora[key] = (porHora[key] || 0) + 1
        if (!picoHora || porHora[key] > picoHora.count) picoHora = { hora: h, count: porHora[key] }
      }

      return NextResponse.json({
        success: true,
        data: {
          total_bloqueos: totalPeriodo || 0,
          paises_unicos: paisesUnicos.size,
          ips_unicas: ipsUnicas.size,
          pico_hora: picoHora,
          por_hora: Object.entries(porHora).map(([hora, count]) => ({ hora, count })),
          top_paises: Object.entries(paisCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([pais, count]) => ({ pais, count })),
          top_rutas: Object.entries(rutaCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([ruta, count]) => ({ ruta, count })),
        }
      })
    }

    // Lista paginada con filtro de fecha
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('security_logs')
      .select('*', { count: 'exact' })
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .gte('created_at', desde.toISOString())
      .order('created_at', { ascending: false })
      .range(from, to)

    if (motivo) query = query.eq('motivo', motivo)
    if (pais) query = query.eq('pais', pais.toUpperCase())

    const { data, count, error } = await query

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      data,
      total: count || 0,
      page,
      pageSize,
      hasMore: (from + (data?.length || 0)) < (count || 0),
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = getSupabase()
    const { error } = await supabase
      .from('security_logs')
      .delete()
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Logs eliminados' })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

