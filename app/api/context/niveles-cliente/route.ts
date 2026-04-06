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
      .from('niveles_cliente')
      .select('*')
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .order('orden', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const {
      nombre,
      slug,
      color = '#6B7280',
      icono = 'Award',
      orden = 0,
      compras_minimas = 0,
      coins_minimos = 0,
      referidos_minimos = 0,
      monto_minimo = 0,
      descuento_porcentaje = 0,
      coins_bonus_porcentaje = 0,
      envio_gratis = false,
      soporte_prioritario = false,
      acceso_eventos = false,
      comision_porcentaje = 0,
      comision_tipo = 'porcentaje'
    } = body

    if (!nombre) {
      return NextResponse.json({ success: false, error: 'El nombre es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('niveles_cliente')
      .insert({
        empresa_id: DEFAULT_EMPRESA_ID,
        nombre,
        slug: slug || nombre.toLowerCase().replace(/\s+/g, '-'),
        color,
        icono,
        orden,
        compras_minimas,
        coins_minimos,
        referidos_minimos,
        monto_minimo,
        descuento_porcentaje,
        coins_bonus_porcentaje,
        envio_gratis,
        soporte_prioritario,
        acceso_eventos,
        comision_porcentaje,
        comision_tipo
      })
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