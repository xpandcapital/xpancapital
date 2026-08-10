import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (!['superadmin', 'admin'].includes(auth.rol)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const supabase = getSupabase()
    const body = await request.json()
    const { curso_id, user_id, incluir_examen } = body

    if (!curso_id && !user_id) {
      return NextResponse.json({ error: 'curso_id o user_id requerido' }, { status: 400 })
    }

    // Limpiar lecciones completadas y progreso en equipo_cursos
    let query = supabase
      .from('equipo_cursos')
      .update({
        lecciones_completadas: [],
        progreso: 0,
        estado: 'asignado',
        nota_final: null,
        completado_en: null,
      })

    if (curso_id) query = query.eq('curso_id', curso_id)
    if (user_id) query = query.eq('user_id', user_id)

    const { data, error } = await query.select('id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const actualizados = data?.length || 0

    // Opcionalmente limpiar estado del examen (intentos/ciclo)
    if (incluir_examen) {
      let qExamen = supabase
        .from('equipo_cursos')
        .update({
          intento_examen: 0,
          ciclo_examen: 0,
          intento_aprobado: null,
          ciclo_aprobado: null,
        })
      if (curso_id) qExamen = qExamen.eq('curso_id', curso_id)
      if (user_id) qExamen = qExamen.eq('user_id', user_id)
      await qExamen

      let qProg = supabase
        .from('curso_progreso')
        .update({
          intento_examen: 0,
          ciclo_examen: 0,
          intento_aprobado: null,
          ciclo_aprobado: null,
          nota_final: null,
          examen_estado: 'pendiente',
        })
      if (curso_id) qProg = qProg.eq('curso_id', curso_id)
      if (user_id) qProg = qProg.eq('user_id', user_id)
      await qProg
    }

    return NextResponse.json({
      success: true,
      actualizados,
      mensaje: `Progreso limpiado en ${actualizados} registro(s)`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 })
  }
}
