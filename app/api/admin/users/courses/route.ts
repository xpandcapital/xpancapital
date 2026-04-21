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
      .select('id, email')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    let assignedCourses: any[] = []

    const { data: advisor } = await supabase
      .from('advisors')
      .select('id')
      .eq('email', profile.email)
      .single()

    if (advisor) {
      const { data: cursos } = await supabase
        .from('equipo_cursos')
        .select('*, cursos:id_curso(id, nombre, imagen_principal, para_equipo)')
        .eq('advisor_id', advisor.id)
        .order('asignado_en', { ascending: false })

      assignedCourses = cursos || []
    }

    const { data: availableCourses } = await supabase
      .from('cursos')
      .select('id, nombre, imagen_principal, para_equipo, precio_usd, activo')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('para_equipo', true)

    return NextResponse.json({
      success: true,
      assigned: assignedCourses,
      available: availableCourses || [],
      advisorId: advisor?.id || null,
    })
  } catch (error: any) {
    console.error('[API Error] /api/admin/users/courses:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}