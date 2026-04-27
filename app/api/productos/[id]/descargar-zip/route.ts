import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import archiver from 'archiver'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage') || url.includes('.supabase.co')
}

async function fetchFileAsBuffer(url: string): Promise<{ buffer: Buffer; name: string }> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const name = url.split('/').pop() || 'file'
  return { buffer: Buffer.from(arrayBuffer), name }
}

async function recordDownload(
  supabase: ReturnType<typeof createClient>,
  productoId: string,
  userId: string,
  request: NextRequest
) {
  await supabase.from('producto_descargas').insert({
    producto_id: productoId,
    user_id: userId,
    tipo_descarga: 'zip',
    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown'
  })
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
      .select('id, estado')
      .eq('user_id', userId)
      .eq('estado', 'completado')
      .contains('items.producto.id', [productoId])
      .single()

    if (compraError || !compra) {
      return NextResponse.json({ error: 'No tienes acceso a este producto' }, { status: 403 })
    }

    const { data: archivos, error: archivosError } = await supabase
      .from('producto_archivos')
      .select('*')
      .eq('producto_id', productoId)
      .eq('tipo_entrega', 'archivo')
      .order('orden', { ascending: true })

    if (archivosError || !archivos || archivos.length === 0) {
      return NextResponse.json({ error: 'No hay archivos para descargar' }, { status: 404 })
    }

    let totalSize = 0
    const filesToZip: { buffer: Buffer; name: string }[] = []

    for (const archivo of archivos) {
      if (archivo.tamano_bytes) {
        totalSize += Number(archivo.tamano_bytes)
      }
      if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        return NextResponse.json({
          error: 'El tamaño total de los archivos excede el límite de 100MB',
          tamanho_total: totalSize,
          limite: MAX_TOTAL_SIZE_BYTES
        }, { status: 413 })
      }

      try {
        const fileData = await fetchFileAsBuffer(archivo.archivo_url)
        filesToZip.push({
          buffer: fileData.buffer,
          name: archivo.nombre || fileData.name
        })
      } catch (err) {
        console.error(`Error fetching file ${archivo.archivo_url}:`, err)
      }
    }

    if (filesToZip.length === 0) {
      return NextResponse.json({ error: 'No se pudieron obtener los archivos' }, { status: 500 })
    }

    const archive = archiver('zip', { zlib: { level: 5 } })

    const chunks: Buffer[] = []
    archive.on('data', (chunk) => chunks.push(chunk))

    for (const file of filesToZip) {
      archive.append(file.buffer, { name: file.name })
    }

    archive.finalize()

    await new Promise<void>((resolve, reject) => {
      archive.on('end', resolve)
      archive.on('error', reject)
    })

    const zipBuffer = Buffer.concat(chunks)

    const zipFileName = `producto_${productoId}_${Date.now()}.zip`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('productos')
      .upload(`zips/${zipFileName}`, zipBuffer, {
        contentType: 'application/zip'
      })

    if (uploadError) {
      console.error('Error uploading ZIP:', uploadError)
      return NextResponse.json({ error: 'Error al crear el ZIP' }, { status: 500 })
    }

    await recordDownload(supabase, productoId, userId, request)

    const { data: signedUrl } = await supabase.storage
      .from('productos')
      .createSignedUrl(`zips/${zipFileName}`, 3600)

    return NextResponse.json({
      success: true,
      url: signedUrl?.signedURL,
      nombre: `producto_completo_${Date.now()}.zip`,
      tamanho: zipBuffer.length
    })
  } catch (error) {
    console.error('Error en descargar-zip:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
