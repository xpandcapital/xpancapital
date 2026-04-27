import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

async function recordEnlaceClick(
  supabase: ReturnType<typeof createClient>,
  productoId: string,
  archivoId: string,
  userId: string,
  request: NextRequest
) {
  await supabase.from('producto_descargas').insert({
    producto_id: productoId,
    archivo_id: archivoId,
    user_id: userId,
    tipo_descarga: 'enlace',
    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown'
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; archivoId: string } }
) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }

    const productoId = params.id
    const archivoId = params.archivoId

    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .select('id, estado')
      .eq('user_id', userId)
      .eq('estado', 'completado')
      .contains('items.producto.id', [productoId])
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ error: 'No tienes acceso a este producto' }, { status: 403 })
    }

    const { data: archivo, error: archivoError } = await supabase
      .from('producto_archivos')
      .select('*')
      .eq('id', archivoId)
      .eq('producto_id', productoId)
      .single()

    if (archivoError || !archivo) {
      return NextResponse.json({ error: 'Enlace no encontrado' }, { status: 404 })
    }

    if (archivo.tipo_entrega !== 'enlace') {
      return NextResponse.json({ error: 'Este archivo no es un enlace' }, { status: 400 })
    }

    await recordEnlaceClick(supabase, productoId, archivoId, userId, request)

    return NextResponse.redirect(archivo.archivo_url)
  } catch (error) {
    console.error('Error en abrir-enlace:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
