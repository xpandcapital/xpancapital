import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase()
    const { id } = await params

    const { data, error } = await supabase
      .from('niveles_cliente')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase()
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}

    const allowedFields = [
      'nombre', 'slug', 'color', 'icono', 'orden',
      'compras_minimas', 'coins_minimos', 'referidos_minimos', 'monto_minimo',
      'descuento_porcentaje', 'coins_bonus_porcentaje',
      'envio_gratis', 'soporte_prioritario', 'acceso_eventos',
      'comision_porcentaje', 'comision_tipo'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    const { data, error } = await supabase
      .from('niveles_cliente')
      .update(updateData)
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase()
    const { id } = await params

    const { error } = await supabase
      .from('niveles_cliente')
      .delete()
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}