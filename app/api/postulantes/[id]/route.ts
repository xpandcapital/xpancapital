import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()

    const { data, error } = await supabase
      .from('postulantes')
      .select('*, puesto:puestos_trabajo(id, nombre, slug)')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

const NON_COLUMNS = ['puesto', 'creado_en', 'actualizado_en']

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()
    const body = await request.json()

    const { id: _id, puesto: _puesto, creado_en: _c, actualizado_en: _a, ...updates } = body

    const { data, error } = await supabase
      .from('postulantes')
      .update(updates)
      .eq('id', id)
      .select('*, puesto:puestos_trabajo(id, nombre, slug)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()

    const { error } = await supabase.from('postulantes').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}