import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/postulantes/puestos/[id]/preguntas - get questions for a puesto with customization
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()

    const { data, error } = await supabase
      .from('puesto_preguntas')
      .select('*, pregunta:preguntas(*)')
      .eq('puesto_id', id)
      .order('orden', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

// PUT /api/postulantes/puestos/[id]/preguntas - bulk sync questions for a puesto
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient()
    const body = await request.json()
    const { questions } = body as { questions: Array<{ pregunta_id: string; label_publico?: string; texto_apoyo_publico?: string; orden: number; requerido: boolean; visible_formulario: boolean }> }

    // Delete existing
    await supabase.from('puesto_preguntas').delete().eq('puesto_id', id)

    // Insert new
    if (questions && questions.length > 0) {
      const rows = questions.map(q => ({
        puesto_id: id,
        pregunta_id: q.pregunta_id,
        label_publico: q.label_publico || null,
        texto_apoyo_publico: q.texto_apoyo_publico || null,
        orden: q.orden,
        requerido: q.requerido ?? false,
        visible_formulario: q.visible_formulario ?? true,
      }))

      const { data, error } = await supabase.from('puesto_preguntas').insert(rows).select()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ success: true, data: [] })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}