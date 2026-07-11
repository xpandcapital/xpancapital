export const dynamic = 'force-dynamic'

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
    const listAll = searchParams.get('list')

    if (listAll === 'all') {
      const { data: empresas, error: listError } = await supabase
        .from('empresas')
        .select('*')
        .order('creado_en', { ascending: true })

      if (listError) {
        return NextResponse.json({ success: false, error: listError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, empresas })
    }

    const empresaId = searchParams.get('id') || DEFAULT_EMPRESA_ID

    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .single()

    if (empresaError) {
      return NextResponse.json({ success: false, error: empresaError.message }, { status: 500 })
    }

    const { data: config, error: configError } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('empresa_id', empresaId)
      .single()

    if (configError && configError.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: configError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, empresa, config })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { nombre, slug, nombre_legal, color_primario, pais_fiscal, moneda_base, idioma, zona_horaria, plan } = body

    if (!nombre || !slug) {
      return NextResponse.json({ error: 'Nombre y slug son requeridos' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('empresas')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ya existe una empresa con ese slug' }, { status: 409 })
    }

    const { data: empresa, error } = await supabase
      .from('empresas')
      .insert({
        nombre,
        slug,
        nombre_legal: nombre_legal || nombre,
        color_primario: color_primario || '#be0b3c',
        color_secundario: '#000000',
        color_acento: '#10b981',
        pais_fiscal: pais_fiscal || 'PE',
        moneda_base: moneda_base || 'USD',
        idioma: idioma || 'es',
        zona_horaria: zona_horaria || 'America/Lima',
        plan: plan || 'free',
        plan_limite_usuarios: 5,
        plan_limite_productos: 50,
        plan_limite_almacenamiento: 1073741824,
        activo: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase
      .from('empresa_config')
      .insert({
        empresa_id: empresa.id,
        blog_activo: true,
        tienda_activa: true,
        academia_activa: false,
        referidos_activo: true,
        bliscoins_activo: true,
        envios_activo: false,
        coins_por_lectura: 5,
        segundos_lectura: 60,
        coins_registro: 100,
        coins_referido: 50,
      })

    return NextResponse.json({ success: true, empresa })
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

    if (id === DEFAULT_EMPRESA_ID) {
      return NextResponse.json({ error: 'No se puede eliminar la empresa principal' }, { status: 403 })
    }

    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .eq('empresa_id', id)

    if (users && users.length > 0) {
      return NextResponse.json({ error: `Esta empresa tiene ${users.length} usuario(s) asignado(s). Reasigna los usuarios antes de eliminar.` }, { status: 409 })
    }

    await supabase.from('empresa_config').delete().eq('empresa_id', id)
    await supabase.from('api_keys').delete().eq('empresa_id', id)

    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, empresa, config } = body
    const empresaId = id || DEFAULT_EMPRESA_ID

    if (empresa) {
      const empresaData: Record<string, unknown> = {}
      const empresaFields = [
        'nombre', 'nombre_legal', 'slug', 'logo_url', 'logo_dark_url', 'favicon_url',
        'color_primario', 'color_secundario', 'color_acento',
        'moneda_base', 'monedas_activas', 'idioma', 'zona_horaria',
        'pais_fiscal', 'ruc', 'razon_social', 'direccion_fiscal',
        'dominio_principal', 'dominios_alias', 'activo', 'plan',
        'plan_limite_usuarios', 'plan_limite_productos', 'plan_limite_almacenamiento'
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
          .eq('id', empresaId)

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
          .eq('empresa_id', empresaId)

        if (configUpdateError) {
          const { error: insertError } = await supabase
            .from('empresa_config')
            .insert({ empresa_id: empresaId, ...configData })

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
