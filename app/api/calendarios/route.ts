import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const EMPRESA_ID = DEFAULT_EMPRESA_ID

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id') || EMPRESA_ID
    const tipo = searchParams.get('tipo')

    let query = supabase
      .from('calendarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('creado_en', { ascending: false })

    if (tipo) query = query.eq('tipo', tipo)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const empresaId = body.empresa_id || EMPRESA_ID

    const { data, error } = await supabase
      .from('calendarios')
      .insert({ ...body, empresa_id: empresaId })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}