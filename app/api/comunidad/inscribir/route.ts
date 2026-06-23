import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventoId = searchParams.get('evento_id')

    if (!eventoId) {
      return NextResponse.json({ success: false, error: 'evento_id requerido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: inscritos, error } = await supabase
      .from('comunidad_evento_inscritos')
      .select(`
        id, evento_id, usuario_id, estado, created_at,
        usuario:usuario_id(id, nombre, apellido, avatar_url)
      `)
      .eq('evento_id', eventoId)
      .order('created_at')

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: inscritos })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { evento_id } = body

    if (!evento_id) {
      return NextResponse.json({ success: false, error: 'evento_id requerido' }, { status: 400 })
    }

    // Verificar evento y capacidad
    const { data: evento } = await supabase
      .from('comunidad_eventos')
      .select('id, capacidad')
      .eq('id', evento_id)
      .single()

    if (!evento) {
      return NextResponse.json({ success: false, error: 'Evento no encontrado' }, { status: 404 })
    }

    if (evento.capacidad) {
      const { count } = await supabase
        .from('comunidad_evento_inscritos')
        .select('*', { count: 'exact', head: true })
        .eq('evento_id', evento_id)
        .eq('estado', 'inscrito')

      if (count && count >= evento.capacidad) {
        return NextResponse.json({ success: false, error: 'Evento lleno' }, { status: 400 })
      }
    }

    // Verificar si ya está inscrito
    const { data: existing } = await supabase
      .from('comunidad_evento_inscritos')
      .select('id, estado')
      .eq('evento_id', evento_id)
      .eq('usuario_id', user.userId)
      .single()

    if (existing) {
      if (existing.estado === 'inscrito') {
        return NextResponse.json({ success: false, error: 'Ya estás inscrito' }, { status: 400 })
      }
      // Reactivar si estaba cancelado
      const { error } = await supabase
        .from('comunidad_evento_inscritos')
        .update({ estado: 'inscrito', updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      return NextResponse.json({ success: true, data: { estado: 'inscrito' } })
    }

    // Nueva inscripción
    const { error } = await supabase
      .from('comunidad_evento_inscritos')
      .insert({ evento_id, usuario_id: user.userId, estado: 'inscrito' })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: { estado: 'inscrito' } })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const eventoId = searchParams.get('evento_id')

    if (!eventoId) {
      return NextResponse.json({ success: false, error: 'evento_id requerido' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('comunidad_evento_inscritos')
      .select('id')
      .eq('evento_id', eventoId)
      .eq('usuario_id', user.userId)
      .single()

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Inscripción no encontrada' }, { status: 404 })
    }

    const { error } = await supabase
      .from('comunidad_evento_inscritos')
      .update({ estado: 'cancelado', updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: { estado: 'cancelado' } })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error del servidor'
    }, { status: 500 })
  }
}
