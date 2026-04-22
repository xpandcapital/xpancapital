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

    let isAdmin = false

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, rol, email')
      .eq('email', email)
      .single()

    if (profile && ['superadmin', 'admin', 'empleado'].includes(profile.rol)) {
      isAdmin = profile.rol === 'superadmin' || profile.rol === 'admin'
    }

    if (!profile) {
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
      if (authUser) {
        const { data: profileById } = await supabase
          .from('profiles')
          .select('id, rol')
          .eq('id', authUser.id)
          .single()
        if (profileById) {
          if (['superadmin', 'admin'].includes(profileById.rol)) isAdmin = true
        }
      }
    }

    const effectiveIsAdmin = isAdmin || (profile && ['superadmin', 'admin'].includes(profile.rol))
    const profileId = profile?.id
    const normalizedEmail = email.toLowerCase().trim()

    if (effectiveIsAdmin) {
      const { data: advisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('email', normalizedEmail)
        .single()
      const advisorId = advisor?.id || null

      const { data: allCursos, error: cursosError } = await supabase
        .from('cursos')
        .select('id, nombre, descripcion, precio_usd, imagen_principal, slug, para_equipo, modulos')
        .eq('para_equipo', true)

      if (cursosError) {
        console.error('[/api/equipo-cursos/me] cursos error:', cursosError)
        return NextResponse.json({ error: cursosError.message, debug: { email, profileFound: !!profile } }, { status: 500 })
      }

      let assignedMap: Record<string, any> = {}

      if (advisorId) {
        const { data: asignaciones } = await supabase
          .from('equipo_cursos')
          .select('*')
          .eq('advisor_id', advisorId)
        if (asignaciones) {
          for (const a of asignaciones) {
            assignedMap[a.curso_id] = a
          }
        }
      }

      if (profileId) {
        const { data: progresoByUser } = await supabase
          .from('equipo_cursos')
          .select('*')
          .eq('user_id', profileId)
        if (progresoByUser) {
          for (const p of progresoByUser) {
            if (!assignedMap[p.curso_id]) {
              assignedMap[p.curso_id] = p
            }
          }
        }
      }

      const data = (allCursos || []).map(curso => {
        const asignacion = assignedMap[curso.id]
        return asignacion
          ? { ...asignacion, cursos: curso }
          : {
              id: `pending-${curso.id}`,
              advisor_id: advisorId,
              user_id: profileId,
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

    const { data: advisor } = await supabase
      .from('advisors')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    const advisorId = advisor?.id

    if (!advisorId) {
      return NextResponse.json({ success: true, data: [], isTeamMember: false })
    }

    const { data, error } = await supabase
      .from('equipo_cursos')
      .select('*, cursos:id_curso(nombre, descripcion, precio_usd, imagen_principal, slug, para_equipo, modulos)')
      .eq('advisor_id', advisorId)
      .order('asignado_en', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data, isTeamMember: true })
  } catch (err: any) {
    console.error('[/api/equipo-cursos/me] error:', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}