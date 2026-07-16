import { supabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const EMPRESA_ID = DEFAULT_EMPRESA_ID

export async function GET() {
  const { data, error } = await supabase
    .from('email_senders')
    .select('*')
    .eq('empresa_id', EMPRESA_ID)
    .order('is_default', { ascending: false })
    .order('creado_en', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nombre, from_name, from_email, provider, smtp_host, smtp_port, smtp_user, smtp_pass, api_key, is_default } = body

  if (is_default) {
    await supabase
      .from('email_senders')
      .update({ is_default: false })
      .eq('empresa_id', EMPRESA_ID)
  }

  const { data, error } = await supabase
    .from('email_senders')
    .insert([{
      empresa_id: EMPRESA_ID,
      nombre,
      from_name,
      from_email,
      provider: provider || 'smtp',
      smtp_host,
      smtp_port: smtp_port ||465,
      smtp_user,
      smtp_pass,
      api_key,
      is_default: is_default || false
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  // Only update provided fields
  const allowedFields = ['nombre', 'from_name', 'from_email', 'provider', 
                         'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 
                         'api_key', 'is_default']
  const filteredUpdates: Record<string, unknown> = {}
  
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key]
    }
  }
  
  if (Object.keys(filteredUpdates).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
  }

  if (updates.is_default) {
    await supabase
      .from('email_senders')
      .update({ is_default: false })
      .eq('empresa_id', EMPRESA_ID)
  }

  const { data, error } = await supabase
    .from('email_senders')
    .update(filteredUpdates)
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
    .from('email_senders')
    .delete()
    .eq('id', id)
    .eq('empresa_id', EMPRESA_ID)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
