import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, rol')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const assignedCourses: any[] = []
    let advisorId: string | null = null
    const assignedCourseIdsSet = new Set<string>()

    // Query 1: por advisor_id (email del perfil)
    const { data: advisor } = await supabase
      .from('advisors')
      .select('id')
      .eq('email', profile.email)
      .single()

    if (advisor) {
      advisorId = advisor.id
      const { data: equipoCursos } = await supabase
        .from('equipo_cursos')
        .select('id, advisor_id, curso_id, user_id, progreso, estado, lecciones_completadas, nota_final, asignado_en, completado_en')
        .eq('advisor_id', advisor.id)
        .order('asignado_en', { ascending: false })

      if (equipoCursos) {
        for (const c of equipoCursos) {
          assignedCourses.push(c)
          assignedCourseIdsSet.add(c.curso_id)
        }
      }
    }

    // Query 2: por user_id directo (asignaciones via compras/trigger)
    const { data: byUserId } = await supabase
      .from('equipo_cursos')
      .select('id, advisor_id, curso_id, user_id, progreso, estado, lecciones_completadas, nota_final, asignado_en, completado_en')
      .eq('user_id', userId)
      .order('asignado_en', { ascending: false })

    if (byUserId) {
      for (const c of byUserId) {
        if (!assignedCourseIdsSet.has(c.curso_id)) {
          assignedCourses.push(c)
          assignedCourseIdsSet.add(c.curso_id)
        }
      }
    }

    const { data: allCursos } = await supabase
      .from('cursos')
      .select('id, nombre, imagen_principal, para_equipo, precio_usd, activo')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    const assignedCourseIds = new Set(assignedCourses.map(c => c.curso_id).filter(Boolean))

    // Para admins: agregar cursos de equipo como disponibles automáticamente
    const isAdmin = ['superadmin', 'admin', 'editor', 'empleado'].includes(profile.rol || '')
    const teamCourseEntries: any[] = []

    if (isAdmin && allCursos) {
      for (const curso of allCursos) {
        if (curso.para_equipo && !assignedCourseIds.has(curso.id)) {
          teamCourseEntries.push({
            id: `pending-${curso.id}`,
            advisor_id: advisorId || 'admin',
            curso_id: curso.id,
            user_id: userId,
            progreso: 0,
            estado: 'asignado',
            lecciones_completadas: [],
            nota_final: null,
            asignado_en: new Date().toISOString(),
            completado_en: null,
            cursos: curso,
            _virtual: true,
          })
          assignedCourseIds.add(curso.id)
        }
      }
    }

    const allAssigned = [...assignedCourses.map(ac => {
      const info = allCursos?.find(c => c.id === ac.curso_id)
      return { ...ac, cursos: info || null }
    }), ...teamCourseEntries]

    const cursosConInfo = allAssigned

    return NextResponse.json({
      success: true,
      assigned: cursosConInfo,
      available: (allCursos || []).filter(c => !assignedCourseIds.has(c.id)),
      assignedCourseIds: Array.from(assignedCourseIds),
      advisorId,
    })
  } catch (error: any) {
    console.error('[API Error] /api/admin/users/courses:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}