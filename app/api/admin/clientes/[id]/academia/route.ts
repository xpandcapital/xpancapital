import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: clientId } = await params
    const supabase = createClient()

    // Obtener cursos del cliente desde equipo_cursos
    const { data: cursos, error } = await supabase
      .from('equipo_cursos')
      .select('id, curso_id, progreso, estado, nota_final, lecciones_completadas, asignado_en, completado_en, intento_examen, ciclo_examen, intento_aprobado, ciclo_aprobado')
      .eq('user_id', clientId)
      .order('asignado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ success: true, data: { progress: [], certificates: [] } })
    }

    // Obtener nombres y datos de cursos
    const cursoIds = [...new Set((cursos || []).map(c => c.curso_id).filter(Boolean))]
    const { data: cursosData } = await supabase
      .from('cursos')
      .select('id, nombre, slug, imagen_principal, max_intentos, modulos')
      .in('id', cursoIds)

    // Estado del examen en curso_progreso (examen_estado)
    const { data: progresoData } = await supabase
      .from('curso_progreso')
      .select('curso_id, examen_estado, nota_final')
      .eq('user_id', clientId)
      .in('curso_id', cursoIds)

    const cursoMap = new Map((cursosData || []).map(c => [c.id, c]))
    const progresoMap = new Map((progresoData || []).map(p => [p.curso_id, p]))

    const countLecciones = (modulos: any) => {
      if (!Array.isArray(modulos)) return 0
      return modulos.reduce((total: number, m: any) => total + (Array.isArray(m?.lessons) ? m.lessons.length : 0), 0)
    }

    const progress = (cursos || []).map(c => {
      const curso = cursoMap.get(c.curso_id as string)
      const prog = progresoMap.get(c.curso_id as string)
      const maxAttempts = curso?.max_intentos || 3
      const intento = c.intento_examen || 0
      const examEstado = prog?.examen_estado || c.estado
      const nota = c.nota_final ?? prog?.nota_final ?? null

      let examStatus: 'open' | 'failed_blocked' | 'passed' = 'open'
      if (examEstado === 'aprobado' || c.estado === 'completado') {
        examStatus = 'passed'
      } else if (examEstado === 'bloqueado' || c.estado === 'bloqueado' || (intento > 0 && intento >= maxAttempts)) {
        examStatus = 'failed_blocked'
      }

      return {
        id: c.id,
        courseId: c.curso_id || '',
        course: curso?.nombre || 'Curso',
        slug: curso?.slug || '',
        imagen: curso?.imagen_principal || null,
        progress: c.progreso || 0,
        grade: nota,
        leccionesCompletadas: Array.isArray(c.lecciones_completadas) ? c.lecciones_completadas.length : 0,
        totalLecciones: countLecciones(curso?.modulos),
        attempts: intento,
        maxAttempts,
        examStatus,
        ultimoAcceso: c.completado_en || c.asignado_en || null,
        matriculado: true,
      }
    })

    // Certificados (si la tabla existe)
    let certificates: any[] = []
    try {
      const { data: certs } = await supabase
        .from('certificados')
        .select('id, nombre, fecha_emision')
        .eq('user_id', clientId)
        .order('fecha_emision', { ascending: false })
        .limit(10)
      certificates = (certs || []).map(c => ({
        id: c.id,
        name: c.nombre,
        date: c.fecha_emision,
      }))
    } catch {}

    return NextResponse.json({ success: true, data: { progress, certificates } })
  } catch (err: any) {
    return NextResponse.json({ success: true, data: { progress: [], certificates: [] } })
  }
}
