import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('email_cuentas')
    .select('id, email, nombre_mostrado, firma, last_sync, creado_en, servidor_id, servidor:email_servidores(dominio,nombre)')
    .eq('user_id', auth.userId)
    .order('creado_en', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const cuentas = (data || []).map(c => ({
    id: c.id,
    email: c.email,
    nombre_mostrado: c.nombre_mostrado,
    firma: c.firma,
    last_sync: c.last_sync,
    creado_en: c.creado_en,
    dominio: (c as any).servidor?.dominio || '',
    servidor_nombre: (c as any).servidor?.nombre || '',
  }))

  return NextResponse.json(cuentas)
}

export async function PUT(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json()
  const { id, nombre_mostrado, firma } = body

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { data, error } = await supabase
    .from('email_cuentas')
    .update({ nombre_mostrado, firma })
    .eq('id', id)
    .eq('user_id', auth.userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const { error } = await supabase
    .from('email_cuentas')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
