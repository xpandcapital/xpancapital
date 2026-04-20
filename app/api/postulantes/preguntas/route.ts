import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { EMPRESA_ID } from '@/app/superadmin/postulantes/_types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id') || EMPRESA_ID

    const { data, error } = await supabase
      .from('preguntas')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('grupo', { ascending: true })
      .order('orden', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { key, label_base, tipo, grupo, orden, placeholder, texto_apoyo, opciones, requerido, visible_formulario, visible_admin } = body

    if (!key || !label_base) {
      return NextResponse.json({ error: 'Key y label_base son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('preguntas')
      .insert({
        empresa_id: body.empresa_id || EMPRESA_ID,
        key,
        label_base,
        tipo: tipo || 'text',
        grupo: grupo || 'Datos Personales y Contacto',
        orden: orden || 99,
        placeholder,
        texto_apoyo,
        opciones: opciones || [],
        requerido: requerido ?? false,
        visible_formulario: visible_formulario ?? true,
        visible_admin: visible_admin ?? true,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })

    const { data, error } = await supabase
      .from('preguntas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })

    await supabase.from('puesto_preguntas').delete().eq('pregunta_id', id)
    await supabase.from('postulante_respuestas').delete().eq('pregunta_id', id)

    const { error } = await supabase.from('preguntas').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}