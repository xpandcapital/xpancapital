import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const { data, error } = await supabase
        .from('certificado_plantillas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, data })
    }

    const { data, error } = await supabase
      .from('certificado_plantillas')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('activo', true)
      .order('creado_en', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      nombre,
      descripcion,
      ancho,
      alto,
      color_fondo,
      color_primario,
      color_secundario,
      color_texto,
      color_texto_secundario,
      fuente_titulo,
      fuente_cuerpo,
      tamano_titulo,
      tamano_cuerpo,
      posicion_nombre,
      posicion_curso,
      posicion_fecha,
      posicion_codigo,
      posicion_logo,
      posicion_firma,
      logo_url,
      fondo_url,
      sello_url,
      firma_url,
      texto_titulo,
      texto_subtitulo,
      texto_completado,
      texto_fecha,
      texto_firma,
      elementos
    } = body

    if (!nombre) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('certificado_plantillas')
      .insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        nombre,
        descripcion,
        ancho: ancho || 297,
        alto: alto || 210,
        color_fondo: color_fondo || '#0a0a0a',
        color_primario: color_primario || '#a89a00',
        color_secundario: color_secundario || '#10B981',
        color_texto: color_texto || '#ffffff',
        color_texto_secundario: color_texto_secundario || '#9ca3af',
        fuente_titulo: fuente_titulo || 'Inter',
        fuente_cuerpo: fuente_cuerpo || 'Inter',
        tamano_titulo: tamano_titulo || 48,
        tamano_cuerpo: tamano_cuerpo || 16,
        posicion_nombre: posicion_nombre || { x: 50, y: 45 },
        posicion_curso: posicion_curso || { x: 50, y: 55 },
        posicion_fecha: posicion_fecha || { x: 30, y: 80 },
        posicion_codigo: posicion_codigo || { x: 85, y: 90 },
        posicion_logo: posicion_logo || { x: 50, y: 15 },
        posicion_firma: posicion_firma || { x: 70, y: 75 },
        logo_url,
        fondo_url,
        sello_url,
        firma_url,
        texto_titulo: texto_titulo || 'CERTIFICADO',
        texto_subtitulo: texto_subtitulo || 'Se certifica que',
        texto_completado: texto_completado || 'ha completado satisfactoriamente el curso',
        texto_fecha: texto_fecha || 'Fecha de emisión',
        texto_firma: texto_firma || 'Director Académico',
        elementos: elementos || []
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    updates.actualizado_en = new Date().toISOString()

    const { data, error } = await supabase
      .from('certificado_plantillas')
      .update(updates)
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('certificado_plantillas')
      .delete()
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
