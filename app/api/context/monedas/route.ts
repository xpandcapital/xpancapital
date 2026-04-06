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

// POST - Crear o actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { moneda_base, monedas_activas, margen_seguridad, actualizar_automaticamente } = body

    // Upsert config
    const { data: existingConfig } = await supabase
      .from('monedas_config')
      .select('id')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    let data
    let error

    if (existingConfig) {
      const result = await supabase
        .from('monedas_config')
        .update({
          moneda_base: moneda_base || 'USD',
          monedas_activas: monedas_activas || ['USD'],
          margen_seguridad: margen_seguridad || 0.02,
          actualizar_automaticamente: actualizar_automaticamente ?? true,
          ultima_actualizacion: new Date().toISOString()
        })
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      const result = await supabase
        .from('monedas_config')
        .insert({
          empresa_id: DEFAULT_EMPRESA_ID,
          moneda_base: moneda_base || 'USD',
          monedas_activas: monedas_activas || ['USD'],
          margen_seguridad: margen_seguridad || 0.02,
          actualizar_automaticamente: actualizar_automaticamente ?? true
        })
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