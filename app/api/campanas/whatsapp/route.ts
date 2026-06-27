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
  if (id) {
    const { data } = await supabase.from('whatsapp_campaigns').select('*, recipients:whatsapp_campaign_recipients(count)').eq('id', id).single()
    return NextResponse.json({ success: true, data })
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

  if (action === 'create') {
    const { data, error } = await supabase.from('whatsapp_campaigns').insert({
      empresa_id: auth.empresaId || DEFAULT_EMPRESA_ID,
      ...rest,
      created_by: auth.userId,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  if (action === 'start') {
    const campaignId = rest.id
    if (!campaignId) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    // Obtener campaña
    const { data: campaign } = await supabase.from('whatsapp_campaigns').select('*').eq('id', campaignId).single()
    if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 })

    // Obtener leads según filtro
    const filter = campaign.lead_filter || {}
    let query = supabase.from('leads').select('id,nombre,telefono').eq('empresa_id', auth.empresaId || DEFAULT_EMPRESA_ID)
    if (filter.estado) query = query.eq('estado', filter.estado)
    if (filter.etiquetas && Array.isArray(filter.etiquetas)) {
      query = query.overlaps('etiquetas', filter.etiquetas)
    }
    if (filter.campana_id) query = query.eq('campana_id', filter.campana_id)

    const { data: leads } = await query.limit(500)
    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, message: 'Sin leads para enviar', total: 0 })
    }

    // Preparar recipients con teléfonos limpios
    const variables = campaign.variables || {}
    const mensajes = campaign.mensajes || [campaign.mensaje || 'Hola']
    const recipients: any[] = []
    for (const lead of leads) {
      const phone = cleanPhone(lead.telefono)
      if (!phone || !isValidPhone(phone)) continue
      const msgTemplate = mensajes[Math.floor(Math.random() * mensajes.length)]
      const message = resolveVariables(msgTemplate, variables)
      recipients.push({ phone, lead_id: lead.id, message, status: 'pending' })
    }

    // Insertar recipients
    const { error: insError } = await supabase.from('whatsapp_campaign_recipients').insert(
      recipients.map(r => ({ campaign_id: campaignId, lead_id: r.lead_id, phone: r.phone, message: r.message }))
    )
    if (insError) return NextResponse.json({ error: insError.message }, { status: 500 })

    // Actualizar contador
    await supabase.from('whatsapp_campaigns').update({
      total_recipients: recipients.length,
      status: 'sending',
    }).eq('id', campaignId)

    // Iniciar envío en background (no bloqueamos la respuesta)
    processNextBatch(campaignId, 0)

    return NextResponse.json({ success: true, total: recipients.length, message: 'Envío iniciado' })
  }

  if (action === 'update') {
    const { id, ...updates } = rest
    const { error } = await supabase.from('whatsapp_campaigns').update({ ...updates, actualizado_en: new Date().toISOString() }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'pause') {
    await supabase.from('whatsapp_campaigns').update({ status: 'paused', actualizado_en: new Date().toISOString() }).eq('id', rest.id)
    return NextResponse.json({ success: true })
  }

  if (action === 'delete') {
    await supabase.from('whatsapp_campaigns').delete().eq('id', rest.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
}

async function processNextBatch(campaignId: string, offset: number) {
  const supabase = getAdmin()
  const BATCH_SIZE = 5

  try {
    const { data: recipients } = await supabase
      .from('whatsapp_campaign_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending')
      .order('id')
      .range(offset, offset + BATCH_SIZE - 1)

    if (!recipients || recipients.length === 0) {
      await supabase.from('whatsapp_campaigns').update({ status: 'completed', actualizado_en: new Date().toISOString() }).eq('id', campaignId)
      return
    }

    for (const r of recipients) {
      const { data: campaign } = await supabase.from('whatsapp_campaigns').select('*').eq('id', campaignId).single()
      if (campaign?.status === 'paused') return

      const result = await sendWhatsApp({
        number: r.phone,
        message: r.message,
        type: campaign?.media_url ? 'media' : 'text',
        media_url: campaign?.media_url || undefined,
        filename: campaign?.filename || undefined,
      })

      await supabase.from('whatsapp_campaign_recipients').update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        error: result.success ? null : String(result.error || 'Error'),
      }).eq('id', r.id)

      // Delay aleatorio entre mensajes
      const minDelay = (campaign?.min_delay_seconds || 30) * 1000
      const maxDelay = (campaign?.max_delay_seconds || 120) * 1000
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    // Incrementar sent_count y continuar
    const { data: current } = await supabase.from('whatsapp_campaigns').select('sent_count').eq('id', campaignId).single()
    const newCount = (current?.sent_count || 0) + recipients.length
    await supabase.from('whatsapp_campaigns').update({ sent_count: newCount }).eq('id', campaignId)

    // Procesar siguiente batch
    await processNextBatch(campaignId, offset + BATCH_SIZE)
  } catch (error) {
    console.error('[Bulk WhatsApp] Error:', error)
  }
}
