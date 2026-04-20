import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { EMPRESA_ID } from '@/app/superadmin/postulantes/_types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id') || EMPRESA_ID

    const { data, error } = await supabase
      .from('puestos_trabajo')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { nombre, slug, descripcion, activo, orden } = body

    if (!nombre) return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })

    const { data, error } = await supabase
      .from('puestos_trabajo')
      .insert({
        empresa_id: body.empresa_id || EMPRESA_ID,
        nombre,
        slug: slug || nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
        descripcion,
        activo: activo ?? true,
        orden: orden || 99,
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
      .from('puestos_trabajo')
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

    const { error } = await supabase.from('puestos_trabajo').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}