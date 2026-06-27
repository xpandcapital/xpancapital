import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DEFAULT_EMPRESA_ID = '6186f014-c8c7-4027-9f08-8acf2bae3eae'

function getAdmin() { return createClient(supabaseUrl, supabaseServiceKey) }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getAdmin()
    const empresaId = DEFAULT_EMPRESA_ID

    // Planifyx envuelve todo en data.data[0]
    const wrapper = body.data || body
    const entries = Array.isArray(wrapper.data) ? wrapper.data : (body.messages || body.data || [body])
    const instanceId = body.instance_id || wrapper.instance_id || null

    const messages: Record<string, any>[] = []

    for (const entry of entries) {
      const key = entry.key || entry
      const update = entry.update || {}
      const msg = entry.message || entry

      // Extraer número limpio (quitar @s.whatsapp.net, @lid, @hosted.lid, @g.us, @c.us, y sufijos :99, :11)
      const rawJid = key.remoteJid || entry.remoteJid || body.remoteJid || ''
      const cleanNumber = rawJid
        .replace(/:(\d+)$/, '')
        .replace(/@(s\.whatsapp\.net|hosted\.lid|lid|g\.us|c\.us|broadcast)$/, '')
      const isGroup = rawJid.includes('@g.us')

      // Determinar tipo de evento
      const event = wrapper.event || body.event || ''
      let eventType = 'unknown'
      let messageType = 'text'
      let body_text = null
      let caption = null

      if (event === 'messages.upsert') {
        if (key.fromMe) {
          eventType = 'sent'
        } else if (msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage || msg.videoMessage || msg.documentMessage || msg.audioMessage) {
          eventType = 'message'
          if (msg.conversation) {
            messageType = 'text'
            body_text = msg.conversation
          } else if (msg.extendedTextMessage) {
            messageType = 'text'
            body_text = msg.extendedTextMessage.text
          } else if (msg.imageMessage) {
            messageType = 'image'
            caption = msg.imageMessage.caption || null
            body_text = caption || '[Imagen]'
          } else if (msg.videoMessage) {
            messageType = 'video'
            caption = msg.videoMessage.caption || null
            body_text = caption || '[Video]'
          } else if (msg.documentMessage) {
            messageType = 'document'
            caption = msg.documentMessage.fileName || msg.documentMessage.caption || null
            body_text = caption || '[Documento]'
          } else if (msg.audioMessage) {
            messageType = 'audio'
            body_text = '[Audio]'
          } else if (msg.locationMessage) {
            messageType = 'location'
            body_text = '[Ubicación]'
          } else if (msg.contactMessage) {
            messageType = 'contact'
            body_text = '[Contacto]'
          } else if (msg.stickerMessage) {
            messageType = 'sticker'
            body_text = '[Sticker]'
          } else if (msg.reactionMessage) {
            messageType = 'reaction'
            body_text = msg.reactionMessage.text || '[Reacción]'
          } else {
            body_text = '[Mensaje no soportado]'
          }
        } else {
          eventType = 'message'
          body_text = JSON.stringify(msg).substring(0, 500)
        }
      } else if (event === 'messages.update') {
        const status = update.status
        if (status === 1) eventType = 'server_ack'
        else if (status === 2) eventType = 'delivered'
        else if (status === 3) eventType = 'read'
        else if (status === 4) eventType = 'played'
        else eventType = `status_${status}`
      } else if (event === 'connection.update' || body.connected !== undefined) {
        eventType = body.connected !== false ? 'connected' : 'disconnected'
        body_text = body.connected !== false ? 'WhatsApp conectado' : 'WhatsApp desconectado'
      } else if (event === 'battery') {
        eventType = 'battery'
        body_text = `Batería: ${body.battery || body.percent || '?'}%`
      } else {
        eventType = event || 'unknown'
      }

      messages.push({
        empresa_id: empresaId,
        instance_id: instanceId,
        event_type: eventType,
        from_number: key.fromMe ? cleanNumber : (isGroup ? cleanNumber : cleanNumber),
        to_number: key.fromMe ? (isGroup ? cleanNumber : '') : (cleanNumber || null),
        message_type: messageType,
        body: body_text,
        caption: caption,
        media_url: msg?.imageMessage?.url || msg?.videoMessage?.url || msg?.documentMessage?.url || msg?.audioMessage?.url || null,
        media_mime: msg?.imageMessage?.mimetype || msg?.videoMessage?.mimetype || msg?.documentMessage?.mimetype || msg?.audioMessage?.mimetype || null,
        raw_payload: entry,
        processed: false,
      })
    }

    if (messages.length > 0) {
      const { error } = await supabase.from('whatsapp_messages').insert(messages)
      if (error) console.error('[WhatsApp Webhook] Error guardando:', error)
    }

    return NextResponse.json({ success: true, processed: messages.length })
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error)
    return NextResponse.json({ success: true }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active', webhook: 'WhatsApp Planifyx Webhook' })
}
