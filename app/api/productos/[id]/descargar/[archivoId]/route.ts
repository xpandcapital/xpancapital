import { NextRequest, NextResponse } from 'next/server'
import { supabase as sharedSupabase } from '@/lib/supabase/server'

function getSupabase() {
  return sharedSupabase
}

async function recordDownload(
  supabase: ReturnType<typeof getSupabase>,
  productoId: string,
  archivoId: string,
  userId: string,
  tipoDescarga: string,
  request: NextRequest
) {
  await supabase.from('producto_descargas').insert({
    producto_id: productoId,
    archivo_id: archivoId || null,
    user_id: userId,
    tipo_descarga: tipoDescarga,
    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown'
  })
}

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage') || url.includes('.supabase.co')
}

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string; archivoId: string }> }
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
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    await recordDownload(supabase as any, productoId, archivoId, userId, 'individual', request)

    if (isSupabaseStorageUrl(archivo.archivo_url)) {
      const { data: signedUrl, error: signError } = await supabase.storage
        .from('productos')
        .createSignedUrl(archivo.archivo_url.split('/').pop() || '', 3600)

      if (signError || !signedUrl) {
        return NextResponse.json({ error: 'Error generando URL de descarga' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        url: (signedUrl as any).signedUrl,
        nombre: archivo.nombre
      })
    }

    return NextResponse.json({
      success: true,
      url: archivo.archivo_url,
      nombre: archivo.nombre
    })
  } catch (error) {
    console.error('Error en descargar:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
