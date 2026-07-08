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
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (slug || id) {
      const teamMember = searchParams.get('team_member') === 'true'
      let query = supabase
        .from('cursos')
        .select('*')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)

      // Para lookup por slug (público), requerir activo=true
      // Para lookup por id (usuario con acceso comprado), no requerir activo
      if (slug) {
        query = query.eq('activo', true)
        query = query.eq('slug', slug)
      } else if (id) {
        query = query.eq('id', id)
      }

      if (slug && !teamMember) {
        query = query.neq('para_equipo', true)
      }

      const { data: curso, error } = await query.single()

      if (error || !curso) {
        return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
      }

      let progreso = null
      if (userId) {
        const { data: progressData } = await supabase
          .from('curso_progreso')
          .select('*')
          .eq('user_id', userId)
          .eq('curso_id', curso.id)
          .single()

        progreso = progressData
      }

      return NextResponse.json({ success: true, data: { ...curso, progreso } })
    }

    const { data: cursos, error } = await supabase
      .from('cursos')
      .select('id, nombre, slug, descripcion, precio_coins, precio_usd, creado_en, imagen_principal, modulos, para_equipo')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('activo', true)
      .order('creado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const allCursos = cursos || []

    // Filtrar solo cursos matriculados del usuario + añadir progreso
    if (userId && allCursos.length) {
      // Consulta 1: equipo_cursos donde user_id coincide directamente
      const { data: enrolled } = await supabase
        .from('equipo_cursos')
        .select('curso_id, progreso')
        .eq('user_id', userId)

      // Consulta 2: también buscar por email del advisor (para registros con user_id null)
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()

      let enrolledByAdvisor: any[] = []
      if (userProfile?.email) {
        let { data: advisorRecord } = await supabase
          .from('advisors')
          .select('id')
          .eq('email', userProfile.email.toLowerCase())
          .maybeSingle()

        if (!advisorRecord) {
          const { data: newAdvisor } = await supabase
            .from('advisors')
            .insert({
              email: userProfile.email.toLowerCase(),
              nombre: userProfile.email.split('@')[0],
              empresa_id: DEFAULT_EMPRESA_ID,
            })
            .select('id')
            .single()
          advisorRecord = newAdvisor
        }

        if (advisorRecord?.id) {
          const { data: advisorCourses } = await supabase
            .from('equipo_cursos')
            .select('curso_id, progreso')
            .eq('advisor_id', advisorRecord.id)

          enrolledByAdvisor = advisorCourses || []
        }
      }

      // Unificar ambos resultados (priorizando user_id directo)
      const allEnrolled = [...(enrolled || []), ...enrolledByAdvisor]
      const enrolledMap = new Map()
      allEnrolled.forEach(e => {
        if (!enrolledMap.has(e.curso_id) || e.user_id !== null) {
          enrolledMap.set(e.curso_id, e.progreso || 0)
        }
      })

      // Consultar progreso real desde curso_progreso (tabla que usa la academia)
      const progressEnrolledIds = allEnrolled.map(e => e.curso_id).filter(Boolean)
      if (progressEnrolledIds.length > 0) {
        const { data: progressList } = await supabase
          .from('curso_progreso')
          .select('curso_id, progreso')
          .eq('user_id', userId)
          .in('curso_id', progressEnrolledIds)

        if (progressList) {
          for (const p of progressList) {
            const existing = enrolledMap.get(p.curso_id) || 0
            enrolledMap.set(p.curso_id, Math.max(existing, p.progreso || 0))
          }
        }
      }

      // Solo cursos públicos (para_equipo=false) que estén matriculados
      const filtered = allCursos
        .filter(c => !(c as any).para_equipo && enrolledMap.has(c.id))
        .map(c => ({
          ...c,
          progreso: { progreso: enrolledMap.get(c.id) || 0 },
          matriculado: true,
        }))

      // Buscar cursos comprados via tienda (productos.curso_id)
      // Q3a: compras con user_id directo
      const { data: comprasUser } = await supabase
        .from('compras')
        .select('id')
        .eq('user_id', userId)
        .eq('estado', 'completado')

      // Q3b: compras sin user_id pero con email en metadata que coincide con el perfil
      let comprasEmail: any[] = []
      if (userProfile?.email) {
        const { data: comprasByEmail } = await supabase
          .from('compras')
          .select('id')
          .eq('estado', 'completado')
          .is('user_id', null)
          .eq('metadata->>email_cliente', userProfile.email.toLowerCase())

        comprasEmail = comprasByEmail || []
        // Actualizar user_id en compras huérfanas encontradas
        for (const compra of comprasEmail) {
          await supabase
            .from('compras')
            .update({ user_id: userId })
            .eq('id', compra.id)
        }
      }

      const todasLasCompras = [...(comprasUser || []), ...comprasEmail]
      const todosLosIds = todasLasCompras.map(c => c.id)

      let purchased: any[] = []
      if (todosLosIds.length) {
        const { data: compraItems } = await supabase
          .from('compra_items')
          .select('producto_id')
          .in('compra_id', todosLosIds)

        const productoIds = compraItems?.map(ci => ci.producto_id).filter(Boolean) || []

        const { data: linkedCursos } = await supabase
          .from('productos')
          .select('curso_id')
          .in('id', productoIds)
          .not('curso_id', 'is', null)

        const cursoIds = linkedCursos?.map(p => p.curso_id) || []
        const enrolledIds = new Set(filtered.map(c => c.id))
        purchased = allCursos
          .filter(c => !(c as any).para_equipo && cursoIds.includes(c.id) && !enrolledIds.has(c.id))
          .map(c => ({
            ...c,
            progreso: { progreso: 0 },
            matriculado: false,
          }))
      }

      return NextResponse.json({ success: true, data: [...filtered, ...purchased] })
    }

    // Listado público: excluir cursos solo-equipo
    const publicos = allCursos.filter(c => !(c as any).para_equipo)
    return NextResponse.json({ success: true, data: publicos })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { user_id, curso_id, lesson_id, completed } = body

    if (!user_id || !curso_id) {
      return NextResponse.json({ error: 'user_id y curso_id son requeridos' }, { status: 400 })
    }

    const { data: existingProgress } = await supabase
      .from('curso_progreso')
      .select('*')
      .eq('user_id', user_id)
      .eq('curso_id', curso_id)
      .single()

    if (existingProgress) {
      const { data, error } = await supabase
        .from('curso_progreso')
        .update({
          progreso: completed ? 100 : existingProgress.progreso,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Otorgar puntos de gamificación
      otorgarPuntos(user_id, curso_id, lesson_id, completed).catch(() => {})

      return NextResponse.json({ success: true, data })
    }

    const { data, error } = await supabase
      .from('curso_progreso')
      .insert({
        user_id,
        curso_id,
        progreso: completed ? 100 : 0,
        examen_estado: 'pendiente'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Otorgar puntos de gamificación
    otorgarPuntos(user_id, curso_id, lesson_id, completed).catch(() => {})

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

async function otorgarPuntos(userId: string, cursoId: string, lessonId?: string, completed?: boolean) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: curso } = await supabase
      .from('cursos')
      .select('empresa_id, puntos_por_leccion, puntos_completado')
      .eq('id', cursoId)
      .single()

    if (!curso?.empresa_id) return

    const puntosLeccion = curso.puntos_por_leccion || 50
    const puntosCurso = curso.puntos_completado || 500

    // Calcular total: lección + bonus si completó el curso
    const puntosOtorgados = puntosLeccion + (completed ? puntosCurso : 0)
    if (puntosOtorgados <= 0) return

    // Leer perfil actual
    const { data: profile } = await supabase
      .from('profiles')
      .select('puntos, puntos_cursos, puntos_nivel')
      .eq('id', userId)
      .single()

    if (!profile) return

    const nuevosPuntos = (profile.puntos || 0) + puntosOtorgados
    const nuevosPuntosCurso = (profile.puntos_cursos || 0) + puntosOtorgados

    // Calcular nuevo nivel basado en puntos_cursos
    const { data: niveles } = await supabase
      .from('gamificacion_niveles')
      .select('*')
      .eq('empresa_id', curso.empresa_id)
      .order('orden', { ascending: true })

    let nuevoNivel = profile.puntos_nivel || 1
    if (niveles && niveles.length > 0) {
      for (let i = niveles.length - 1; i >= 0; i--) {
        if (nuevosPuntosCurso >= (niveles[i].puntos_requeridos || 0)) {
          nuevoNivel = niveles[i].nivel
          break
        }
      }
    }

    // Actualizar perfil directamente
    const hoy = new Date().toISOString().slice(0, 10)
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        puntos: nuevosPuntos,
        puntos_cursos: nuevosPuntosCurso,
        puntos_nivel: nuevoNivel,
        ultima_actividad: hoy,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateErr) {
      console.error('[cursos] Error actualizando puntos:', updateErr)
    } else {
      console.log(`[cursos] +${puntosOtorgados}pts a ${userId} (total: ${nuevosPuntos}, nivel: ${nuevoNivel})`)
    }
  } catch (err) {
    console.error('[cursos] Error otorgando puntos:', err)
  }
}