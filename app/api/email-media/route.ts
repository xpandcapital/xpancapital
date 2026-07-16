import { supabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const EMPRESA_ID = DEFAULT_EMPRESA_ID

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const categoria = searchParams.get('categoria')
  const tipo = searchParams.get('tipo')
  
  let query = supabase
    .from('email_media')
    .select('*')
    .eq('empresa_id', EMPRESA_ID)
    .order('creado_en', { ascending: false })
  
  if (categoria) query = query.eq('categoria', categoria)
  if (tipo) query = query.eq('tipo', tipo)
  
  const { data, error } = await query
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nombre, descripcion, url, tipo, categoria, tamano, ancho, alto } = body
  
  const { data, error } = await supabase
    .from('email_media')
    .insert([{
      empresa_id: EMPRESA_ID,
      nombre,
      descripcion,
      url,
      tipo: tipo || 'image',
      categoria: categoria || 'general',
      tamano,
      ancho,
      alto
    }])
    .select()
    .single()
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, nombre, descripcion, categoria } = body
  
  const { data, error } = await supabase
    .from('email_media')
    .update({ nombre, descripcion, categoria })
    .eq('id', id)
    .eq('empresa_id', EMPRESA_ID)
    .select()
    .single()
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  
  const { error } = await supabase
    .from('email_media')
    .delete()
    .eq('id', id)
    .eq('empresa_id', EMPRESA_ID)
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
