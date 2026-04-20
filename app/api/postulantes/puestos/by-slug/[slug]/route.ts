import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = createClient()

    const { data: puesto, error: puestoError } = await supabase
      .from('puestos_trabajo')
      .select('*')
      .eq('slug', slug)
      .eq('activo', true)
      .single()

    if (puestoError || !puesto) {
      return NextResponse.json({ error: 'Puesto no encontrado' }, { status: 404 })
    }

    const { data: preguntas, error: preguntasError } = await supabase
      .from('puesto_preguntas')
      .select('*, pregunta:preguntas(*)')
      .eq('puesto_id', puesto.id)
      .eq('visible_formulario', true)
      .order('orden', { ascending: true })

    if (preguntasError) {
      return NextResponse.json({ error: preguntasError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { puesto, preguntas } })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}