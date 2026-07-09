import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const advisorId = searchParams.get('advisor_id')

    let query = supabase
      .from('equipo_cursos')
      .select('id, advisor_id, curso_id, progreso, estado, nota_final, lecciones_completadas, asignado_en, completado_en')
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
    const { email, nombre, user_id, curso_id, estado } = body
    let { advisor_id } = body

    if (!curso_id) {
      return NextResponse.json({ error: 'curso_id es requerido' }, { status: 400 })
    }

    // Permitir crear entrada de bloqueo: resuelve advisor por email del perfil
    if (estado === 'bloqueado' && user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, nombre, empresa_id')
        .eq('id', user_id)
        .single()

      let advisorId = advisor_id
      if (!advisorId && profile?.email) {
        const { data: existingAdvisor } = await supabase
          .from('advisors')
          .select('id')
          .eq('email', profile.email.toLowerCase())
          .maybeSingle()

        if (existingAdvisor) {
          advisorId = existingAdvisor.id
        } else {
          const { data: newAdvisor, error: createErr } = await supabase
            .from('advisors')
            .insert({
              email: profile.email.toLowerCase(),
              nombre: profile.nombre || profile.email.split('@')[0],
              empresa_id: profile.empresa_id,
            })
            .select('id')
            .single()
          if (createErr) {
            return NextResponse.json({ error: `Error creando advisor: ${createErr.message}` }, { status: 500 })
          }
          advisorId = newAdvisor?.id
        }
      }

      if (!advisorId) {
        return NextResponse.json({ error: 'No se pudo resolver advisor_id para el bloqueo' }, { status: 400 })
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('equipo_cursos')
        .insert({ user_id, curso_id, advisor_id: advisorId, estado: 'bloqueado', lecciones_completadas: [], progreso: 0 })
        .select('id, user_id, curso_id, progreso, estado, lecciones_completadas, asignado_en')
        .single()

      if (insertErr) {
        if (insertErr.code === '23505') return NextResponse.json({ success: true, data: { ya_existe: true } })
        return NextResponse.json({ error: insertErr.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, data: inserted })
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

    const insertData: Record<string, any> = { advisor_id, curso_id, lecciones_completadas: [] }
    if (user_id) insertData.user_id = user_id

    const { data: inserted, error } = await supabase
      .from('equipo_cursos')
      .insert(insertData)
      .select('id, advisor_id, curso_id, progreso, estado, lecciones_completadas, asignado_en')
      .single()

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('equipo_cursos')
          .select('*')
          .eq('advisor_id', advisor_id)
          .eq('curso_id', curso_id)
          .single()
        const { data: cursoInfo } = await supabase.from('cursos').select('id, nombre, imagen_principal, para_equipo, precio_usd').eq('id', curso_id).single()
        return NextResponse.json({ success: true, data: { ...existing, cursos: cursoInfo } })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Una sola query al curso (no duplicar en success + error)
    const { data: cursoInfo } = await supabase.from('cursos').select('id, nombre, imagen_principal, para_equipo, precio_usd').eq('id', curso_id).single()
    return NextResponse.json({ success: true, data: { ...inserted, cursos: cursoInfo } })
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