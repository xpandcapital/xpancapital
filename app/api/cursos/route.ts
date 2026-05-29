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
        .eq('activo', true)

      if (slug) {
        query = query.eq('slug', slug)
      } else if (id) {
        query = query.eq('id', id)
      }

      if (!teamMember) {
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
      .select('id, nombre, slug, descripcion, precio_coins, precio_usd, creado_en, imagen_principal, modulos')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('activo', true)
      .neq('para_equipo', true)
      .order('creado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filtrar solo cursos matriculados del usuario + añadir progreso
    if (userId && cursos) {
      const { data: enrolled } = await supabase
        .from('equipo_cursos')
        .select('curso_id, progreso')
        .eq('user_id', userId)

      const enrolledMap = new Map()
      enrolled?.forEach(e => enrolledMap.set(e.curso_id, e.progreso || 0))

      const filtered = cursos
        .filter(c => enrolledMap.has(c.id))
        .map(c => ({
          ...c,
          progreso: { progreso: enrolledMap.get(c.id) || 0 },
          matriculado: true,
        }))

      // Si el usuario no tiene cursos en equipo_cursos, buscar en compras
      if (filtered.length === 0) {
        const { data: comprasUser } = await supabase
          .from('compras')
          .select('id')
          .eq('user_id', userId)
          .eq('estado', 'completado')

        if (comprasUser?.length) {
          const { data: compraItems } = await supabase
            .from('compra_items')
            .select('producto_id')
            .in('compra_id', comprasUser.map(c => c.id))

          const productoIds = compraItems?.map(ci => ci.producto_id).filter(Boolean) || []

          const { data: linkedCursos } = await supabase
            .from('productos')
            .select('curso_id')
            .in('id', productoIds)
            .not('curso_id', 'is', null)

          const cursoIds = linkedCursos?.map(p => p.curso_id) || []
          const purchased = cursos.filter(c => cursoIds.includes(c.id)).map(c => ({
            ...c,
            progreso: { progreso: 0 },
            matriculado: false,
          }))

          return NextResponse.json({ success: true, data: [...filtered, ...purchased] })
        }
      }

      return NextResponse.json({ success: true, data: filtered })
    }

    return NextResponse.json({ success: true, data: cursos })
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

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}