import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

// GET - Obtener plantillas o una plantilla específica
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const empresaId = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

    if (id) {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, data })
    }

    const { data, error } = await supabase
      .from('email_templates')
      .select('id, nombre, descripcion, evento, creado_en, actualizado_en')
      .eq('empresa_id', empresaId)
      .order('creado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// POST - Crear nueva plantilla
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion, settings, blocks } = body
    const empresaId = body.empresa_id || DEFAULT_EMPRESA_ID

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        empresa_id: empresaId,
        nombre,
        descripcion,
        settings: settings || {},
        blocks: blocks || []
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// PUT - Actualizar plantilla
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, descripcion, settings, blocks } = body
    const empresaId = body.empresa_id || DEFAULT_EMPRESA_ID

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { actualizado_en: new Date().toISOString() }
    if (nombre !== undefined) updateData.nombre = nombre
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (settings !== undefined) updateData.settings = settings
    if (blocks !== undefined) updateData.blocks = blocks

    // Leer evento del settings o del body
    const evento = settings?.evento || body.evento
    if (evento !== undefined) {
      // Si hay evento y no es 'ninguno', limpiarlo de otras plantillas
      if (evento && evento !== 'ninguno') {
        await supabase
          .from('email_templates')
          .update({ evento: null })
          .eq('empresa_id', empresaId)
          .eq('evento', evento)
          .neq('id', id)
      }
      updateData.evento = evento && evento !== 'ninguno' ? evento : null
    }

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// DELETE - Eliminar plantilla
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)

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