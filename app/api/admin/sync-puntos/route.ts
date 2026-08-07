import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar todos los cursos completados (progreso >= 100) que aún no tengan puntos
    const { data: completados, error } = await supabase
      .from('curso_progreso')
      .select('user_id, curso_id, progreso')
      .gte('progreso', 100)

    if (error || !completados?.length) {
      return NextResponse.json({ success: true, mensaje: 'Sin cursos completados para sincronizar', otorgados: 0 })
    }

    // Precargar niveles por empresa (mismo dato para todos = evitar N+1)
    const nivelesCache = new Map<string, any[]>()
    const cursoCache = new Map<string, any>()
    const profileCache = new Map<string, any>()

    let otorgados = 0
    for (const cp of completados) {
      let curso = cursoCache.get(cp.curso_id)
      if (!curso) {
        const { data: c } = await supabase
          .from('cursos')
          .select('empresa_id, puntos_por_leccion, puntos_completado')
          .eq('id', cp.curso_id)
          .single()
        if (c) { curso = c; cursoCache.set(cp.curso_id, c) }
      }

      if (!curso?.empresa_id) continue

      let profile = profileCache.get(cp.user_id)
      if (!profile) {
        const { data: p } = await supabase
          .from('profiles')
          .select('puntos, puntos_cursos, puntos_nivel')
          .eq('id', cp.user_id)
          .single()
        if (p) { profile = p; profileCache.set(cp.user_id, p) }
      }

      if (!profile) continue

      const puntosLeccion = curso.puntos_por_leccion || 50
      const puntosCurso = curso.puntos_completado || 500
      const pts = puntosLeccion + puntosCurso

      const nuevosPuntos = (profile.puntos || 0) + pts
      const nuevosPuntosCurso = (profile.puntos_cursos || 0) + pts

      // Calcular nivel (cacheado por empresa_id)
      let niveles = nivelesCache.get(curso.empresa_id)
      if (!niveles) {
        const { data: niv } = await supabase
          .from('gamificacion_niveles')
          .select('*')
          .eq('empresa_id', curso.empresa_id)
          .order('orden', { ascending: true })
        niveles = niv || []
        nivelesCache.set(curso.empresa_id, niveles)
      }

      let nuevoNivel = profile.puntos_nivel || 1
      if (niveles) {
        for (let i = niveles.length - 1; i >= 0; i--) {
          if (nuevosPuntosCurso >= (niveles[i].puntos_requeridos || 0)) {
            nuevoNivel = niveles[i].nivel
            break
          }
        }
      }

      await supabase.from('profiles').update({
        puntos: nuevosPuntos,
        puntos_cursos: nuevosPuntosCurso,
        puntos_nivel: nuevoNivel,
        blis_coins: nuevosPuntosCurso,
        ultima_actividad: new Date().toISOString().slice(0, 10),
        actualizado_en: new Date().toISOString(),
      }).eq('id', cp.user_id)

      otorgados++
    }

    return NextResponse.json({ success: true, otorgados, mensaje: `Puntos otorgados a ${otorgados} cursos completados` })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
