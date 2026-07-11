import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

let _cachedSupabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (_cachedSupabase) return _cachedSupabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  _cachedSupabase = createClient(supabaseUrl, supabaseServiceKey)
  return _cachedSupabase
}

const supabase = new Proxy({} as any, {
  get(_: any, prop: string) {
    return getSupabase()[prop]
  }
})
// GET - Obtener paletas
export async function GET(request: NextRequest) {
  try {
    const empresaId = request.nextUrl.searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

    const { data, error } = await supabase
      .from('email_palettes')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('creado_en', { ascending: true })

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

// POST - Crear nueva paleta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, body_bg, container_bg, text, primary_color } = body
    const empresaId = body.empresa_id || DEFAULT_EMPRESA_ID

    const { data, error } = await supabase
      .from('email_palettes')
      .insert({
        empresa_id: empresaId,
        nombre,
        body_bg: body_bg || '#F3F4F6',
        container_bg: container_bg || '#FFFFFF',
        text: text || '#333333',
        primary_color: primary_color || '#e11d48'
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

// PUT - Actualizar paleta
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, body_bg, container_bg, text, primary_color } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (nombre !== undefined) updateData.nombre = nombre
    if (body_bg !== undefined) updateData.body_bg = body_bg
    if (container_bg !== undefined) updateData.container_bg = container_bg
    if (text !== undefined) updateData.text = text
    if (primary_color !== undefined) updateData.primary_color = primary_color

    const { data, error } = await supabase
      .from('email_palettes')
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

// DELETE - Eliminar paleta
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('email_palettes')
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
