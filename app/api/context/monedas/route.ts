export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// GET - Obtener configuración de monedas
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()

    // Obtener config de monedas
    const { data: config, error: configError } = await supabase
      .from('monedas_config')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (configError && configError.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: configError.message }, { status: 500 })
    }

    // Obtener tasas de cambio
    const { data: tasas, error: tasasError } = await supabase
      .from('tasas_cambio')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (tasasError) {
      return NextResponse.json({ success: false, error: tasasError.message }, { status: 500 })
    }

    // Convertir tasas a objeto
    const exchangeRates: Record<string, number> = {}
    if (tasas) {
      tasas.forEach((t: any) => {
        exchangeRates[`${t.moneda_origen}_${t.moneda_destino}`] = t.tasa
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        config: config || null,
        tasas: exchangeRates,
        tasasArray: tasas || []
      }
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

// POST - Actualizar configuración (parcial)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    // Upsert config
    const { data: existingConfig } = await supabase
      .from('monedas_config')
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    let data
    let error

    // Build partial update object
    const updates: Record<string, unknown> = {
      ultima_actualizacion: new Date().toISOString()
    }
    if (body.moneda_base !== undefined) updates.moneda_base = body.moneda_base
    if (body.monedas_activas !== undefined) updates.monedas_activas = body.monedas_activas
    if (body.margen_seguridad !== undefined) updates.margen_seguridad = body.margen_seguridad
    if (body.actualizar_automaticamente !== undefined) updates.actualizar_automaticamente = body.actualizar_automaticamente

    if (existingConfig) {
      const result = await supabase
        .from('monedas_config')
        .update(updates)
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new with defaults + provided values
      const defaults = {
        empresa_id: DEFAULT_EMPRESA_ID,
        moneda_base: 'USD',
        monedas_activas: ['USD'],
        margen_seguridad: 0.02,
        actualizar_automaticamente: true
      }
      const result = await supabase
        .from('monedas_config')
        .insert({ ...defaults, ...updates })
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

// PUT - Actualizar tasa de cambio específica
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { moneda_origen, moneda_destino, tasa, fuente = 'manual' } = body

    if (!moneda_origen || !moneda_destino || tasa === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Moneda origen, destino y tasa son requeridos' 
      }, { status: 400 })
    }

    // Upsert tasa
    const { data, error } = await supabase
      .from('tasas_cambio')
      .upsert({
        empresa_id: DEFAULT_EMPRESA_ID,
        moneda_origen,
        moneda_destino,
        tasa,
        fuente,
        actualizado_en: new Date().toISOString()
      }, {
        onConflict: 'empresa_id,moneda_origen,moneda_destino'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Actualizar fecha de última actualización en config
    await supabase
      .from('monedas_config')
      .update({ ultima_actualizacion: new Date().toISOString() })
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

// Función helper (no exportada)
async function fetchExternalRates() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await response.json()
    
    if (data && data.rates) {
      return { success: true, rates: data.rates }
    }
    return { success: false, error: 'No se pudieron obtener las tasas' }
  } catch {
    return { success: false, error: 'Error al conectar con la API de tasas' }
  }
}
