import { NextRequest, NextResponse } from 'next/server'
import { supabase as sharedSupabase } from '@/lib/supabase/server'

function getSupabase() {
  return sharedSupabase
}

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise
  try {
    const supabase = getSupabase()
    const userId = params.id

    // 1. Cursos matriculados (equipo_cursos)
    const { data: equipoCursos } = await supabase
      .from('equipo_cursos')
      .select(`
        id, curso_id, progreso, estado, nota_final,
        lecciones_completadas, intentos, max_intentos,
        asignado_en, completado_en,
        curso:cursos(id, nombre, imagen_principal, modulos, slug)
      `)
      .eq('user_id', userId)

    // 2. Progreso real desde curso_progreso (academia)
    const { data: cursoProgreso } = await supabase
      .from('curso_progreso')
      .select('curso_id, progreso, actualizado_en')
      .eq('user_id', userId)

    // 3. Intentos de examen y bloqueos
    const { data: intentos } = await supabase
      .from('certificado_intentos')
      .select('curso_id, ciclo, intento_en_ciclo, bloqueado, puntos_otorgados, creado_en')
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })

    // 4. Cursos comprados en tienda (no matriculados)
    const { data: comprasUser } = await supabase
      .from('compras')
      .select('id')
      .eq('user_id', userId)
      .eq('estado', 'completado')

    let cursosComprados: any[] = []
    if (comprasUser?.length) {
      const compraIds = comprasUser.map(c => c.id)
      const { data: items } = await supabase
        .from('compra_items')
        .select('producto_id')
        .in('compra_id', compraIds)

      const productoIds = items?.map(i => i.producto_id).filter(Boolean) || []
      if (productoIds.length) {
        const { data: linked } = await supabase
          .from('productos')
          .select('curso_id')
          .in('id', productoIds)
          .not('curso_id', 'is', null)

        const cursoIds = linked?.map(p => p.curso_id).filter(Boolean) || []
        if (cursoIds.length) {
          const enrolledIds = new Set((equipoCursos || []).map(e => e.curso_id))
          const newIds = cursoIds.filter(id => !enrolledIds.has(id))
          if (newIds.length) {
            const { data: cursos } = await supabase
              .from('cursos')
              .select('id, nombre, imagen_principal, modulos, slug')
              .in('id', newIds)
            cursosComprados = cursos || []
          }
        }
      }
    }

    // 5. Certificados
    const { data: certificados } = await supabase
      .from('certificados')
      .select('id, nombre, fecha_emision, codigo_verificacion')
      .eq('user_id', userId)
      .order('fecha_emision', { ascending: false })

    // Construir mapa de progreso real
    const progresoMap = new Map()
    if (cursoProgreso) {
      for (const p of cursoProgreso) {
        progresoMap.set(p.curso_id, p)
      }
    }

    // Construir mapa de intentos por curso
    const intentosPorCurso = new Map<string, any[]>()
    if (intentos) {
      for (const i of intentos) {
        if (!i.curso_id) continue
        const arr = intentosPorCurso.get(i.curso_id) || []
        arr.push(i)
        intentosPorCurso.set(i.curso_id, arr)
      }
    }

    // Mapear cursos matriculados
    const progress = (equipoCursos || []).map((ec: any) => {
      const curso = ec.curso
      const modulos = curso?.modulos as any[] || []
      const totalLessons = modulos.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0)
      const realProgress = progresoMap.get(ec.curso_id)
      const actualProgress = Math.max(ec.progreso || 0, realProgress?.progreso || 0)
      const cursoIntentos = intentosPorCurso.get(ec.curso_id) || []
      const bloqueados = cursoIntentos.filter(i => i.bloqueado).length
      const intentosTotal = cursoIntentos.length

      let examStatus: string = 'open'
      if (ec.estado === 'completado') {
        examStatus = 'passed'
      } else if (bloqueados > 0) {
        examStatus = 'failed_blocked'
      }

      return {
        id: ec.id,
        courseId: ec.curso_id,
        course: curso?.nombre || 'Curso',
        slug: curso?.slug || '',
        imagen: curso?.imagen_principal || null,
        progress: actualProgress,
        grade: ec.nota_final,
        leccionesCompletadas: ec.lecciones_completadas?.length || 0,
        totalLecciones: totalLessons,
        attempts: intentosTotal,
        maxAttempts: ec.max_intentos || 3,
        examStatus,
        ultimoAcceso: realProgress?.actualizado_en || ec.completado_en || ec.asignado_en,
        matriculado: true,
      }
    })

    // Mapear cursos comprados no matriculados
    for (const c of cursosComprados) {
      const modulos = c.modulos as any[] || []
      const totalLessons = modulos.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0)
      const realProgress = progresoMap.get(c.id)

      progress.push({
        id: `comprado-${c.id}`,
        courseId: c.id,
        course: c.nombre || 'Curso',
        slug: c.slug || '',
        imagen: c.imagen_principal || null,
        progress: realProgress?.progreso || 0,
        grade: null,
        leccionesCompletadas: 0,
        totalLecciones: totalLessons,
        attempts: 0,
        maxAttempts: 3,
        examStatus: 'open',
        ultimoAcceso: realProgress?.actualizado_en || null,
        matriculado: false,
      })
    }

    // Cursos con progreso en curso_progreso pero sin matrícula ni compra (academia pública)
    const cursosMatriculadosIds = new Set((equipoCursos || []).map(e => e.curso_id))
    const cursosCompradosIds = new Set(cursosComprados.map(c => c.id))
    const cursosConProgresoIds = new Set((cursoProgreso || []).map(p => p.curso_id))

    const cursosHuerfanosIds = [...cursosConProgresoIds].filter(
      id => !cursosMatriculadosIds.has(id) && !cursosCompradosIds.has(id)
    )

    if (cursosHuerfanosIds.length) {
      const { data: huerfanos } = await supabase
        .from('cursos')
        .select('id, nombre, imagen_principal, modulos, slug')
        .in('id', cursosHuerfanosIds)
      if (huerfanos) {
        for (const h of huerfanos) {
          const modulos = h.modulos as any[] || []
          const totalLessons = modulos.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0)
          const p = cursoProgreso?.find(cp => cp.curso_id === h.id)
          progress.push({
            id: `publico-${h.id}`,
            courseId: h.id,
            course: h.nombre || 'Curso',
            slug: h.slug || '',
            imagen: h.imagen_principal || null,
            progress: p?.progreso || 0,
            grade: null,
            leccionesCompletadas: 0,
            totalLecciones: totalLessons,
            attempts: 0,
            maxAttempts: 3,
            examStatus: 'open',
            ultimoAcceso: p?.actualizado_en || null,
            matriculado: false,
          })
        }
      }
    }

    const certs = (certificados || []).map((c: any) => ({
      id: c.id,
      name: c.nombre,
      date: c.fecha_emision,
      codigo: c.codigo_verificacion,
    }))

    return NextResponse.json({ success: true, data: { progress, certificates: certs } })
  } catch (err: any) {
    return NextResponse.json({ success: false, data: { progress: [], certificates: [] }, error: err.message }, { status: 500 })
  }
}
