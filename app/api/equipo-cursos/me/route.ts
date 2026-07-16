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

    const isAdmin = false

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, rol, email')
      .eq('email', email)
      .single()

    const userRol = profile?.rol
    const effectiveIsAdmin = ['superadmin', 'admin', 'empleado'].includes(userRol || '')

    const profileId = profile?.id
    const normalizedEmail = email.toLowerCase().trim()

    if (effectiveIsAdmin) {
      const { data: advisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('email', normalizedEmail)
        .single()
      const advisorId = advisor?.id || null

      const assignedMap: Record<string, any> = {}

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

      const { data: allCursos, error: cursosError } = await supabase
        .from('cursos')
        .select('id, nombre, descripcion, precio_usd, imagen_principal, slug, para_equipo, modulos')
        .eq('activo', true)

      if (cursosError) {
        console.error('[/api/equipo-cursos/me] cursos error:', cursosError)
      }

      const data = (allCursos || []).map(curso => {
        const asignacion = assignedMap[curso.id]
        if (asignacion) {
          return { ...asignacion, cursos: curso }
        }
        if (!curso.para_equipo) return null
        return {
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
      }).filter(Boolean)

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

    const { data: equipoCursosData, error } = await supabase
      .from('equipo_cursos')
      .select('*')
      .eq('advisor_id', advisorId)
      .order('asignado_en', { ascending: false })

    const cursosInfo: Record<string, any> = {}
    if (equipoCursosData && equipoCursosData.length > 0) {
      const cursoIds = [...new Set(equipoCursosData.map(e => e.curso_id).filter(Boolean))]
      if (cursoIds.length > 0) {
        const { data: cursosData } = await supabase
          .from('cursos')
          .select('id, nombre, descripcion, precio_usd, imagen_principal, slug, para_equipo, modulos')
          .in('id', cursoIds)
        if (cursosData) {
          for (const c of cursosData) cursosInfo[c.id] = c
        }
      }
    }

    const data = (equipoCursosData || []).map((ec: any) => ({
      ...ec,
      cursos: cursosInfo[ec.curso_id] || null,
    }))

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data, isTeamMember: true })
  } catch (err: any) {
    console.error('[/api/equipo-cursos/me] error:', err)
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 })
  }
}