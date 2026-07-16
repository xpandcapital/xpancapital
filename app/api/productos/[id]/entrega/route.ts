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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    const productoId = params.id

    const { data: compraItems, error: itemsError } = await supabase
      .from('compra_items')
      .select(`
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
        ),
        compra:compras(
          id,
          user_id,
          estado
        )
      `)
      .eq('producto_id', productoId)
      .eq('compra.estado', 'completado')
      .eq('compra.user_id', userId)

    if (itemsError || !compraItems || compraItems.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado en tus compras' }, { status: 404 })
    }

    const item = compraItems[0]

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
        compra_id: (item.compra as any)?.[0]?.id
      }
    })
  } catch (error) {
    console.error('Error en entrega:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
