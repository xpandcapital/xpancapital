import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const advisorId = searchParams.get('advisor_id')

    let query = supabase
      .from('equipo_cursos')
      .select('*, cursos:id_curso(nombre, precio_usd, imagen_principal)')
      .order('asignado_en', { ascending: false })

    if (advisorId) query = query.eq('advisor_id', advisorId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    let { advisor_id, curso_id, email, nombre, user_id } = body

    if (!curso_id) {
      return NextResponse.json({ error: 'curso_id es requerido' }, { status: 400 })
    }

    if (!advisor_id && email) {
      const { data: advisor } = await supabase
        .from('advisors')
        .select('id')
        .eq('email', email)
        .single()

      if (advisor) {
        advisor_id = advisor.id
      } else {
        const { data: newAdvisor, error: createError } = await supabase
          .from('advisors')
          .insert({
            email,
            name: nombre || email.split('@')[0],
          })
          .select('id')
          .single()

        if (createError) {
          return NextResponse.json({ error: `Error creando asesor: ${createError.message}` }, { status: 500 })
        }
        advisor_id = newAdvisor.id
      }
    }

    if (!advisor_id) {
      return NextResponse.json({ error: 'advisor_id o email son requeridos' }, { status: 400 })
    }

    const insertData: Record<string, any> = { advisor_id, curso_id }
    if (user_id) insertData.user_id = user_id

    const { data, error } = await supabase
      .from('equipo_cursos')
      .insert(insertData)
      .select('*, cursos:id_curso(id, nombre, imagen_principal, para_equipo, precio_usd)')
      .single()

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('equipo_cursos')
          .select('*, cursos:id_curso(id, nombre, imagen_principal, para_equipo, precio_usd)')
          .eq('advisor_id', advisor_id)
          .eq('curso_id', curso_id)
          .single()
        return NextResponse.json({ success: true, data: existing })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const { error } = await supabase.from('equipo_cursos').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}