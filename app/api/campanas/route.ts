import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { sendWhatsApp } from '@/lib/whatsapp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

function getAdmin() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdmin()
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const asesorId = searchParams.get('asesor_id')
    let query = supabase.from('campanas').select('*, asesor:asesores(id,nombre,email,telefono,whatsapp)').order('creado_en', { ascending: false })
    if (estado) query = query.eq('estado', estado)
    if (asesorId) query = query.eq('asesor_id', asesorId)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Agregar conteo de leads por campaña
    const campanasConLeads = await Promise.all((data || []).map(async (c: any) => {
      const { count } = await supabase.from('leads').select('id', { count: 'exact', head: true }).eq('campana_id', c.id)
      return { ...c, leads_count: count || 0 }
    }))
    return NextResponse.json({ success: true, data: campanasConLeads })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    const supabase = getAdmin()
    const body = await request.json()
    const {
      nombre, descripcion, asesor_id, tipo_captura,
      formulario_id, calendario_id, producto_id,
      notificar_email = true, notificar_whatsapp = false,
      emails_notificacion = [], whatsapp_notificacion = [],
      notion_database_id, notion_sync = false
    } = body
    const empresaId = auth?.empresaId || DEFAULT_EMPRESA_ID

    const { data, error } = await supabase.from('campanas').insert({
      empresa_id: empresaId, nombre, descripcion, asesor_id: asesor_id || null,
      tipo_captura: tipo_captura || 'solo_formulario',
      formulario_id: formulario_id || null, calendario_id: calendario_id || null,
      producto_id: producto_id || null, notificar_email, notificar_whatsapp,
      emails_notificacion, whatsapp_notificacion,
      notion_database_id, notion_sync, estado: 'activa'
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const supabase = getAdmin()
    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const allowed = ['nombre', 'descripcion', 'estado', 'asesor_id', 'tipo_captura',
      'formulario_id', 'calendario_id', 'producto_id', 'notificar_email', 'notificar_whatsapp',
      'emails_notificacion', 'whatsapp_notificacion', 'notion_database_id', 'notion_sync']
    const clean: Record<string, any> = {}
    for (const k of allowed) { if (k in updates) clean[k] = updates[k] }
    clean.actualizado_en = new Date().toISOString()

    const { data, error } = await supabase.from('campanas').update(clean).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request)
    if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    const supabase = getAdmin()
    const { error } = await supabase.from('campanas').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}