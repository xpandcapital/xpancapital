import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://xpandcapital.org'

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

// Puntos de gamificación — tabla fija por ciclo e intento
const PUNTOS_EXAMEN: Record<number, Record<number, number>> = {
  0: { 1: 500, 2: 450, 3: 400 },   // Ciclo original
  1: { 1: 350, 2: 300, 3: 250 },   // 1er restablecimiento
  2: { 1: 200, 2: 150, 3: 100 },   // 2do restablecimiento
  3: { 1: 90,  2: 50,  3: 0 },     // 3er restablecimiento
}

function calcularPuntosExamen(_puntosBase: number, ciclo: number, intento: number): number {
  const cicloData = PUNTOS_EXAMEN[Math.min(ciclo, 3)]
  if (!cicloData) return 0
  return cicloData[intento] ?? 0
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { curso_id, user_id, respuestas, tipo, modulo_id, leccion_id } = body

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

    const modulos = Array.isArray(curso.modulos) ? curso.modulos : []

    // Determinar el módulo objetivo (para exámenes de módulo) o el módulo de la lección (para quizzes de lección)
    let modObjetivo: any = null
    let leccionObjetivo: any = null

    if (tipo === 'leccion' && leccion_id) {
      for (const mod of modulos) {
        const lec = (mod.lessons || []).find((l: any) => l.id === leccion_id)
        if (lec) {
          modObjetivo = mod
          leccionObjetivo = lec
          break
        }
      }
      if (!leccionObjetivo) {
        return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 })
      }
    } else {
      // Examen de módulo
      modObjetivo = modulos.find((m: any) => m.id === modulo_id)
      if (!modObjetivo) {
        return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 })
      }
    }

    // Verificar que las lecciones estén completadas (secuencia obligatoria)
    const { data: progresoExistente } = await supabase
      .from('curso_progreso')
      .select('id, intentos, intento_examen, ciclo_examen, examen_estado')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .maybeSingle()

    const { data: equipoExistente } = await supabase
      .from('equipo_cursos')
      .select('id, intento_examen, ciclo_examen, estado, lecciones_completadas, user_id, advisor_id')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .maybeSingle()

    let leccionesCompletadas: string[] = []
    const rawCompleted = progresoExistente?.lecciones_completadas || equipoExistente?.lecciones_completadas || []
    if (typeof rawCompleted === 'string') {
      try { leccionesCompletadas = JSON.parse(rawCompleted) } catch { leccionesCompletadas = [] }
    } else if (Array.isArray(rawCompleted)) {
      leccionesCompletadas = rawCompleted
    }

    if (tipo === 'leccion' && leccionObjetivo) {
      // Quiz de lección: verificar que las lecciones anteriores (del mismo módulo, en orden) estén completadas
      const leccionesModulo = modObjetivo?.lessons || []
      const idxActual = leccionesModulo.findIndex((l: any) => l.id === leccion_id)
      const leccionesPrevias = leccionesModulo.slice(0, idxActual)
      const faltan = leccionesPrevias.filter((l: any) => !leccionesCompletadas.includes(l.id))
      if (faltan.length > 0) {
        return NextResponse.json({
          error: 'Debes completar las lecciones anteriores antes de este quiz',
          bloqueado_por_secuencia: true,
        }, { status: 403 })
      }
    } else {
      // Examen de módulo: verificar que TODAS las lecciones del módulo estén completadas
      const leccionesModulo = modObjetivo?.lessons || []
      const leccionesConQuiz = leccionesModulo.filter((l: any) => l.type === 'quiz')
      const leccionesRequeridas = leccionesModulo.filter((l: any) => l.type !== 'quiz')
      const faltan = leccionesRequeridas.filter((l: any) => !leccionesCompletadas.includes(l.id))
      if (faltan.length > 0) {
        return NextResponse.json({
          error: `Debes completar todas las lecciones del módulo antes del examen (faltan ${faltan.length})`,
          bloqueado_por_secuencia: true,
        }, { status: 403 })
      }
    }

    // Extraer las preguntas SOLO del módulo/lección objetivo
    interface PreguntaCorrecta { id: string; respuesta: string }
    const correctas: PreguntaCorrecta[] = []

    if (tipo === 'leccion' && leccionObjetivo) {
      if (leccionObjetivo.questions && Array.isArray(leccionObjetivo.questions)) {
        for (const q of leccionObjetivo.questions) {
          if (q?.id && q?.options && Array.isArray(q.options)) {
            const correcta = q.options.find((o: any) => o.isCorrect)
            if (correcta) correctas.push({ id: q.id, respuesta: correcta.id })
          }
        }
      }
    } else {
      // Examen de módulo: preguntas del módulo
      if (modObjetivo.questions && Array.isArray(modObjetivo.questions)) {
        for (const q of modObjetivo.questions) {
          if (q?.id && q?.options && Array.isArray(q.options)) {
            const correcta = q.options.find((o: any) => o.isCorrect)
            if (correcta) correctas.push({ id: q.id, respuesta: correcta.id })
          }
        }
      }
    }

    if (correctas.length === 0) {
      return NextResponse.json({ error: 'No hay preguntas configuradas para esta evaluación' }, { status: 400 })
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

    const aprobadoMetadata = aprobado ? { intento_aprobado: intentoActual, ciclo_aprobado: cicloActual } : {}

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
      await supabase.from('curso_progreso').update({
        ...progresoData,
        ...aprobadoMetadata,
      }).eq('id', progresoExistente.id)
    } else {
      await supabase.from('curso_progreso').insert({
        user_id,
        curso_id,
        ...progresoData,
        ...aprobadoMetadata,
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
        ...aprobadoMetadata,
        ...(aprobado ? { progreso: 100, completado_en: new Date().toISOString() } : {}),
      }).eq('id', equipoExistente.id)
    }

    // Otorgar puntos de gamificación si aprobó
    if (aprobado && puntosGamificacion > 0) {
      fetch(`${appUrl}/api/gamificacion/otorgar`, {
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
      ciclo: cicloActual,
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
    const tipo = searchParams.get('tipo')
    const modulo_id = searchParams.get('modulo_id')
    const leccion_id = searchParams.get('leccion_id')

    if (!curso_id || !user_id) {
      return NextResponse.json({ error: 'curso_id y user_id requeridos' }, { status: 400 })
    }

    const { data: progreso } = await supabase
      .from('curso_progreso')
      .select('intento_examen, ciclo_examen, examen_estado, nota_final, intentos, intento_aprobado, ciclo_aprobado')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .maybeSingle()

    const { data: curso } = await supabase
      .from('cursos')
      .select('max_intentos, nota_aprobacion, modulos')
      .eq('id', curso_id)
      .single()

    const { data: equipo } = await supabase
      .from('equipo_cursos')
      .select('estado, intento_examen, ciclo_examen, lecciones_completadas')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .maybeSingle()

    // Verificar secuencia de lecciones (fuente de verdad: BD)
    let secuencia_ok = true
    let faltan_lecciones: string[] = []
    if (curso?.modulos && Array.isArray(curso.modulos) && (tipo === 'modulo' || tipo === 'leccion')) {
      const modulos = curso.modulos
      let modObjetivo: any = null
      if (tipo === 'modulo' && modulo_id) {
        modObjetivo = modulos.find((m: any) => m.id === modulo_id)
      } else if (tipo === 'leccion' && leccion_id) {
        for (const mod of modulos) {
          const lec = (mod.lessons || []).find((l: any) => l.id === leccion_id)
          if (lec) { modObjetivo = mod; break }
        }
      }

      let leccionesCompletadas: string[] = []
      const raw = progreso?.lecciones_completadas || equipo?.lecciones_completadas || []
      if (typeof raw === 'string') { try { leccionesCompletadas = JSON.parse(raw) } catch { leccionesCompletadas = [] } }
      else if (Array.isArray(raw)) leccionesCompletadas = raw

      if (modObjetivo) {
        const leccionesModulo = modObjetivo.lessons || []
        if (tipo === 'leccion' && leccion_id) {
          const idxActual = leccionesModulo.findIndex((l: any) => l.id === leccion_id)
          const previas = leccionesModulo.slice(0, idxActual)
          faltan_lecciones = previas.filter((l: any) => !leccionesCompletadas.includes(l.id))
          secuencia_ok = faltan_lecciones.length === 0
        } else {
          const requeridas = leccionesModulo.filter((l: any) => l.type !== 'quiz')
          faltan_lecciones = requeridas.filter((l: any) => !leccionesCompletadas.includes(l.id))
          secuencia_ok = faltan_lecciones.length === 0
        }
      }
    }

    return NextResponse.json({
      success: true,
      intento_examen: progreso?.intento_examen || equipo?.intento_examen || 0,
      ciclo_examen: progreso?.ciclo_examen || equipo?.ciclo_examen || 0,
      intento_aprobado: progreso?.intento_aprobado || equipo?.intento_aprobado || null,
      ciclo_aprobado: progreso?.ciclo_aprobado || equipo?.ciclo_aprobado || null,
      examen_estado: progreso?.examen_estado || 'pendiente',
      bloqueado: equipo?.estado === 'bloqueado' || progreso?.examen_estado === 'bloqueado',
      nota_final: progreso?.nota_final || null,
      max_intentos: curso?.max_intentos || 3,
      nota_aprobacion: curso?.nota_aprobacion || 70,
      secuencia_ok,
      faltan_lecciones,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
