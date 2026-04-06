import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase()
    const { id } = await params

    const { data: original } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (!original) {
      return NextResponse.json({ success: false, error: 'Template no encontrado' }, { status: 404 })
    }

    const baseSlug = slugify(original.nombre)
    let newSlug = `${baseSlug}-copia`
    let counter = 1

    while (true) {
      const { data: existing } = await supabase
        .from('templates')
        .select('id')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .eq('slug', newSlug)
        .single()

      if (!existing) break
      counter++
      newSlug = `${baseSlug}-copia-${counter}`
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        nombre: `${original.nombre} (Copia)`,
        slug: newSlug,
        tipo_contenido: original.tipo_contenido,
        secciones: original.secciones,
        estado: 'borrador',
        es_principal: false,
        mostrar_en_menu: false,
        mostrar_en_footer: false,
        descripcion: original.descripcion,
        meta_titulo: original.meta_titulo,
        meta_descripcion: original.meta_descripcion,
        meta_keywords: original.meta_keywords,
        og_imagen: original.og_imagen,
        thumbnail_url: original.thumbnail_url,
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
        notas: 'Copiado de ' + original.nombre
      })

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}