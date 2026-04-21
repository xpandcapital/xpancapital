import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'email es requerido' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, rol')
      .eq('email', email)
      .single()

    const isAdmin = profile && ['superadmin', 'admin'].includes(profile.rol)

    if (isAdmin) {
      const { data: allCursos, error: cursosError } = await supabase
        .from('cursos')
        .select('id, nombre, descripcion, precio_usd, imagen_principal, slug, para_equipo, modulos')
        .eq('para_equipo', true)

      if (cursosError) {
        console.error('[/api/equipo-cursos/me] cursos error:', cursosError)
        return NextResponse.json({ error: cursosError.message }, { status: 500 })
      }

      let assignedMap: Record<string, any> = {}
      const { data: advisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('email', email)
        .single()

      if (advisor) {
        const { data: asignaciones } = await supabase
          .from('equipo_cursos')
          .select('*')
          .eq('advisor_id', advisor.id)
        if (asignaciones) {
          for (const a of asignaciones) {
            assignedMap[a.curso_id] = a
          }
        }
      }

      const data = (allCursos || []).map(curso => {
        const asignacion = assignedMap[curso.id]
        return asignacion
          ? { ...asignacion, cursos: curso }
          : {
              id: `pending-${curso.id}`,
              advisor_id: advisor?.id || null,
              curso_id: curso.id,
              progreso: 0,
              estado: 'asignado',
              nota_final: null,
              lecciones_completadas: [],
              asignado_en: new Date().toISOString(),
              completado_en: null,
              cursos: curso,
            }
      })

      return NextResponse.json({ success: true, data, isTeamMember: true, isAdmin: true })
    }

    const { data: advisor, error: advisorError } = await supabase
      .from('advisors')
      .select('id')
      .eq('email', email)
      .single()

    if (advisorError || !advisor) {
      return NextResponse.json({ success: true, data: [], isTeamMember: false })
    }

    const { data, error } = await supabase
      .from('equipo_cursos')
      .select('*, cursos:id_curso(nombre, descripcion, precio_usd, imagen_principal, slug, para_equipo, modulos)')
      .eq('advisor_id', advisor.id)
      .order('asignado_en', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data, isTeamMember: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}