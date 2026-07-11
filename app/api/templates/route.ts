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
    const tipo = searchParams.get('tipo')
    const estado = searchParams.get('estado')
    const solo_activos = searchParams.get('activos')

    let query = supabase
      .from('templates')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('creado_en', { ascending: false })

    if (tipo) {
      query = query.eq('tipo_contenido', tipo)
    }

    if (estado) {
      query = query.eq('estado', estado)
    }

    if (solo_activos === 'true') {
      query = query.eq('estado', 'activo')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      nombre,
      slug,
      tipo_contenido,
      secciones,
      descripcion,
      mostrar_en_menu = true,
      mostrar_en_footer = true,
      meta_titulo,
      meta_descripcion,
      meta_keywords,
      og_imagen
    } = body

    if (!nombre || !tipo_contenido) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nombre y tipo de contenido son requeridos' 
      }, { status: 400 })
    }

    const slugFinal = slug || slugify(nombre)

    const { data: existing } = await supabase
      .from('templates')
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('slug', slugFinal)
      .single()

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ya existe un template con ese slug' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        nombre,
        slug: slugFinal,
        tipo_contenido,
        secciones: secciones || {},
        estado: 'borrador',
        es_principal: false,
        mostrar_en_menu,
        mostrar_en_footer,
        descripcion,
        meta_titulo,
        meta_descripcion,
        meta_keywords,
        og_imagen,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    await supabase
      .from('template_versiones')
      .insert({
        template_id: data.id,
        version: 1,
        secciones: data.secciones,
        notas: 'Versión inicial'
      })

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}