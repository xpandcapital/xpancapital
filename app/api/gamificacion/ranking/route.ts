import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')
    const userId = searchParams.get('user_id')
    const categoria = searchParams.get('categoria') || 'global'

    if (!empresaId) {
      return NextResponse.json({ success: false, error: 'empresa_id requerido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const ordenColumna = categoria === 'cursos' ? 'puntos_cursos'
      : categoria === 'comunidad' ? 'puntos_comunidad'
      : categoria === 'blog' ? 'puntos_blog'
      : 'puntos'

    const { data: ranking } = await supabase
      .from('profiles')
      .select(`id, nombre, apellido, avatar_url, puntos, puntos_nivel, puntos_cursos, puntos_comunidad, puntos_blog`)
      .eq('empresa_id', empresaId)
      .not('rol', 'in', '("superadmin","admin","editor","empleado")')
      .gt(ordenColumna, 0)
      .order('puntos_nivel', { ascending: false })
      .order(ordenColumna, { ascending: false })
      .limit(100)

    const { data: niveles } = await supabase
      .from('gamificacion_niveles')
      .select('nivel, nombre, color')
      .eq('empresa_id', empresaId)

    const nivelMap = new Map((niveles || []).map(n => [n.nivel, { nombre: n.nombre, color: n.color }]))

    let lastRank = 0
    const fullRanking = (ranking || []).map((entry: any, idx: number, arr: any[]) => {
      const puntos = entry[ordenColumna] || entry.puntos
      const prev = idx > 0 ? arr[idx - 1] : null
      const isTie = prev
        && prev.puntos_nivel === entry.puntos_nivel
        && (prev[ordenColumna] || prev.puntos) === puntos
      const posicion = isTie ? lastRank : idx + 1
      lastRank = posicion
      return {
        posicion,
        user_id: entry.id,
        nombre: entry.nombre || 'Anónimo',
        apellido: entry.apellido,
        avatar_url: entry.avatar_url,
        puntos,
        nivel: entry.puntos_nivel,
        nivelNombre: nivelMap.get(entry.puntos_nivel)?.nombre || `Nivel ${entry.puntos_nivel}`,
        puntos_cursos: entry.puntos_cursos,
        puntos_comunidad: entry.puntos_comunidad,
        puntos_blog: entry.puntos_blog,
      }
    })

    let ownEntry = null
    let vecinos: typeof fullRanking = []

    if (userId) {
      ownEntry = fullRanking.find(r => r.user_id === userId) || null
      if (ownEntry) {
        const pos = ownEntry.posicion
        const start = Math.max(0, pos - 4)
        const end = Math.min(fullRanking.length, pos + 3)
        vecinos = fullRanking.slice(start, end)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        top10: fullRanking.slice(0, 10),
        vecinos,
        own: ownEntry,
        categoria,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
