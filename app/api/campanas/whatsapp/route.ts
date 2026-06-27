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

  // Recipients de una campaña
  if (id && searchParams.get('recipients') === 'true') {
    const { data } = await supabase.from('whatsapp_campaign_recipients').select('*').eq('campaign_id', id).order('id')
    return NextResponse.json({ success: true, recipients: data || [] })
  }

  if (id) {
    const { data } = await supabase.from('whatsapp_campaigns').select('*').eq('id', id).single()
    return NextResponse.json({ success: true, data })
  }

  if (action === 'count') {
    const source = searchParams.get('source') || 'leads'
    const filterJson = searchParams.get('filter')
    const filter = filterJson ? JSON.parse(filterJson) : {}
    const count = await getRecipientCount(supabase, source, filter, empresaId)
    return NextResponse.json({ success: true, count })
  }

  if (action === 'buyers') {
    const productoId = searchParams.get('producto_id')
    if (!productoId) return NextResponse.json({ success: true, buyers: [] })
    const buyers = await getProductBuyers(supabase, productoId, empresaId)
    return NextResponse.json({ success: true, buyers })
  }

  if (action === 'employees') {
    const rol = searchParams.get('rol')
    let q = supabase.from('profiles').select('id,nombre,email,telefono,rol').eq('empresa_id', empresaId).limit(200)
    if (rol) q = q.eq('rol', rol)
    const { data } = await q
    return NextResponse.json({ success: true, employees: data || [] })
  }

  // Plantillas guardadas
  if (action === 'variable_templates') {
    const { data } = await supabase.from('whatsapp_variable_templates').select('*').eq('empresa_id', empresaId).order('creado_en', { ascending: false })
    return NextResponse.json({ success: true, templates: data || [] })
  }
  if (action === 'message_templates') {
    const { data } = await supabase.from('whatsapp_message_templates').select('*').eq('empresa_id', empresaId).order('creado_en', { ascending: false })
    return NextResponse.json({ success: true, templates: data || [] })
  }
  if (action === 'phone_lists') {
    const { data } = await supabase.from('whatsapp_phone_lists').select('*').eq('empresa_id', empresaId).order('creado_en', { ascending: false })
    return NextResponse.json({ success: true, lists: data || [] })
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
    const variables = campaign.variables || {}
    const groups = campaign.message_groups || [{ texts: [campaign.mensaje || 'Hola'], media_url: campaign.media_url || null, filename: campaign.filename || null }]
    const delayBetweenMessages = campaign.delay_between_messages || 30

    // Obtener destinatarios según la fuente
    const recipients = await getRecipientsForSource(supabase, source, filter, empresaId, selectedIds)
    if (recipients.length === 0) {
      return NextResponse.json({ success: true, message: 'Sin destinatarios con teléfono válido', total: 0 })
    }

    // Crear una fila por grupo por cada teléfono
    const toInsert: any[] = []
    for (const r of recipients) {
      const phone = cleanPhone(r.telefono)
      if (!phone || !isValidPhone(phone)) continue
      for (let gIdx = 0; gIdx < groups.length; gIdx++) {
        const g = groups[gIdx]
        const texts = g.texts || [g.text || 'Hola']
        const msgTemplate = texts[Math.floor(Math.random() * texts.length)]
        const message = resolveVariables(msgTemplate, variables)
        toInsert.push({
          campaign_id: campaignId, lead_id: r.lead_id || null, phone, message,
          group_index: gIdx, media_url: g.media_url || null, filename: g.filename || null,
          status: 'pending',
        })
      }
    }

    if (toInsert.length === 0) {
      const hint = source === 'empleados' ? 'Los empleados no tienen teléfono en su perfil.'
        : source === 'clientes' ? 'Los clientes no tienen teléfono registrado.'
        : 'Ningún número tiene formato válido (+51999999999).'
      return NextResponse.json({ success: false, error: hint })
    }

    await supabase.from('whatsapp_campaign_recipients').insert(toInsert)
    const totalRecipients = new Set(toInsert.map(r => r.phone)).size
    await supabase.from('whatsapp_campaigns').update({
      total_recipients: toInsert.length,
      status: 'sending',
      delay_between_messages: delayBetweenMessages,
    }).eq('id', campaignId)

    const result = await processOneBatch(campaignId)
    return NextResponse.json({ success: true, total: toInsert.length, batches: groups.length, batch: result, message: 'Envío iniciado' })
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
    const allowed = ['nombre', 'message_groups', 'variables', 'min_delay_seconds', 'max_delay_seconds', 'delay_between_messages', 'lead_filter']
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

  if (action === 'duplicate') {
    const original = await supabase.from('whatsapp_campaigns').select('*').eq('id', rest.id).single()
    if (!original.data) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })
    const { id, creado_en, actualizado_en, sent_count, total_recipients, delivered_count, read_count, status, ...copy } = original.data
    const { data, error } = await supabase.from('whatsapp_campaigns').insert({
      ...copy, nombre: `Copia de ${copy.nombre}`, status: 'draft', sent_count: 0, total_recipients: 0, delivered_count: 0, read_count: 0,
      created_by: auth.userId,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  // Guardar plantillas
  if (action === 'save_variables') {
    const { nombre, variables } = rest
    const { error } = await supabase.from('whatsapp_variable_templates').insert({ empresa_id: empresaId, nombre, variables, created_by: auth.userId })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }
  if (action === 'save_message_template') {
    const { nombre, message_groups } = rest
    const { error } = await supabase.from('whatsapp_message_templates').insert({ empresa_id: empresaId, nombre, message_groups, created_by: auth.userId })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }
  if (action === 'save_phone_list') {
    const { nombre, phones } = rest
    const { error } = await supabase.from('whatsapp_phone_lists').upsert({ empresa_id: empresaId, nombre, phones, created_by: auth.userId, actualizado_en: new Date().toISOString() }, { onConflict: 'nombre,empresa_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
}

// ── Helpers ──

async function getRecipientsForSource(supabase: any, source: string, filter: any, empresaId: string, selectedIds: string[] | null): Promise<{ telefono: string; lead_id?: string }[]> {
  if (source === 'manual' || source === 'csv' || source === 'phone_list') {
    const phones: string[] = filter.manual_phones || filter.csv_phones || filter.phones || []
    return phones.map((p: string) => ({ telefono: p }))
  }
  if (source === 'clientes') {
    let q = supabase.from('profiles').select('id, telefono, email, nombre').eq('empresa_id', empresaId).not('telefono', 'is', null)
    if (filter.producto_id) {
      const buyers = await getProductBuyers(supabase, filter.producto_id, empresaId)
      if (buyers.length === 0) return []
      const ids = buyers.map((b: any) => b.id)
      if (selectedIds && selectedIds.length > 0) {
        q = q.in('id', ids.filter((id: string) => selectedIds.includes(id)))
      } else { q = q.in('id', ids) }
    }
    const { data } = await q.limit(500)
    return (data || []).map((p: any) => ({ telefono: p.telefono, lead_id: undefined }))
  }
  if (source === 'empleados') {
    let q = supabase.from('profiles').select('id, telefono').eq('empresa_id', empresaId).not('telefono', 'is', null)
    if (filter.rol) q = q.eq('rol', filter.rol)
    if (selectedIds && selectedIds.length > 0) q = q.in('id', selectedIds)
    const { data } = await q.limit(500)
    return (data || []).map((p: any) => ({ telefono: p.telefono, lead_id: undefined }))
  }
  // Default: leads
  let q = supabase.from('leads').select('id,nombre,telefono').eq('empresa_id', empresaId)
  if (filter.estado) q = q.eq('estado', filter.estado)
  if (filter.campana_id) q = q.eq('campana_id', filter.campana_id)
  if (selectedIds && selectedIds.length > 0) q = q.in('id', selectedIds)
  const { data } = await q.limit(500)
  return (data || []).map((l: any) => ({ telefono: l.telefono, lead_id: l.id }))
}

async function getRecipientCount(supabase: any, source: string, filter: any, empresaId: string): Promise<number> {
  const recipients = await getRecipientsForSource(supabase, source, filter, empresaId, null)
  return recipients.filter(r => { const p = cleanPhone(r.telefono); return p && isValidPhone(p) }).length
}

async function getProductBuyers(supabase: any, productoId: string, empresaId: string) {
  const { data: compras } = await supabase.from('compras').select('user_id, id').eq('empresa_id', empresaId).eq('estado', 'completado').not('user_id', 'is', null).limit(1000)
  if (!compras || compras.length === 0) return []
  const compraIds = compras.map((c: any) => c.id)
  const { data: items } = await supabase.from('compra_items').select('compra_id').eq('producto_id', productoId).in('compra_id', compraIds).limit(500)
  if (!items || items.length === 0) return []
  const matchingIds = [...new Set(compras.filter((c: any) => items.some((i: any) => i.compra_id === c.id)).map((c: any) => c.user_id))]
  const { data: profiles } = await supabase.from('profiles').select('id, nombre, email, telefono').in('id', matchingIds).limit(500)
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
    const { count: totalSent } = await supabase.from('whatsapp_campaign_recipients').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId).eq('status', 'sent')
    const newStatus = (totalSent || 0) > 0 ? 'completed' : 'failed'
    await supabase.from('whatsapp_campaigns').update({ status: newStatus, actualizado_en: new Date().toISOString() }).eq('id', campaignId)
    return { remaining: 0, sentBatch: 0, done: true }
  }

  const { data: campaign } = await supabase.from('whatsapp_campaigns').select('*').eq('id', campaignId).single()
  const isLastGroup = (r: any) => {
    const groups = campaign?.message_groups || []
    return r.group_index >= groups.length - 1
  }

  for (const r of recipients) {
    const hasMedia = r.media_url && r.media_url !== 'null'
    const result = await sendWhatsApp({
      number: r.phone,
      message: r.message,
      type: hasMedia ? 'media' : 'text',
      media_url: hasMedia ? r.media_url : undefined,
      filename: r.filename || undefined,
      empresaId: DEFAULT_EMPRESA_ID,
    })
    await supabase.from('whatsapp_campaign_recipients').update({
      status: result.success ? 'sent' : 'failed',
      sent_at: result.success ? new Date().toISOString() : null,
      error: result.success ? null : (typeof result.data === 'string' ? result.data : JSON.stringify(result.data || result.error || 'Error')).substring(0, 500),
    }).eq('id', r.id)

    // Delay entre mensajes del mismo número (solo si no es el último grupo)
    if (!isLastGroup(r)) {
      const d = Math.max(3, campaign?.delay_between_messages || 30) * 1000
      await new Promise(resolve => setTimeout(resolve, Math.min(d, 120000)))
    }
    // Delay entre números (delay normal)
    if (isLastGroup(r) && recipients.length > 1) {
      const minD = Math.max(3, campaign?.min_delay_seconds || 30) * 1000
      const maxD = Math.max(minD + 5000, (campaign?.max_delay_seconds || 120) * 1000)
      const delay = Math.floor(Math.random() * (maxD - minD + 1)) + minD
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 120000)))
    }
  }

  const { data: current } = await supabase.from('whatsapp_campaigns').select('sent_count').eq('id', campaignId).single()
  const newCount = (current?.sent_count || 0) + recipients.length
  await supabase.from('whatsapp_campaigns').update({ sent_count: newCount }).eq('id', campaignId)

  const { count } = await supabase.from('whatsapp_campaign_recipients').select('id', { count: 'exact', head: true }).eq('campaign_id', campaignId).eq('status', 'pending')
  return { remaining: count || 0, sentBatch: recipients.length, done: (count || 0) === 0 }
}
