import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('templates')
      .select('secciones')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('tipo_contenido', 'landing')
      .eq('es_principal', true)
      .eq('estado', 'activo')
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!data) {
      const { data: defaultData, error: defaultError } = await supabase
        .from('templates')
        .select('secciones')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .eq('tipo_contenido', 'landing')
        .single()

      if (defaultError) {
        return NextResponse.json({ 
          success: true, 
          data: null,
          message: 'No landing template found. Please run seed script.'
        })
      }

      return NextResponse.json({ success: true, data: defaultData?.secciones || {} })
    }

    return NextResponse.json({ success: true, data: data.secciones })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { secciones } = body

    if (!secciones) {
      return NextResponse.json({ 
        success: false, 
        error: 'Secciones requeridas' 
      }, { status: 400 })
    }

    const { data: template, error: findError } = await supabase
      .from('templates')
      .select('id, version')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('tipo_contenido', 'landing')
      .eq('es_principal', true)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 })
    }

    let templateId: string

    if (!template) {
      const { data: newTemplate, error: createError } = await supabase
        .from('templates')
        .insert({
          empresa_id: DEFAULT_EMPRESA_ID,
          nombre: 'Landing 1',
          slug: 'inicio',
          tipo_contenido: 'landing',
          secciones,
          estado: 'activo',
          es_principal: true,
          mostrar_en_menu: true,
          mostrar_en_footer: false,
          creado_en: new Date().toISOString(),
          actualizado_en: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ success: false, error: createError.message }, { status: 500 })
      }

      templateId = newTemplate.id

      await supabase
        .from('template_versiones')
        .insert({
          template_id: templateId,
          version: 1,
          secciones,
          notas: 'Versión inicial'
        })
    } else {
      templateId = template.id

      const { error: updateError } = await supabase
        .from('templates')
        .update({
          secciones,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', templateId)

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: 'CMS actualizado correctamente' })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}