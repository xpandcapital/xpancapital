import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdmin() { return createClient(supabaseUrl, supabaseServiceKey) }

function cleanJid(raw: string): string {
  return raw
    .trim()
    .replace(/:(\d+)$/, '')
    .replace(/@(s\.whatsapp\.net|hosted\.lid|lid|g\.us|c\.us|broadcast)$/, '')
}

function detectMessageType(msg: Record<string, any>): string {
  if (msg.conversation || msg.extendedTextMessage) return 'text'
  if (msg.imageMessage) return 'image'
  if (msg.videoMessage) return 'video'
  if (msg.documentMessage) return 'document'
  if (msg.audioMessage) return 'audio'
  if (msg.locationMessage) return 'location'
  if (msg.contactMessage) return 'contact'
  if (msg.stickerMessage) return 'sticker'
  if (msg.reactionMessage) return 'reaction'
  return 'unknown'
}

function extractBody(msg: Record<string, any>): { body: string | null; caption: string | null; mediaUrl: string | null; mediaMime: string | null } {
  if (msg.conversation) return { body: msg.conversation, caption: null, mediaUrl: null, mediaMime: null }
  if (msg.extendedTextMessage?.text) return { body: msg.extendedTextMessage.text, caption: null, mediaUrl: null, mediaMime: null }
  if (msg.imageMessage) return { body: msg.imageMessage.caption || '[Imagen]', caption: msg.imageMessage.caption || null, mediaUrl: msg.imageMessage.url || null, mediaMime: msg.imageMessage.mimetype || null }
  if (msg.videoMessage) return { body: msg.videoMessage.caption || '[Video]', caption: msg.videoMessage.caption || null, mediaUrl: msg.videoMessage.url || null, mediaMime: msg.videoMessage.mimetype || null }
  if (msg.documentMessage) return { body: msg.documentMessage.fileName || msg.documentMessage.caption || '[Documento]', caption: msg.documentMessage.caption || null, mediaUrl: msg.documentMessage.url || null, mediaMime: msg.documentMessage.mimetype || null }
  if (msg.audioMessage) return { body: '[Audio]', caption: null, mediaUrl: msg.audioMessage.url || null, mediaMime: msg.audioMessage.mimetype || null }
  if (msg.locationMessage) return { body: '[Ubicación]', caption: null, mediaUrl: null, mediaMime: null }
  if (msg.contactMessage) return { body: '[Contacto]', caption: null, mediaUrl: null, mediaMime: null }
  if (msg.stickerMessage) return { body: '[Sticker]', caption: null, mediaUrl: msg.stickerMessage.url || null, mediaMime: null }
  if (msg.reactionMessage) return { body: msg.reactionMessage.text || '[Reacción]', caption: null, mediaUrl: null, mediaMime: null }
  return { body: null, caption: null, mediaUrl: null, mediaMime: null }
}

function parseEntry(entry: Record<string, any>, eventName: string): Record<string, any> | null {
  // 0. received_message (Planifyx alternate format)
  if (eventName === 'received_message' && entry.message?.body_message) {
    const bm = entry.message.body_message
    const jid = entry.message?._data?.key?.remoteJid || entry.message?.key?.remoteJid || entry.from || ''
    return {
      event_type: 'message',
      from_number: cleanJid(jid) || null,
      to_number: null, message_type: bm.type === 'textMessage' ? 'text' : bm.type || 'text',
      body: bm.content || bm.messages?.conversation || bm.text || '[Mensaje]',
      caption: null, media_url: bm.media?.url || null, media_mime: bm.media?.mime || null,
    }
  }

  // 1. Contacts / Presence — ignorar metadata
  if (entry.notify || entry.verifiedName || eventName === 'presence.update' || entry.presences) return null

  // 2. Status updates — tienen update.status
  const key = entry.key || {}
  const msg = entry.message || {}
  const update = entry.update || {}
  const rawJid = key.remoteJid || entry.remoteJid || entry.id || ''

  if (Object.keys(update).length > 0 && update.status !== undefined) {
    const statusMap: Record<number, string> = { 1: 'server_ack', 2: 'delivered', 3: 'read', 4: 'played' }
    return {
      event_type: statusMap[update.status] || `status_${update.status}`,
      from_number: key.fromMe ? cleanJid(rawJid) : null,
      to_number: key.fromMe ? null : cleanJid(rawJid),
      message_type: 'status',
      body: null, caption: null, media_url: null, media_mime: null,
    }
  }

  // 3. Mensaje real — detectar por contenido en message
  if (Object.keys(msg).length > 0 && (msg.conversation || msg.extendedTextMessage || msg.imageMessage || msg.videoMessage || msg.documentMessage || msg.audioMessage || msg.stickerMessage || msg.locationMessage || msg.contactMessage || msg.reactionMessage || msg.buttonsMessage || msg.listMessage || msg.templateMessage || msg.interactiveMessage)) {
    const { body, caption, mediaUrl, mediaMime } = extractBody(msg)
    if (!body && Object.keys(msg).length > 1) {
      // Mensaje con contenido no reconocido — loguear para debug
      console.log('[WhatsApp] messages.upsert no reconocido:', JSON.stringify(msg).substring(0, 300))
    }
    return {
      event_type: key.fromMe ? 'sent' : 'message',
      from_number: key.fromMe ? cleanJid(rawJid) : cleanJid(rawJid),
      to_number: null,
      message_type: detectMessageType(msg),
      body,
      caption,
      media_url: mediaUrl,
      media_mime: mediaMime,
    }
  }

  // 4. Envío con ack
  if (eventName === 'send' || entry.ack !== undefined) {
    const ackMap: Record<number, string> = { 1: 'server_ack', 2: 'delivered', 3: 'read', 4: 'played' }
    return {
      event_type: ackMap[entry.ack] || `ack_${entry.ack}`,
      from_number: null, to_number: cleanJid(entry.to || rawJid),
      message_type: 'status', body: null, caption: null, media_url: null, media_mime: null,
    }
  }

  // 5. Connection
  if (entry.connected !== undefined || eventName === 'connection.update') {
    return {
      event_type: entry.connected !== false ? 'connected' : 'disconnected',
      from_number: null, to_number: null,
      message_type: 'status', body: entry.connected !== false ? 'WhatsApp conectado' : 'WhatsApp desconectado',
      caption: null, media_url: null, media_mime: null,
    }
  }

  // 6. Battery
  if (entry.battery !== undefined || eventName === 'battery') {
    return {
      event_type: 'battery',
      from_number: null, to_number: null,
      message_type: 'status', body: `Batería: ${entry.battery || entry.percent || '?'}%`,
      caption: null, media_url: null, media_mime: null,
    }
  }

  // 7. Plain message (flat structure, no wrapper)
  if (entry.body || entry.text || entry.conversation) {
    return {
      event_type: 'message',
      from_number: cleanJid(rawJid || entry.author || entry.sender || ''),
      to_number: null,
      message_type: 'text',
      body: entry.body || entry.text || entry.conversation || JSON.stringify(entry).substring(0, 500),
      caption: null, media_url: null, media_mime: null,
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getAdmin()
    const empresaId = DEFAULT_EMPRESA_ID
    const instanceId = body.instance_id || body.data?.instance_id || null

    // Planifyx puede enviar el evento en diferentes ubicaciones
    const eventName = body.event || body.data?.event || body.type || ''

    // Aplanar entradas: Planifyx usa muchos formatos distintos
    let entries: Record<string, any>[] = []

    if (Array.isArray(body.data?.data)) {
      entries = body.data.data
    } else if (Array.isArray(body.data?.data?.messages)) {
      entries = body.data.data.messages
    } else if (Array.isArray(body.messages)) {
      entries = body.messages
    } else if (Array.isArray(body.data)) {
      entries = body.data
    } else if (Array.isArray(body.notifications)) {
      entries = body.notifications
    } else if (body.data?.message) {
      // received_message: {data:{message:{body_message:{content:"Hola"}}}}
      entries = [body.data]
    } else if (body.data?.data?.messages) {
      // messages.upsert con objeto (no array): {data:{data:{messages:[{...}]}}}
      entries = Array.isArray(body.data.data.messages) ? body.data.data.messages : [body.data]
    } else {
      entries = [body]
    }

    const messages: Record<string, any>[] = []
    const recentBodies = new Set<string>()

    // Cargar mensajes recientes para deduplicar (received_message + messages.upsert duplicados)
    try {
      const { data: recent } = await supabase
        .from('whatsapp_messages')
        .select('body')
        .eq('empresa_id', empresaId)
        .eq('event_type', 'message')
        .gte('created_at', new Date(Date.now() - 10000).toISOString())
        .limit(20)
      if (recent) recent.forEach((r: any) => { if (r.body) recentBodies.add(r.body) })
    } catch {}

    for (const entry of entries) {
      const parsed = parseEntry(entry, eventName)
      if (!parsed) continue

      // Deduplicar: saltar received_message si el mismo body ya llegó vía messages.upsert
      if (parsed.body && recentBodies.has(parsed.body)) continue
      if (parsed.body) recentBodies.add(parsed.body)

      messages.push({
        empresa_id: empresaId,
        instance_id: instanceId,
        event_type: parsed.event_type,
        from_number: parsed.from_number || null,
        to_number: parsed.to_number || null,
        message_type: parsed.message_type || 'text',
        body: parsed.body,
        caption: parsed.caption,
        media_url: parsed.media_url,
        media_mime: parsed.media_mime,
        raw_payload: entry,
        processed: false,
      })
    }

    if (messages.length > 0) {
      const { error } = await supabase.from('whatsapp_messages').insert(messages)
      if (error) console.error('[WhatsApp Webhook] Error guardando:', error)
    } else {
      // Loggear payloads no reconocidos para debug
      const sample = JSON.stringify(body).substring(0, 400)
      console.log('[WhatsApp Webhook] No procesado:', eventName, sample)
    }

    return NextResponse.json({ success: true, processed: messages.length, event: eventName })
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error)
    return NextResponse.json({ success: true }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active', webhook: 'WhatsApp Planifyx Webhook' })
}
