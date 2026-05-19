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
    const limit = parseInt(searchParams.get('limit') || '200')
    const stats = searchParams.get('stats') === '1'

    if (stats) {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      // Total hoy
      const { count: totalHoy } = await supabase
        .from('security_logs')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .gte('created_at', hoy.toISOString())

      // Países únicos hoy
      const { data: paisesData } = await supabase
        .from('security_logs')
        .select('pais')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .gte('created_at', hoy.toISOString())

      const paisesUnicos = new Set(paisesData?.map(p => p.pais) || [])

      // IPs únicas hoy
      const { data: ipsData } = await supabase
        .from('security_logs')
        .select('ip')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .gte('created_at', hoy.toISOString())

      const ipsUnicas = new Set(ipsData?.map(p => p.ip) || [])

      // Por hora (últimas 24h)
      const ayer = new Date()
      ayer.setDate(ayer.getDate() - 1)
      const { data: porHoraData } = await supabase
        .from('security_logs')
        .select('created_at')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .gte('created_at', ayer.toISOString())
        .order('created_at', { ascending: true })

      const porHora: Record<string, number> = {}
      let picoHora: { hora: number; count: number } | null = null
      if (porHoraData) {
        for (const log of porHoraData) {
          const h = new Date(log.created_at).getHours()
          const key = `${h}h`
          porHora[key] = (porHora[key] || 0) + 1
          if (!picoHora || porHora[key] > picoHora.count) {
            picoHora = { hora: h, count: porHora[key] }
          }
        }
      }

      // Top países
      const { data: topPaises } = await supabase
        .from('security_logs')
        .select('pais')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .gte('created_at', hoy.toISOString())
        .limit(1000)

      const paisCounts: Record<string, number> = {}
      if (topPaises) {
        for (const log of topPaises) {
          paisCounts[log.pais] = (paisCounts[log.pais] || 0) + 1
        }
      }

      // Top rutas
      const { data: topRutas } = await supabase
        .from('security_logs')
        .select('ruta')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .gte('created_at', hoy.toISOString())
        .limit(1000)

      const rutaCounts: Record<string, number> = {}
      if (topRutas) {
        for (const log of topRutas) {
          rutaCounts[log.ruta] = (rutaCounts[log.ruta] || 0) + 1
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          total_hoy: totalHoy || 0,
          paises_unicos: paisesUnicos.size,
          ips_unicas: ipsUnicas.size,
          pico_hora: picoHora,
          por_hora: Object.entries(porHora).map(([hora, count]) => ({ hora, count })),
          top_paises: Object.entries(paisCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([pais, count]) => ({ pais, count })),
          top_rutas: Object.entries(rutaCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([ruta, count]) => ({ ruta, count })),
        }
      })
    }

    // Lista de logs
    let query = supabase
      .from('security_logs')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (motivo) query = query.eq('motivo', motivo)
    if (pais) query = query.eq('pais', pais.toUpperCase())

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
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

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Logs eliminados' })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}
