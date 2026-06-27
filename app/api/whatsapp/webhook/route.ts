import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

function getAdmin() { return createClient(supabaseUrl, supabaseServiceKey) }

/**
 * Webhook receptor de Planifyx WhatsApp.
 * Configurar en Planifyx: POST /api/set_webhook?webhook_url=https://www.blis-corp.com/api/whatsapp/webhook&enable=true&instance_id=TU_ID&access_token=TU_TOKEN
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getAdmin()

    // Planifyx envía diferentes estructuras según el evento
    const eventType = detectEventType(body)
    const empresaId = DEFAULT_EMPRESA_ID

    const message: Record<string, any> = {
      empresa_id: empresaId,
      instance_id: body.instance_id || null,
      event_type: eventType,
      raw_payload: body,
    }

    // Extraer datos del mensaje según el tipo de evento
    if (eventType === 'message') {
      const msg = body.message || body.messages?.[0] || body
      message.from_number = body.from || body.sender || msg?.from || msg?.author?.split('@')[0] || null
      message.to_number = body.to || body.receiver || msg?.to || null
      message.message_type = msg?.type || body.type || 'text'
      message.body = msg?.text?.body || msg?.body || body.text || body.caption || null
      message.caption = msg?.image?.caption || msg?.video?.caption || msg?.document?.caption || null
      message.media_url = msg?.image?.url || msg?.video?.url || msg?.document?.url || msg?.audio?.url || null
      message.media_mime = msg?.image?.mime_type || msg?.video?.mime_type || msg?.document?.mime_type || null
    } else if (eventType === 'sent' || eventType === 'delivered' || eventType === 'read') {
      message.from_number = body.to || body.recipient || null
    } else if (eventType === 'connected' || eventType === 'disconnected') {
      message.body = body.message || `WhatsApp ${eventType}`
    } else if (eventType === 'battery') {
      message.body = `Batería: ${body.battery || body.percent || '?'}%`
    }

    const { error } = await supabase.from('whatsapp_messages').insert(message)
    if (error) {
      console.error('[WhatsApp Webhook] Error guardando:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Responder a Planifyx (siempre 200 para evitar reintentos)
    return NextResponse.json({ success: true, event: eventType })
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error)
    return NextResponse.json({ success: true }, { status: 200 })
  }
}

function detectEventType(body: Record<string, any>): string {
  // Planifyx envía el tipo en diferentes campos según la versión de API
  if (body.event) return body.event
  if (body.status) return body.status
  if (body.ack) return body.ack === 1 ? 'sent' : body.ack === 2 ? 'delivered' : body.ack === 3 ? 'read' : 'unknown'
  if (body.type === 'message' || body.messages || body.message || body.body || body.text) return 'message'
  if (body.type === 'battery' || body.battery !== undefined) return 'battery'
  if (body.type === 'qr' || body.qrcode) return 'qr'
  if (body.connected !== undefined) return body.connected ? 'connected' : 'disconnected'
  return 'unknown'
}

/**
 * GET: verificar que el webhook está activo (para testing)
 */
export async function GET() {
  return NextResponse.json({ status: 'active', webhook: 'WhatsApp Planifyx Webhook' })
}
