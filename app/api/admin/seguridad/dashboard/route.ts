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
    const dias = parseInt(searchParams.get('dias') || '1')
    const desde = new Date()
    desde.setDate(desde.getDate() - dias)

    // Ayer para tendencia
    const ayerInicio = new Date()
    ayerInicio.setDate(ayerInicio.getDate() - 1)
    ayerInicio.setHours(0, 0, 0, 0)
    const ayerFin = new Date(ayerInicio)
    ayerFin.setHours(23, 59, 59, 999)

    const [
      { count: totalBloqueos },
      { data: logsRecientes },
      { data: paisData },
      { data: rutaData },
      { data: porHora },
      { count: alertasNoLeidas },
      { data: ultimasAlertas },
      { data: siteConfigData },
      { count: totalAyer },
      { count: rateLimitBloqueos },
    ] = await Promise.all([
      supabase.from('security_logs').select('*', { count: 'exact', head: true })
        .eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString()),
      supabase.from('security_logs').select('pais,ruta,metodo,motivo,created_at,ip')
        .eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString())
        .order('created_at', { ascending: false }).limit(1000),
      supabase.from('security_logs').select('pais').eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString()),
      supabase.from('security_logs').select('ruta').eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString()),
      supabase.from('security_logs').select('created_at').eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', desde.toISOString()).order('created_at', { ascending: true }),
      supabase.from('security_alerts').select('*', { count: 'exact', head: true }).eq('empresa_id', DEFAULT_EMPRESA_ID).eq('leida', false),
      supabase.from('security_alerts').select('*').eq('empresa_id', DEFAULT_EMPRESA_ID).order('created_at', { ascending: false }).limit(5),
      supabase.from('site_config').select('security_config').eq('empresa_id', DEFAULT_EMPRESA_ID).single(),
      supabase.from('security_logs').select('*', { count: 'exact', head: true })
        .eq('empresa_id', DEFAULT_EMPRESA_ID).gte('created_at', ayerInicio.toISOString()).lte('created_at', ayerFin.toISOString()),
      supabase.from('security_logs').select('*', { count: 'exact', head: true })
        .eq('empresa_id', DEFAULT_EMPRESA_ID).eq('motivo', 'rate_limit').gte('created_at', desde.toISOString()),
    ])

    // Países únicos
    const paisesUnicos = new Set((paisData || []).map(p => p.pais))

    // Top países
    const paisCounts: Record<string, number> = {}
    for (const p of (paisData || [])) {
      paisCounts[p.pais] = (paisCounts[p.pais] || 0) + 1
    }
    const topPaises = Object.entries(paisCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([pais, count]) => ({ pais, count }))

    // Top rutas
    const rutaCounts: Record<string, number> = {}
    for (const r of (rutaData || [])) {
      rutaCounts[r.ruta] = (rutaCounts[r.ruta] || 0) + 1
    }
    const topRutas = Object.entries(rutaCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ruta, count]) => ({ ruta, count }))

    // Por hora
    const horaCounts: Record<string, number> = {}
    for (const l of (porHora || [])) {
      const h = new Date(l.created_at).getHours()
      horaCounts[`${h}h`] = (horaCounts[`${h}h`] || 0) + 1
    }
    const barrasPorHora = Array.from({ length: 24 }, (_, h) => ({ hora: `${h}h`, count: horaCounts[`${h}h`] || 0 }))

    // Últimos 5 logs
    const ultimosLogs = (logsRecientes || []).slice(0, 10)

    // Herramientas activas
    const sc = siteConfigData?.security_config
    const herramientas = {
      geobloqueo: sc?.geobloqueo?.habilitado === true,
      security_headers: sc?.security_headers?.habilitado === true,
      rate_limiting: sc?.rate_limiting?.habilitado === true,
      bot_protection: sc?.bot_protection?.habilitado === true,
      alerts: sc?.alerts?.habilitado === true,
    }

    // Top IPs
    const ipCounts: Record<string, number> = {}
    for (const l of (logsRecientes || [])) {
      if (l.ip) ipCounts[l.ip] = (ipCounts[l.ip] || 0) + 1
    }
    const topIps = Object.entries(ipCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ip, count]) => ({ ip, count }))

    // Rate limiting stats
    const rlConfig = sc?.rate_limiting
    const rlActivas = rlConfig?.reglas?.filter((r: { habilitado: boolean }) => r.habilitado).length || 0
    const rlTotal = rlConfig?.reglas?.length || 0

    // Security headers grade
    const shConfig = sc?.security_headers
    const shActivos = shConfig?.headers ? Object.values(shConfig.headers as Record<string, { habilitado: boolean }>).filter((h) => h.habilitado).length : 0
    const shTotal = shConfig?.headers ? Object.keys(shConfig.headers).length : 6
    const shGrade = shActivos >= 6 ? 'A+' : shActivos >= 5 ? 'A' : shActivos >= 4 ? 'B' : shActivos >= 3 ? 'C' : 'D'

    return NextResponse.json({
      success: true,
      data: {
        total_bloqueos: totalBloqueos || 0,
        total_ayer: totalAyer || 0,
        paises_unicos: paisesUnicos.size,
        alertas_no_leidas: alertasNoLeidas || 0,
        alertas_criticas: (ultimasAlertas || []).filter((a: { nivel: string; leida: boolean }) => a.nivel === 'critical' && !a.leida).length,
        herramientas_activas: Object.values(herramientas).filter(Boolean).length,
        herramientas,
        rate_limit_bloqueos: rateLimitBloqueos || 0,
        rate_limit_rules: `${rlActivas}/${rlTotal}`,
        sh_grade: shGrade,
        sh_activos: shActivos,
        sh_total: shTotal,
        top_paises: topPaises,
        top_rutas: topRutas,
        top_ips: topIps,
        por_hora: barrasPorHora,
        ultimos_logs: ultimosLogs,
        ultimas_alertas: ultimasAlertas || [],
        logs_recientes: (logsRecientes || []).slice(0, 60),
      }
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}
