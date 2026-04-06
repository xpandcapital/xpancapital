import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// GET - Obtener configuración de negocio
export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Valores por defecto si no existe
    const defaultConfig = {
      enable_perishables: true,
      enable_serialization: true,
      enable_shipping: true,
      business_type: 'physical'
    }

    return NextResponse.json({ 
      success: true, 
      data: data || defaultConfig
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Crear o actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      enable_perishables,
      enable_serialization,
      enable_shipping,
      business_type,
      coins_nombre,
      coins_ratio_usd,
      recompensa_lectura_segundos,
      recompensa_lectura_coins,
      blog_premium_por_defecto
    } = body

    // Verificar si existe config
    const { data: existing } = await supabase
      .from('empresa_config')
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    const configData = {
      empresa_id: DEFAULT_EMPRESA_ID,
      enable_perishables: enable_perishables ?? true,
      enable_serialization: enable_serialization ?? true,
      enable_shipping: enable_shipping ?? true,
      business_type: business_type || 'physical',
      coins_nombre,
      coins_ratio_usd,
      recompensa_lectura_segundos,
      recompensa_lectura_coins,
      blog_premium_por_defecto
    }

    let data
    let error

    if (existing?.id) {
      const result = await supabase
        .from('empresa_config')
        .update(configData)
        .eq('id', existing.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      const result = await supabase
        .from('empresa_config')
        .insert(configData)
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar campos específicos
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const { data: existing } = await supabase
      .from('empresa_config')
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (!existing?.id) {
      return NextResponse.json({ success: false, error: 'Configuración no encontrada' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('empresa_config')
      .update(body)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}