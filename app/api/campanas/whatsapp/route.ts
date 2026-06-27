import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthUser } from '@/lib/supabase/api-auth'
import { cleanPhone, isValidPhone } from '@/lib/phone'
import { sendWhatsApp } from '@/lib/whatsapp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

function getAdmin() { return createClient(supabaseUrl, supabaseServiceKey) }

function resolveVariables(text: string, variables: Record<string, string[]>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => {
    const options = variables[key]
    if (!options || options.length === 0) return `{${key}}`
    return options[Math.floor(Math.random() * options.length)]
  })
}

export async function GET(request: NextRequest) {
  const supabase = getAdmin()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const action = searchParams.get('action')
  const empresaId = searchParams.get('empresa_id') || DEFAULT_EMPRESA_ID

  if (id) {
    const { data } = await supabase.from('whatsapp_campaigns').select('*').eq('id', id).single()
    return NextResponse.json({ success: true, data })
  }

  // Count endpoint
  if (action === 'count') {
    const source = searchParams.get('source') || 'leads'
    const filterJson = searchParams.get('filter')
    const filter = filterJson ? JSON.parse(filterJson) : {}
    const count = await getRecipientCount(supabase, source, filter, empresaId)
    return NextResponse.json({ success: true, count })
  }

  // List buyers of a product
  if (action === 'buyers') {
    const productoId = searchParams.get('producto_id')
    if (!productoId) return NextResponse.json({ success: true, buyers: [] })
    const buyers = await getProductBuyers(supabase, productoId, empresaId)
    return NextResponse.json({ success: true, buyers })
  }

  // List employees by role
  if (action === 'employees') {
    const rol = searchParams.get('rol')
    let query = supabase.from('profiles').select('id,nombre,email,telefono,rol').eq('empresa_id', empresaId).limit(200)
    if (rol) query = query.eq('rol', rol)
    const { data } = await query
    return NextResponse.json({ success: true, employees: data || [] })
  }

  const { data } = await supabase.from('whatsapp_campaigns').select('*').order('creado_en', { ascending: false })
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const supabase = getAdmin()
  const body = await request.json()
  const { action, ...rest } = body
  const empresaId = auth.empresaId || DEFAULT_EMPRESA_ID

  if (action === 'create') {
    const { data, error } = await supabase.from('whatsapp_campaigns').insert({
      empresa_id: empresaId, ...rest, created_by: auth.userId,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  if (action === 'start') {
    const campaignId = rest.id
    if (!campaignId) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const { data: campaign } = await supabase.from('whatsapp_campaigns').select('*').eq('id', campaignId).single()
    if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })

    const filter = campaign.lead_filter || {}
    const source = filter.source || 'leads'
    const selectedIds = filter.selected_ids || null

    // Obtener destinatarios según la fuente
    const recipients = await getRecipientsForSource(supabase, source, filter, empresaId, selectedIds)
    if (recipients.length === 0) {
      return NextResponse.json({ success: true, message: 'Sin destinatarios con teléfono válido', total: 0 })
    }

    // Preparar e insertar recipients
    const variables = campaign.variables || {}
    const mensajes = campaign.mensajes || [campaign.mensaje || 'Hola']
    const toInsert: any[] = []

    for (const r of recipients) {
      const phone = cleanPhone(r.telefono)
      if (!phone || !isValidPhone(phone)) continue
      const msgTemplate = mensajes[Math.floor(Math.random() * mensajes.length)]
      const message = resolveVariables(msgTemplate, variables)
      toInsert.push({ campaign_id: campaignId, lead_id: r.lead_id || null, phone, message, status: 'pending' })
    }

    if (toInsert.length === 0) {
      return NextResponse.json({ success: false, error: 'Ningún destinatario tiene teléfono válido. Agrega números de teléfono a los contactos.' })
    }

    await supabase.from('whatsapp_campaign_recipients').insert(toInsert)
    await supabase.from('whatsapp_campaigns').update({ total_recipients: toInsert.length, status: 'sending' }).eq('id', campaignId)

    // Procesar primer batch inmediatamente
    const result = await processOneBatch(campaignId)

    return NextResponse.json({ success: true, total: toInsert.length, batch: result, message: 'Envío iniciado' })
  }

  if (action === 'process_batch') {
    const campaignId = rest.id
    if (!campaignId) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    const result = await processOneBatch(campaignId)
    return NextResponse.json({ success: true, ...result })
  }

  if (action === 'update') {
    const { id, ...updates } = rest
    const clean: any = {}
    const allowed = ['nombre', 'mensajes', 'variables', 'media_url', 'filename', 'min_delay_seconds', 'max_delay_seconds', 'lead_filter']
    for (const k of allowed) { if (k in updates) clean[k] = updates[k] }
    clean.actualizado_en = new Date().toISOString()
    const { error } = await supabase.from('whatsapp_campaigns').update(clean).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'pause') {
    await supabase.from('whatsapp_campaigns').update({ status: 'paused' }).eq('id', rest.id)
    return NextResponse.json({ success: true })
  }

  if (action === 'delete') {
    await supabase.from('whatsapp_campaigns').delete().eq('id', rest.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
}

// ── Helpers ──

async function getRecipientsForSource(supabase: any, source: string, filter: any, empresaId: string, selectedIds: string[] | null): Promise<{ telefono: string; lead_id?: string }[]> {
  // Manual phones
  if (source === 'manual' || source === 'csv') {
    const phones: string[] = filter.manual_phones || filter.csv_phones || []
    return phones.map((p: string) => ({ telefono: p }))
  }

  // Clients → query profiles with purchases of a product
  if (source === 'clientes') {
    let query = supabase.from('profiles').select('id, telefono, email, nombre').eq('empresa_id', empresaId).not('telefono', 'is', null)
    if (filter.producto_id) {
      const { data: buyers } = await getProductBuyers(supabase, filter.producto_id, empresaId)
      if ((buyers as any[]).length === 0) return []
      const ids = (buyers as any[]).map((b: any) => b.id)
      if (selectedIds && selectedIds.length > 0) {
        // Filtrar solo los seleccionados
        const filteredIds = ids.filter((id: string) => selectedIds.includes(id))
        if (filteredIds.length === 0) query = supabase.from('profiles').select('id, telefono').eq('id', '')
        else query = query.in('id', filteredIds)
      } else {
        query = query.in('id', ids)
      }
    }
    if (filter.producto_categoria) {
      // Append: buscar por nombre de categoría en compras (simplificado)
    }
    const { data } = await query.limit(500)
    return (data || []).map((p: any) => ({ telefono: p.telefono, lead_id: undefined }))
  }

  // Employees → query profiles by role
  if (source === 'empleados') {
    let query = supabase.from('profiles').select('id, telefono').eq('empresa_id', empresaId).not('telefono', 'is', null)
    if (filter.rol) query = query.eq('rol', filter.rol)
    if (selectedIds && selectedIds.length > 0) query = query.in('id', selectedIds)
    const { data } = await query.limit(500)
    return (data || []).map((p: any) => ({ telefono: p.telefono, lead_id: undefined }))
  }

  // Default: leads
  let query = supabase.from('leads').select('id,nombre,telefono').eq('empresa_id', empresaId)
  if (filter.estado) query = query.eq('estado', filter.estado)
  if (filter.campana_id) query = query.eq('campana_id', filter.campana_id)
  if (selectedIds && selectedIds.length > 0) query = query.in('id', selectedIds)
  const { data } = await query.limit(500)
  return (data || []).map((l: any) => ({ telefono: l.telefono, lead_id: l.id }))
}

async function getRecipientCount(supabase: any, source: string, filter: any, empresaId: string): Promise<number> {
  const recipients = await getRecipientsForSource(supabase, source, filter, empresaId, null)
  return recipients.filter(r => {
    const p = cleanPhone(r.telefono)
    return p && isValidPhone(p)
  }).length
}

async function getProductBuyers(supabase: any, productoId: string, empresaId: string) {
  const { data: compras } = await supabase
    .from('compras')
    .select('user_id, id')
    .eq('empresa_id', empresaId)
    .eq('estado', 'completado')
    .not('user_id', 'is', null)
    .limit(1000)

  if (!compras || compras.length === 0) return []

  const compraIds = compras.map((c: any) => c.id)

  // Find which compras contain this product
  const { data: items } = await supabase
    .from('compra_items')
    .select('compra_id')
    .eq('producto_id', productoId)
    .in('compra_id', compraIds)
    .limit(500)

  if (!items || items.length === 0) return []

  const matchingCompraIds = [...new Set(items.map((i: any) => i.compra_id))]
  const matchingUserIds = [...new Set(compras.filter((c: any) => matchingCompraIds.includes(c.id)).map((c: any) => c.user_id))]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nombre, email, telefono')
    .in('id', matchingUserIds)
    .limit(500)

  return profiles || []
}

async function processOneBatch(campaignId: string) {
  const supabase = getAdmin()
  const BATCH_SIZE = 5

  const { data: recipients } = await supabase
    .from('whatsapp_campaign_recipients')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .order('id')
    .limit(BATCH_SIZE)

  if (!recipients || recipients.length === 0) {
    // Verificar si TODOS los recipients fallaron
    const { count: totalSent } = await supabase.from('whatsapp_campaign_recipients').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId).eq('status', 'sent')
    const newStatus = (totalSent || 0) > 0 ? 'completed' : 'failed'
    await supabase.from('whatsapp_campaigns').update({ status: newStatus, actualizado_en: new Date().toISOString() }).eq('id', campaignId)
    return { remaining: 0, sentBatch: 0, done: true }
  }

  const { data: campaign } = await supabase.from('whatsapp_campaigns').select('*').eq('id', campaignId).single()

  for (const r of recipients) {
    const result = await sendWhatsApp({
      number: r.phone,
      message: r.message,
      type: campaign?.media_url ? 'media' : 'text',
      media_url: campaign?.media_url || undefined,
      filename: campaign?.filename || undefined,
      empresaId: DEFAULT_EMPRESA_ID,
    })
    await supabase.from('whatsapp_campaign_recipients').update({
      status: result.success ? 'sent' : 'failed',
      sent_at: result.success ? new Date().toISOString() : null,
      error: result.success ? null : String(result.error || 'Error'),
    }).eq('id', r.id)
  }

  // Update sent_count
  const { data: current } = await supabase.from('whatsapp_campaigns').select('sent_count').eq('id', campaignId).single()
  const newCount = (current?.sent_count || 0) + recipients.length
  await supabase.from('whatsapp_campaigns').update({ sent_count: newCount }).eq('id', campaignId)

  // Count remaining pending
  const { count } = await supabase.from('whatsapp_campaign_recipients').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId).eq('status', 'pending')

  return { remaining: count || 0, sentBatch: recipients.length, done: (count || 0) === 0 }
}
