import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    const productoId = params.id

    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .select(`
        id,
        estado,
        items:compra_items(
          id,
          cantidad,
          precio_unitario,
          producto:productos(
            id,
            nombre,
            descripcion,
            descripcion_entrega,
            imagen_principal,
            tipo,
            archivo_url,
            categoria:producto_categorias(nombre)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('estado', 'completado')
      .contains('items.producto.id', [productoId])
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ error: 'Producto no encontrado en tus compras' }, { status: 404 })
    }

    const item = (compra.items || []).find((i: any) => i.producto?.id === productoId)
    if (!item) {
      return NextResponse.json({ error: 'Producto no encontrado en esta compra' }, { status: 404 })
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
        producto: item.producto,
        videos: videos || [],
        archivos: archivos || [],
        compra_id: compra.id
      }
    })
  } catch (error) {
    console.error('Error en entrega:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
