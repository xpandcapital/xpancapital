import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: clientId } = await params
    const supabase = createClient()

    // Obtener cursos del cliente desde equipo_cursos
    const { data: cursos, error } = await supabase
      .from('equipo_cursos')
      .select('id, curso_id, progreso, estado, nota_final, lecciones_completadas, asignado_en, completado_en')
      .eq('user_id', clientId)
      .order('asignado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ success: true, data: { progress: [], certificates: [] } })
    }

    // Obtener nombres de cursos
    const cursoIds = [...new Set((cursos || []).map(c => c.curso_id).filter(Boolean))]
    const { data: cursosData } = await supabase
      .from('cursos')
      .select('id, nombre, slug, imagen_principal')
      .in('id', cursoIds)

    const cursoMap = new Map((cursosData || []).map(c => [c.id, c]))

    const progress = (cursos || []).map(c => {
      const curso = cursoMap.get(c.curso_id as string)
      return {
        id: c.id,
        courseId: c.curso_id || '',
        course: curso?.nombre || 'Curso',
        slug: curso?.slug || '',
        imagen: curso?.imagen_principal || null,
        progress: c.progreso || 0,
        leccionesCompletadas: Array.isArray(c.lecciones_completadas) ? c.lecciones_completadas.length : 0,
        totalLecciones: 0,
        attempts: 0,
        maxAttempts: 3,
        examStatus: 'open' as const,
        ultimoAcceso: c.asignado_en || null,
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
