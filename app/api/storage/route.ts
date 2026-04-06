import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST - Subir imagen a Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'blog'
    const filename = formData.get('filename') as string

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const uniqueFilename = filename || `${timestamp}-${randomStr}.${extension}`
    const path = `${folder}/${uniqueFilename}`

    // Convertir archivo a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir a Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      // Si el bucket no existe, intentar crearlo
      if (error.message?.includes('Bucket not found')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Bucket "images" no existe. Créalo en Supabase Storage.',
          instructions: 'Ve a Storage > Nuevo Bucket > Nombre: "images" > Público: ON'
        }, { status: 400 })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    // Obtener URL pública
    const { data: urlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(path)

    return NextResponse.json({ 
      success: true, 
      data: {
        path: data.path,
        url: urlData.publicUrl
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// DELETE - Eliminar imagen
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json({ success: false, error: 'Path requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .storage
      .from('images')
      .remove([path])

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}