import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase()
    const { id } = await params

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }

    const { data: versiones } = await supabase
      .from('template_versiones')
      .select('*')
      .eq('template_id', id)
      .order('version', { ascending: false })
      .limit(10)

    return NextResponse.json({ 
      success: true, 
      data: { ...data, versiones } 
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase()
    const { id } = await params
    const body = await request.json()

    const {
      nombre,
      slug,
      secciones,
      descripcion,
      mostrar_en_menu,
      mostrar_en_footer,
      meta_titulo,
      meta_descripcion,
      meta_keywords,
      og_imagen,
      thumbnail_url,
      sectionOrder,
      sectionVisibility,
      config
    } = body

    if (slug !== undefined && slug !== '') {
      const { data: existing } = await supabase
        .from('templates')
        .select('id')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .eq('slug', slug)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: 'Ya existe otro template con ese slug' 
        }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {
      actualizado_en: new Date().toISOString()
    }

    if (nombre !== undefined) updateData.nombre = nombre
    if (slug !== undefined) updateData.slug = slug
    if (secciones !== undefined) updateData.secciones = secciones
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (mostrar_en_menu !== undefined) updateData.mostrar_en_menu = mostrar_en_menu
    if (mostrar_en_footer !== undefined) updateData.mostrar_en_footer = mostrar_en_footer
    if (meta_titulo !== undefined) updateData.meta_titulo = meta_titulo
    if (meta_descripcion !== undefined) updateData.meta_descripcion = meta_descripcion
    if (meta_keywords !== undefined) updateData.meta_keywords = meta_keywords
    if (og_imagen !== undefined) updateData.og_imagen = og_imagen
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (sectionOrder !== undefined) updateData.sectionOrder = sectionOrder
    if (sectionVisibility !== undefined) updateData.sectionVisibility = sectionVisibility
    if (config !== undefined) updateData.config = config

    const { data, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (secciones !== undefined) {
      const { data: lastVersion } = await supabase
        .from('template_versiones')
        .select('version')
        .eq('template_id', id)
        .order('version', { ascending: false })
        .single()

      await supabase
        .from('template_versiones')
        .insert({
          template_id: id,
          version: (lastVersion?.version || 0) + 1,
          secciones,
          notas: 'Actualización automática'
        })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase()
    const { id } = await params

    const { data: template } = await supabase
      .from('templates')
      .select('es_principal, estado')
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template no encontrado' }, { status: 404 })
    }

    if (template.es_principal && template.estado === 'activo') {
      return NextResponse.json({ 
        success: false, 
        error: 'No se puede eliminar un template principal activo' 
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}