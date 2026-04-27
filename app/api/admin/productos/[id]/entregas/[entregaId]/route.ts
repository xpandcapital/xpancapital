import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; entregaId: string } }
) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const entregaId = params.entregaId
    const body = await request.json()
    const { data } = body

    if (type === 'video') {
      const { data: video, error } = await supabase
        .from('producto_videos')
        .update({
          titulo: data.titulo,
          video_url: data.video_url,
          descripcion: data.descripcion || null,
          duracion_min: data.duracion_min || null,
          orden: data.orden || 0
        })
        .eq('id', entregaId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: video })
    }

    if (type === 'archivo') {
      const { data: archivo, error } = await supabase
        .from('producto_archivos')
        .update({
          nombre: data.nombre,
          archivo_url: data.archivo_url,
          tamano_bytes: data.tamano_bytes || null,
          tipo_entrega: data.tipo_entrega || 'archivo',
          tipo_archivo: data.tipo_archivo || null,
          orden: data.orden || 0
        })
        .eq('id', entregaId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: archivo })
    }

    return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; entregaId: string } }
) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const entregaId = params.entregaId

    if (type === 'video') {
      const { error } = await supabase
        .from('producto_videos')
        .delete()
        .eq('id', entregaId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (type === 'archivo') {
      const { error } = await supabase
        .from('producto_archivos')
        .delete()
        .eq('id', entregaId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
