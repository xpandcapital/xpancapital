export const dynamic = 'force-dynamic'

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

// POST - Actualizar configuración existente (parcial)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    // Verificar si existe config
    const { data: existing } = await supabase
      .from('empresa_config')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    let data
    let error

    if (existing?.id) {
      // Actualizar solo los campos enviados, mantener el resto igual
      const result = await supabase
        .from('empresa_config')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Crear nueva con valores por defecto + los enviados
      const defaultConfig = {
        empresa_id: DEFAULT_EMPRESA_ID,
        enable_perishables: true,
        enable_serialization: true,
        enable_shipping: true,
        business_type: 'physical'
      }
      const result = await supabase
        .from('empresa_config')
        .insert({ ...defaultConfig, ...body })
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
