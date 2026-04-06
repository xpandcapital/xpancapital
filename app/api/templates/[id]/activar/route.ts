import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabase()
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const { es_principal = false } = body

    const { data: template } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template no encontrado' }, { status: 404 })
    }

    if (es_principal) {
      await supabase
        .from('templates')
        .update({ es_principal: false })
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .eq('tipo_contenido', template.tipo_contenido)
        .eq('es_principal', true)
    }

    const { data, error } = await supabase
      .from('templates')
      .update({
        estado: 'activo',
        es_principal: es_principal,
        publicado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })
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