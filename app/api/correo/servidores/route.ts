import { supabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, isAdmin } from '@/lib/supabase/api-auth'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('email_servidores')
    .select('*')
    .eq('empresa_id', auth.empresaId)
    .order('creado_en', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth || !isAdmin(auth)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await request.json()
  const { nombre, dominio, imap_host, imap_port, imap_secure, smtp_host, smtp_port, smtp_secure } = body

  if (!nombre || !dominio || !imap_host || !smtp_host) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('email_servidores')
    .insert([{
      empresa_id: auth.empresaId,
      nombre,
      dominio,
      imap_host,
      imap_port: imap_port || 993,
      imap_secure: imap_secure !== false,
      smtp_host,
      smtp_port: smtp_port || 465,
      smtp_secure: smtp_secure !== false,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth || !isAdmin(auth)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const allowed = ['nombre', 'dominio', 'imap_host', 'imap_port', 'imap_secure', 'smtp_host', 'smtp_port', 'smtp_secure']
  const filtered: Record<string, unknown> = {}
  for (const key of allowed) {
    if (updates[key] !== undefined) filtered[key] = updates[key]
  }

  const { data, error } = await supabase
    .from('email_servidores')
    .update(filtered)
    .eq('id', id)
    .eq('empresa_id', auth.empresaId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth || !isAdmin(auth)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { error } = await supabase
    .from('email_servidores')
    .delete()
    .eq('id', id)
    .eq('empresa_id', auth.empresaId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

