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

    const { data: template } = await supabase
      .from('templates')
      .select('id, es_principal')
      .eq('id', id)
      .eq('empresa_id', DEFAULT_EMPRESA_ID)
      .single()

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template no encontrado' }, { status: 404 })
    }

    if (template.es_principal) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se puede desactivar el template principal. Primero asigna otro como principal.' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('templates')
      .update({
        estado: 'borrador',
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