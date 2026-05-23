// @ts-nocheck
import { ImapFlow } from 'imapflow'

export interface ImapConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}

export interface FolderInfo {
  path: string
  name: string
  delimiter: string
  flags: Set<string>
  listed: boolean
  subscribed: boolean
}

export interface MessageHeader {
  uid: number
  envelope: {
    date: Date
    subject: string
    from: Array<{ name?: string; address: string }>
    to: Array<{ name?: string; address: string }>
    cc?: Array<{ name?: string; address: string }>
    messageId?: string
    inReplyTo?: string
  }
  flags: Set<string>
  hasAttachments: boolean
  size: number
  modseq: bigint
}

export interface ParsedEmail {
  uid: number
  envelope: MessageHeader['envelope']
  flags: Set<string>
  subject: string
  from: string
  fromName: string
  to: string
  cc: string
  date: string
  html: string
  text: string
  messageId: string
  inReplyTo: string
  references: string
  size: number
  attachments: Array<{
    filename: string
    mimeType: string
    size: number
    content: string
    contentId?: string
    disposition: string
    inline: boolean
  }>
  returnPath: string
  receivedHeaders: string[]
  authResults: string
  senderIP: string
  spoofing: boolean
  spoofingDetail: any | null
}

export async function connectImap(config: ImapConfig): Promise<ImapFlow> {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    logger: false,
  })

  await client.connect()
  return client
}

export async function listFolders(client: ImapFlow): Promise<FolderInfo[]> {
  const folders: FolderInfo[] = []
  const list = await client.list()
  for (const folder of list) {
    folders.push({
      path: folder.path,
      name: folder.name,
      delimiter: folder.delimiter,
      flags: folder.flags,
      listed: folder.listed,
      subscribed: folder.subscribed,
    })
  }
  return folders
}

export async function fetchMessageHeaders(
  client: ImapFlow,
  folderPath: string,
  options: { page?: number; limit?: number; searchQuery?: string } = {}
): Promise<{ messages: MessageHeader[]; total: number }> {
  const lock = await client.getMailboxLock(folderPath)
  try {
    const mailbox = client.mailbox
    const total = mailbox.exists

    const page = options.page || 1
    const limit = options.limit || 20
    const start = Math.max(1, total - page * limit + 1)
    const end = Math.max(1, total - (page - 1) * limit)

    const range = `${start}:${end}`

    const messages: MessageHeader[] = []

    let fetchOptions: any = {
      envelope: true,
      flags: true,
      bodyStructure: true,
      size: true,
      uid: true,
    }

    if (options.searchQuery) {
      const searchQuery = options.searchQuery.trim()
      if (searchQuery) {
        const searchResults = await client.search({ or: [
          { subject: searchQuery },
          { from: searchQuery },
          { body: searchQuery },
        ]}, { uid: true })
        fetchOptions.uid = true
        const uidList = searchResults.slice(-limit)
        if (uidList.length > 0) {
          for await (const msg of client.fetch(uidList, fetchOptions)) {
            messages.push(mapMessageHeader(msg))
          }
        }
        return { messages, total }
      }
    }

    for await (const msg of client.fetch({ seq: range } as any, fetchOptions)) {
      messages.push(mapMessageHeader(msg))
      if (messages.length >= limit) break
    }

    messages.reverse()
    return { messages, total }
  } finally {
    lock.release()
  }
}

function mapMessageHeader(msg: any): MessageHeader {
  const bodyStruct = msg.bodyStructure
  const hasAttachments = hasAttachmentParts(bodyStruct)

  return {
    uid: msg.uid,
    envelope: msg.envelope,
    flags: msg.flags || new Set(),
    hasAttachments,
    size: msg.size || 0,
    modseq: msg.modseq || BigInt(0),
  }
}

function hasAttachmentParts(structure: any): boolean {
  if (!structure) return false
  if (Array.isArray(structure)) {
    return structure.some(hasAttachmentParts)
  }
  if (structure.type && structure.type.toLowerCase() === 'message') return false
  if (structure.disposition && structure.disposition.toLowerCase().includes('attachment')) {
    return true
  }
  if (structure.childNodes) {
    return structure.childNodes.some(hasAttachmentParts)
  }
  return false
}

export async function fetchFullMessage(
  client: ImapFlow,
  folderPath: string,
  uid: number,
  markRead: boolean = false
): Promise<ParsedEmail | null> {
  const lock = await client.getMailboxLock(folderPath)
  try {
    const msg = await client.fetchOne(`${uid}`, {
      source: true,
      envelope: true,
      flags: true,
      uid: true,
      bodyStructure: true,
    }, { uid: true })

    if (!msg) return null

    if (markRead && msg.flags && !msg.flags.has('\\Seen')) {
      try { await client.messageFlagsAdd(`${uid}`, ['\\Seen'], { uid: true }) } catch {}
    }

    const { default: PostalMime } = await import('postal-mime')
    // @ts-ignore
    const parsed = await PostalMime.parse(msg.source)

    const attachments = (parsed.attachments || []).map((att: any) => ({
      filename: att.filename || '',
      mimeType: att.mimeType || '',
      size: att.content ? (att.content instanceof ArrayBuffer ? att.content.byteLength : att.content.length) : 0,
      content: att.content instanceof ArrayBuffer
        ? Buffer.from(att.content).toString('base64')
        : (typeof att.content === 'string' ? att.content : ''),
      contentId: att.contentId || undefined,
      disposition: att.disposition || 'attachment',
      inline: (att.contentId && att.disposition !== 'attachment') || false,
    }))

    // Analisis forense: extraer cabeceras del source para deteccion de spoofing
    const sourceStr = msg.source instanceof Buffer ? msg.source.toString('utf-8') : String(msg.source || '')
    const headersPart = sourceStr.split('\r\n\r\n')[0] || sourceStr.split('\n\n')[0] || ''

    // Extraer Return-Path
    const returnPathMatch = headersPart.match(/^Return-Path:\s*<?([^>\s]+)>?/m)
    const returnPath = returnPathMatch?.[1] || ''

    // Extraer headers Received
    const receivedHeaders: string[] = []
    const receivedRegex = /^Received:\s*(.+)$/gm
    let rm: RegExpExecArray | null
    while ((rm = receivedRegex.exec(headersPart)) !== null) {
      receivedHeaders.push(rm[1].trim())
    }

    // Extraer Authentication-Results
    const authResultsMatch = headersPart.match(/^Authentication-Results:\s*(.+)$/m)
    const authResults = authResultsMatch?.[1] || ''

    // Extraer IP del remitente del ultimo Received (el mas cercano al origen)
    let senderIP = ''
    if (receivedHeaders.length > 0) {
      const lastReceived = receivedHeaders[receivedHeaders.length - 1]
      const ipMatch = lastReceived.match(/\[?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]?/)
      if (ipMatch) senderIP = ipMatch[1]
    }

    // Detectar suplantacion: si From visible != Return-Path real
    const fromAddress = msg.envelope.from?.[0]?.address || ''
    const fromDomain = fromAddress.split('@')[1] || ''
    const returnDomain = returnPath.split('@')[1] || ''
    const spoofing = !!returnPath && returnPath !== fromAddress && returnDomain !== fromDomain

    const spoofingDetail = spoofing ? {
      visibleFrom: fromAddress,
      realSender: returnPath,
      senderIP,
      severity: returnDomain ? 'ALTA' : 'MEDIA',
    } : null

    // Reemplazar cid: URLs por data: URLs de attachments inline
    let html = parsed.html || ''
    if (html && attachments.length > 0) {
      attachments.forEach((att: any) => {
        if (att.contentId && att.content) {
          const cid = att.contentId.replace(/^<|>$/g, '')
          const dataUri = `data:${att.mimeType};base64,${att.content}`
          html = html.replace(new RegExp(`cid:${cid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'), dataUri)
        }
      })
    }

    return {
      uid: msg.uid,
      envelope: msg.envelope,
      flags: msg.flags ? Array.from(msg.flags) : [],
      isRead: msg.flags ? msg.flags.has('\\Seen') : false,
      isFlagged: msg.flags ? msg.flags.has('\\Flagged') : false,
      subject: parsed.subject || msg.envelope.subject || '',
      from: msg.envelope.from?.[0]?.address || '',
      fromName: msg.envelope.from?.[0]?.name || '',
      to: (msg.envelope.to || []).map((t: any) => t.address).join(', '),
      cc: (msg.envelope.cc || []).map((c: any) => c.address).join(', '),
      date: msg.envelope.date?.toISOString() || '',
      html: html,
      text: parsed.text || '',
      messageId: msg.envelope.messageId || '',
      inReplyTo: msg.envelope.inReplyTo || '',
      references: '',
      size: msg.size || 0,
      attachments,
      returnPath,
      receivedHeaders,
      authResults,
      senderIP,
      spoofing,
      spoofingDetail,
    }
  } finally {
    lock.release()
  }
}

export async function markAsRead(
  client: ImapFlow,
  folderPath: string,
  uid: number
): Promise<void> {
  const lock = await client.getMailboxLock(folderPath)
  try {
    await client.messageFlagsAdd(`${uid}`, ['\\Seen'], { uid: true })
  } finally {
    lock.release()
  }
}

export async function markAsUnread(
  client: ImapFlow,
  folderPath: string,
  uid: number
): Promise<void> {
  const lock = await client.getMailboxLock(folderPath)
  try {
    await client.messageFlagsRemove(`${uid}`, ['\\Seen'], { uid: true })
  } finally {
    lock.release()
  }
}

export async function toggleFlagged(
  client: ImapFlow,
  folderPath: string,
  uid: number,
  flagged: boolean
): Promise<void> {
  const lock = await client.getMailboxLock(folderPath)
  try {
    if (flagged) {
      await client.messageFlagsAdd(`${uid}`, ['\\Flagged'], { uid: true })
    } else {
      await client.messageFlagsRemove(`${uid}`, ['\\Flagged'], { uid: true })
    }
  } finally {
    lock.release()
  }
}

export async function moveMessage(
  client: ImapFlow,
  sourceFolder: string,
  uid: number,
  destFolder: string
): Promise<void> {
  const lock = await client.getMailboxLock(sourceFolder)
  try {
    await client.messageMove(`${uid}`, destFolder, { uid: true })
  } finally {
    lock.release()
  }
}

export async function deleteMessage(
  client: ImapFlow,
  folderPath: string,
  uid: number
): Promise<void> {
  const lock = await client.getMailboxLock(folderPath)
  try {
    await client.messageDelete(`${uid}`, { uid: true })
  } finally {
    lock.release()
  }
}

export async function appendToSent(
  client: ImapFlow,
  sentFolder: string,
  rawMessage: string
): Promise<void> {
  const lock = await client.getMailboxLock('INBOX')
  try {
    const sentPath = sentFolder || 'INBOX.Sent'
    await client.append(sentPath, rawMessage, ['\\Seen'])
  } catch {
    await client.append('INBOX.Sent', rawMessage, ['\\Seen'])
  } finally {
    lock.release()
  }
}
