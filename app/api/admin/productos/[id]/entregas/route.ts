import { NextRequest, NextResponse } from 'next/server'
import { supabase as sharedSupabase } from '@/lib/supabase/server'

function getSupabase() {
  return sharedSupabase
}

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise
  try {
    const supabase = getSupabase()
    const productoId = params.id

    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        descripcion_entrega,
        imagen_principal,
        tipo,
        categoria:producto_categorias(id, nombre)
      `)
      .eq('id', productoId)
      .single()

    if (productoError || !producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const { data: videos } = await supabase
      .from('producto_videos')
      .select('*')
      .eq('producto_id', productoId)
      .order('orden', { ascending: true })

    const { data: archivos } = await supabase
      .from('producto_archivos')
      .select('*')
      .eq('producto_id', productoId)
      .order('orden', { ascending: true })

    return NextResponse.json({
      success: true,
      data: {
        ...producto,
        videos: videos || [],
        archivos: archivos || []
      }
    })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise
  try {
    const supabase = getSupabase()
    const productoId = params.id
    const body = await request.json()
    const { type, data } = body

    if (type === 'video') {
      const { data: video, error } = await supabase
        .from('producto_videos')
        .insert({
          producto_id: productoId,
          titulo: data.titulo,
          video_url: data.video_url,
          descripcion: data.descripcion || null,
          duracion_min: data.duracion_min || null,
          orden: data.orden || 0
        })
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
        .insert({
          producto_id: productoId,
          nombre: data.nombre,
          archivo_url: data.archivo_url,
          tamano_bytes: data.tamano_bytes || null,
          tipo_entrega: data.tipo_entrega || 'archivo',
          tipo_archivo: data.tipo_archivo || null,
          orden: data.orden || 0
        })
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

export async function PUT(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  const params = await paramsPromise
  try {
    const supabase = getSupabase()
    const productoId = params.id
    const body = await request.json()
    const { type, data } = body

    if (type === 'descripcion_entrega') {
      const { error } = await supabase
        .from('productos')
        .update({ descripcion_entrega: data.descripcion_entrega })
        .eq('id', productoId)

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
