export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { equipo_curso_id, leccion_id, completado } = body

    if (!equipo_curso_id || !leccion_id) {
      return NextResponse.json({ error: 'equipo_curso_id y leccion_id son requeridos' }, { status: 400 })
    }

    const { data: equipoCurso, error: fetchError } = await supabase
      .from('equipo_cursos')
      .select('id, lecciones_completadas, curso_id, user_id')
      .eq('id', equipo_curso_id)
      .single()

    if (fetchError || !equipoCurso) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
    }

    let rawCompleted = equipoCurso.lecciones_completadas
    if (typeof rawCompleted === 'string') {
      try { rawCompleted = JSON.parse(rawCompleted) } catch { rawCompleted = [] }
    }
    if (!Array.isArray(rawCompleted)) rawCompleted = []
    const completed: string[] = rawCompleted

    let updated: string[]

    if (completado) {
      updated = Array.from(new Set([...completed, leccion_id]))
    } else {
      updated = completed.filter((id: string) => id !== leccion_id)
    }

    const { data: cursoData } = await supabase
      .from('cursos')
      .select('modulos, empresa_id, puntos_por_leccion, puntos_completado')
      .eq('id', equipoCurso.curso_id)
      .single()

    let totalLessons = 0
    if (cursoData?.modulos && Array.isArray(cursoData.modulos)) {
      for (const mod of cursoData.modulos) {
        if (mod.lessons && Array.isArray(mod.lessons)) {
          totalLessons += mod.lessons.length
        }
      }
    }

    const progreso = totalLessons > 0 ? Math.round((updated.length / totalLessons) * 100) : 0
    const estado = progreso >= 100 ? 'completado' : progreso > 0 ? 'en_progreso' : 'asignado'
    const completado_en = estado === 'completado' ? new Date().toISOString() : null

    const { data, error } = await supabase
      .from('equipo_cursos')
      .update({
        lecciones_completadas: updated,
        progreso,
        estado,
        ...(estado === 'completado' ? { nota_final: progreso, completado_en } : {}),
      })
      .eq('id', equipo_curso_id)
      .select()
      .single()

    let cursoInfo = null
    if (data) {
      const { data: c } = await supabase
        .from('cursos')
        .select('nombre, descripcion, precio_usd, imagen_principal, slug, para_equipo, modulos')
        .eq('id', equipoCurso.curso_id)
        .single()
      cursoInfo = c
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Otorgar puntos de gamificación (fire & forget)
    const userId = equipoCurso.user_id
    const empresaId = cursoData?.empresa_id

    if (userId && empresaId && completado) {
      const ptsLeccion = cursoData?.puntos_por_leccion || 50
      fetch(`${supabaseUrl.replace('/rest/v1', '')}/api/gamificacion/otorgar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          empresa_id: empresaId,
          tipo: 'leccion_completada',
          referencia_tipo: 'equipo_cursos',
          referencia_id: equipo_curso_id,
          descripcion: 'Lección completada',
          puntos_override: ptsLeccion,
        }),
      }).catch(err => console.error('[gamificacion] Error otorgando puntos:', err))

      if (estado === 'completado') {
        const ptsCurso = cursoData?.puntos_completado || 500
        fetch(`${supabaseUrl.replace('/rest/v1', '')}/api/gamificacion/otorgar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            empresa_id: empresaId,
            tipo: 'curso_completado',
            referencia_tipo: 'cursos',
            referencia_id: equipoCurso.curso_id,
            descripcion: 'Curso completado',
            puntos_override: ptsCurso,
          }),
        }).catch(err => console.error('[gamificacion] Error otorgando puntos:', err))
      }
    }

    return NextResponse.json({ success: true, data: { ...data, cursos: cursoInfo } })
  } catch (err: any) {
    console.error('[POST /api/equipo-cursos/progress]', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}
