export const dynamic = 'force-dynamic'

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
    .select('id, email, nombre_mostrado, firma, departamento, avatar_url, color, plantilla_default_id, last_sync, creado_en, servidor_id, servidor:email_servidores(dominio,nombre)')
    .eq('user_id', auth.userId)
    .order('creado_en', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const cuentas = (data || []).map(c => ({
    id: c.id,
    email: c.email,
    nombre_mostrado: c.nombre_mostrado,
    departamento: c.departamento,
    avatar_url: c.avatar_url,
    color: c.color,
    firma: c.firma,
    plantilla_default_id: c.plantilla_default_id,
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
  const { id, nombre_mostrado, firma, departamento, avatar_url, color, plantilla_default_id } = body

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const updates: Record<string, unknown> = { actualizado_en: new Date().toISOString() }
  if (nombre_mostrado !== undefined) updates.nombre_mostrado = nombre_mostrado
  if (firma !== undefined) updates.firma = firma
  if (departamento !== undefined) updates.departamento = departamento
  if (avatar_url !== undefined) updates.avatar_url = avatar_url
  if (color !== undefined) updates.color = color
  if (plantilla_default_id !== undefined) updates.plantilla_default_id = plantilla_default_id

  const { data, error } = await supabase
    .from('email_cuentas')
    .update(updates)
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

