import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

// Puntos de gamificación según intento y ciclo
function calcularPuntosExamen(puntosBase: number, ciclo: number, intento: number): number {
  // Fórmula: base / (2^ciclo) * multiplicador de intento
  // intento 1: 100%, intento 2: 50%, intento 3: 20%
  const multiplicadorPorIntento: Record<number, number> = { 1: 1.0, 2: 0.5, 3: 0.2 }
  const mult = multiplicadorPorIntento[intento] || 0.05
  const divisorCiclo = Math.pow(2, ciclo)
  return Math.round((puntosBase / divisorCiclo) * mult)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { curso_id, user_id, respuestas, tipo } = body

    if (!curso_id || !user_id || !respuestas?.length) {
      return NextResponse.json({ error: 'curso_id, user_id y respuestas requeridos' }, { status: 400 })
    }

    // Obtener curso con preguntas
    const { data: curso, error: cursoError } = await supabase
      .from('cursos')
      .select('modulos, nota_aprobacion, max_intentos, puntos_certificado, empresa_id')
      .eq('id', curso_id)
      .single()

    if (cursoError || !curso) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
    }

    // Extraer todas las preguntas y sus respuestas correctas
    interface PreguntaCorrecta { id: string; respuesta: string }
    const correctas: PreguntaCorrecta[] = []

    const modulos = Array.isArray(curso.modulos) ? curso.modulos : []
    for (const mod of modulos) {
      // Preguntas del examen del módulo
      if (mod.questions && Array.isArray(mod.questions)) {
        for (const q of mod.questions) {
          if (q?.id && q?.options && Array.isArray(q.options)) {
            const correcta = q.options.find((o: any) => o.isCorrect)
            if (correcta) correctas.push({ id: q.id, respuesta: correcta.id })
          }
        }
      }
      // Preguntas de lecciones tipo quiz
      if (mod.lessons && Array.isArray(mod.lessons)) {
        for (const lec of mod.lessons) {
          if (lec?.questions && Array.isArray(lec.questions)) {
            for (const q of lec.questions) {
              if (q?.id && q?.options && Array.isArray(q.options)) {
                const correcta = q.options.find((o: any) => o.isCorrect)
                if (correcta) correctas.push({ id: q.id, respuesta: correcta.id })
              }
            }
          }
        }
      }
    }

    if (correctas.length === 0) {
      return NextResponse.json({ error: 'No hay preguntas configuradas para este curso' }, { status: 400 })
    }

    // Calificar
    let aciertos = 0
    const mapaCorrectas = new Map(correctas.map(c => [c.id, c.respuesta]))
    for (const r of respuestas) {
      if (mapaCorrectas.has(r.id) && mapaCorrectas.get(r.id) === r.respuesta_elegida) {
        aciertos++
      }
    }

    const nota = Math.round((aciertos / correctas.length) * 100)
    const notaAprobacion = curso.nota_aprobacion || 70
    const aprobado = nota >= notaAprobacion

    // Buscar o crear progreso
    const { data: progresoExistente } = await supabase
      .from('curso_progreso')
      .select('id, intentos, intento_examen, ciclo_examen, examen_estado, lecciones_completadas')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .maybeSingle()

    // También buscar en equipo_cursos
    const { data: equipoExistente } = await supabase
      .from('equipo_cursos')
      .select('id, intento_examen, ciclo_examen, estado, lecciones_completadas, user_id, advisor_id')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .maybeSingle()

    let intentoActual = 1
    let cicloActual = 0
    let bloqueado = false

    if (progresoExistente) {
      intentoActual = (progresoExistente.intento_examen || 0) + 1
      cicloActual = progresoExistente.ciclo_examen || 0
    } else if (equipoExistente) {
      intentoActual = (equipoExistente.intento_examen || 0) + 1
      cicloActual = equipoExistente.ciclo_examen || 0
    }

    if (equipoExistente?.estado === 'bloqueado') {
      return NextResponse.json({ error: 'Examen bloqueado. Contacta a tu instructor.' }, { status: 403 })
    }

    const maxIntentos = curso.max_intentos || 3
    const puntosGamificacion = aprobado ? calcularPuntosExamen(curso.puntos_certificado || 500, cicloActual, intentoActual) : 0

    if (aprobado) {
      bloqueado = false
      intentoActual = 0
    } else if (intentoActual >= maxIntentos) {
      bloqueado = true
    }

    // Actualizar curso_progreso
    const progresoData = {
      intentos: (progresoExistente?.intentos || 0) + 1,
      intento_examen: bloqueado ? intentoActual : (aprobado ? 0 : intentoActual),
      ciclo_examen: cicloActual,
      examen_estado: aprobado ? 'aprobado' : (bloqueado ? 'bloqueado' : 'pendiente'),
      nota_final: nota,
      ...(aprobado ? { progreso: 100 } : {}),
      actualizado_en: new Date().toISOString(),
    }

    if (progresoExistente) {
      await supabase.from('curso_progreso').update(progresoData).eq('id', progresoExistente.id)
    } else {
      await supabase.from('curso_progreso').insert({
        user_id,
        curso_id,
        ...progresoData,
        lecciones_completadas: [],
        examen_estado: aprobado ? 'aprobado' : (bloqueado ? 'bloqueado' : 'pendiente'),
      })
    }

    // Actualizar equipo_cursos si existe
    if (equipoExistente) {
      await supabase.from('equipo_cursos').update({
        intento_examen: bloqueado ? intentoActual : (aprobado ? 0 : intentoActual),
        ciclo_examen: cicloActual,
        estado: bloqueado ? 'bloqueado' : (aprobado ? 'completado' : equipoExistente.estado),
        nota_final: nota,
        ...(aprobado ? { progreso: 100, completado_en: new Date().toISOString() } : {}),
      }).eq('id', equipoExistente.id)
    }

    // Otorgar puntos de gamificación si aprobó
    if (aprobado && puntosGamificacion > 0) {
      fetch(`${supabaseUrl.replace('/rest/v1', '')}/api/gamificacion/otorgar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          empresa_id: curso.empresa_id || DEFAULT_EMPRESA_ID,
          tipo: 'examen_aprobado',
          referencia_tipo: 'cursos',
          referencia_id: curso_id,
          descripcion: `Examen aprobado (intento ${intentoActual}, ciclo ${cicloActual + 1})`,
          puntos_override: puntosGamificacion,
        }),
      }).catch(e => console.error('[examen] Error otorgando puntos:', e))
    }

    return NextResponse.json({
      success: true,
      aprobado,
      nota,
      nota_aprobacion: notaAprobacion,
      aciertos,
      total: correctas.length,
      intento: intentoActual,
      max_intentos: maxIntentos,
      bloqueado,
      puntos_otorgados: puntosGamificacion,
    })
  } catch (error: any) {
    console.error('[examen]', error)
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}

// GET - obtener estado del examen para un usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const curso_id = searchParams.get('curso_id')
    const user_id = searchParams.get('user_id')

    if (!curso_id || !user_id) {
      return NextResponse.json({ error: 'curso_id y user_id requeridos' }, { status: 400 })
    }

    const { data: progreso } = await supabase
      .from('curso_progreso')
      .select('intento_examen, ciclo_examen, examen_estado, nota_final, intentos')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .maybeSingle()

    const { data: curso } = await supabase
      .from('cursos')
      .select('max_intentos, nota_aprobacion')
      .eq('id', curso_id)
      .single()

    const { data: equipo } = await supabase
      .from('equipo_cursos')
      .select('estado, intento_examen, ciclo_examen')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      intento_examen: progreso?.intento_examen || equipo?.intento_examen || 0,
      ciclo_examen: progreso?.ciclo_examen || equipo?.ciclo_examen || 0,
      examen_estado: progreso?.examen_estado || 'pendiente',
      bloqueado: equipo?.estado === 'bloqueado' || progreso?.examen_estado === 'bloqueado',
      nota_final: progreso?.nota_final || null,
      max_intentos: curso?.max_intentos || 3,
      nota_aprobacion: curso?.nota_aprobacion || 70,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
