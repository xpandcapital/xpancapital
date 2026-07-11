import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'user_id requerido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: profile } = await supabase
      .from('profiles')
      .select('empresa_id, puntos, puntos_nivel, puntos_cursos, puntos_comunidad, puntos_blog, racha_dias, nombre, apellido')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil no encontrado' }, { status: 404 })
    }

    const empresaId = profile.empresa_id

    const { data: niveles } = await supabase
      .from('gamificacion_niveles')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('orden', { ascending: true })

    const nivelActual = niveles?.find((n: any) => n.nivel === profile.puntos_nivel) || niveles?.[0]
    const siguienteNivel = niveles?.find((n: any) => n.nivel === (profile.puntos_nivel + 1))

    const nivelPct = siguienteNivel
      ? siguienteNivel.puntos_requeridos > (nivelActual?.puntos_requeridos ?? 0)
        ? Math.round(
            ((profile.puntos_cursos - (nivelActual?.puntos_requeridos ?? 0)) /
              (siguienteNivel.puntos_requeridos - (nivelActual?.puntos_requeridos ?? 0))) *
              100
          )
        : 100
      : 100

    const { count: rankingTotal } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .gt('puntos_cursos', 0)

    const { data: rankingData } = await supabase
      .from('profiles')
      .select('id, puntos_nivel, puntos_cursos')
      .eq('empresa_id', empresaId)
      .gt('puntos_cursos', 0)
      .order('puntos_nivel', { ascending: false })
      .order('puntos_cursos', { ascending: false })

    let rankingPos: number | null = null
    if (rankingData) {
      const idx = rankingData.findIndex((p: any) => p.id === userId)
      if (idx !== -1) rankingPos = idx + 1
    }

    const { data: logros } = await supabase
      .from('gamificacion_logros_usuarios')
      .select('*, logro:logro_id(id, nombre, descripcion, icono_svg, imagen_url, tipo, puntos_bonus)')
      .eq('user_id', userId)
      .order('desbloqueado_en', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        puntos: profile.puntos,
        puntos_nivel: profile.puntos_nivel,
        puntos_cursos: profile.puntos_cursos,
        puntos_comunidad: profile.puntos_comunidad,
        puntos_blog: profile.puntos_blog,
        nivelActual: profile.puntos_nivel,
        nivelNombre: nivelActual?.nombre || 'Sin rango',
        nivelColor: nivelActual?.color || '#f5e100',
        nivelIcono: nivelActual?.icono_svg,
        nivelImagen: nivelActual?.imagen_url,
        progresoNivelPct: nivelPct,
        puntosParaSiguienteNivel: siguienteNivel
          ? Math.max(0, siguienteNivel.puntos_requeridos - profile.puntos_cursos)
          : 0,
        rachaDias: profile.racha_dias,
        rankingPosicion: rankingPos ?? null,
        rankingTotal: rankingTotal ?? 0,
        logrosDesbloqueados: logros || [],
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

