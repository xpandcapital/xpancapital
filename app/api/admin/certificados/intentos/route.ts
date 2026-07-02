import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const cursoId = searchParams.get('curso_id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'user_id requerido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('certificado_intentos')
      .select('*')
      .eq('user_id', userId)
      .order('creado_en', { ascending: false })

    if (cursoId) {
      query = query.eq('curso_id', cursoId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, desbloquear, user_id, curso_id } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (desbloquear && user_id && curso_id) {
      const { data: ultimoIntento } = await supabase
        .from('certificado_intentos')
        .select('ciclo')
        .eq('user_id', user_id)
        .eq('curso_id', curso_id)
        .order('ciclo', { ascending: false })
        .limit(1)
        .single()

      const nuevoCiclo = (ultimoIntento?.ciclo ?? 0) + 1

      await supabase
        .from('certificado_intentos')
        .update({ bloqueado: false })
        .eq('user_id', user_id)
        .eq('curso_id', curso_id)
        .eq('bloqueado', true)

      return NextResponse.json({
        success: true,
        data: {
          mensaje: 'Alumno desbloqueado para nuevo ciclo de intentos',
          nuevo_ciclo: nuevoCiclo,
        },
      })
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('certificado_intentos')
      .update(body)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
