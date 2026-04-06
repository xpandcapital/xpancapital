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

    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', DEFAULT_EMPRESA_ID)
      .single()

    if (empresaError) {
      return NextResponse.json({ success: false, error: empresaError.message }, { status: 500 })
    }

    const { data: config, error: configError } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (configError && configError.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: configError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, empresa, config })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { empresa, config } = body

    if (empresa) {
      const empresaData: Record<string, unknown> = {}
      const empresaFields = [
        'nombre', 'nombre_legal', 'slug', 'logo_url', 'logo_dark_url', 'favicon_url',
        'color_primario', 'color_secundario', 'color_acento',
        'moneda_base', 'monedas_activas', 'idioma', 'zona_horaria',
        'pais_fiscal', 'ruc', 'razon_social', 'direccion_fiscal',
        'dominio_principal', 'dominios_alias'
      ]

      empresaFields.forEach(field => {
        if (empresa[field] !== undefined) {
          empresaData[field] = empresa[field]
        }
      })

      if (Object.keys(empresaData).length > 0) {
        const { error } = await supabase
          .from('empresas')
          .update(empresaData)
          .eq('id', DEFAULT_EMPRESA_ID)

        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }
      }
    }

    if (config) {
      const configData: Record<string, unknown> = {}
      const configFields = [
        'blog_activo', 'tienda_activa', 'academia_activa', 'referidos_activo', 'bliscoins_activo',
        'envios_activo', 'envios_gratis_monto',
        'coins_por_lectura', 'segundos_lectura', 'coins_registro', 'coins_referido'
      ]

      configFields.forEach(field => {
        if (config[field] !== undefined) {
          configData[field] = config[field]
        }
      })

      if (Object.keys(configData).length > 0) {
        const { error: configUpdateError } = await supabase
          .from('empresa_config')
          .update(configData)
          .eq('empresa_id', DEFAULT_EMPRESA_ID)

        if (configUpdateError) {
          const { error: insertError } = await supabase
            .from('empresa_config')
            .insert({ empresa_id: DEFAULT_EMPRESA_ID, ...configData })

          if (insertError) {
            return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}