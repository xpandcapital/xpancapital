import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidateTag } from 'next/cache'
import { getCachedLandingTemplate } from '@/lib/cache/template'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET() {
  try {
    const data = await getCachedLandingTemplate()

    if (!data || !data.secciones) {
      return NextResponse.json({ 
        success: true, 
        data: data?.secciones || {},
        message: 'No landing template found' 
      })
    }

    return NextResponse.json({ success: true, data: data.secciones })
  } catch (e: any) {
    console.error('[CMS Landing] GET error:', e?.message)
    return NextResponse.json({ success: false, error: e?.message || 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Configuración de Supabase incompleta (SERVICE_ROLE_KEY)' }, { status: 500 })
    }
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
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .eq('tipo_contenido', 'landing')
      .eq('es_principal', true)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('[CMS Landing] Find error:', findError.message, findError.code, findError.details)
      return NextResponse.json({ success: false, error: findError.message }, { status: 500 })
    }

    if (!template) {
      // No existe template → crear uno
      const { error: createError } = await supabase
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

      if (createError) {
        console.error('[CMS Landing] Insert error:', createError.message, createError.details)
        return NextResponse.json({ success: false, error: createError.message }, { status: 500 })
      }
    } else {
      // Template existe → actualizar secciones
      const { error: updateError } = await supabase
        .from('templates')
        .update({
          secciones,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', template.id)

      if (updateError) {
        console.error('[CMS Landing] Update error:', updateError.message, updateError.details)
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
      }
    }

    revalidateTag('landing-template')

    return NextResponse.json({ success: true, message: 'CMS actualizado correctamente' })
  } catch (e: any) {
    console.error('[CMS Landing] PUT error:', e?.message, e?.stack?.substring(0, 200))
    return NextResponse.json({ success: false, error: e?.message || 'Error del servidor' }, { status: 500 })
  }
}