import { useState, useCallback, useRef } from 'react'
import type { EmailFolder, EmailMessageSummary } from '../_types'

function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    fetch(url).then(res => { clearTimeout(timer); resolve(res) }).catch(e => { clearTimeout(timer); reject(e) })
  })
}

const LIMIT = 15

export function useCorreoBandeja() {
  const [folders, setFolders] = useState<EmailFolder[]>([])
  const [activeFolder, setActiveFolder] = useState('INBOX')
  const [messages, setMessages] = useState<EmailMessageSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadingRef = useRef(false)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const cargarFolders = useCallback(async (cuentaId: string) => {
    try {
      const res = await fetchWithTimeout(`/api/correo/folders?cuenta_id=${encodeURIComponent(cuentaId)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar carpetas')
      setFolders(data)
    } catch (e: any) {
      setError(e.message)
    }
  }, [])

  const cargarDesdeCache = useCallback((cuentaId: string, folder: string): boolean => {
    try {
      const cacheKey = `blis_correo_msg_${cuentaId}_${folder}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          setTotal(parsed.length)
          setPage(1)
          return true
        }
      }
    } catch {}
    return false
  }, [])

  const cargarMensajes = useCallback(async (
    cuentaId: string,
    folder?: string,
    pageNum?: number,
    search?: string
  ): Promise<void> => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)

    const f = folder || activeFolder
    const p = pageNum || 1
    const s = search !== undefined ? search : searchQuery
    const cacheKey = `blis_correo_msg_${cuentaId}_${f}`

    // Mostrar cache local al instante en pagina 1 sin busqueda
    if (p === 1 && !s) {
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed)) {
            setMessages(parsed)
            setTotal(parsed.length)
            setHasMore(parsed.length >= LIMIT)
          }
        }
      } catch {}
    }

    try {
      const params = new URLSearchParams({
        cuenta_id: cuentaId,
        folder: f,
        page: String(p),
        limit: String(LIMIT),
      })
      if (s) params.set('search', s)

      const res = await fetchWithTimeout(`/api/correo/messages?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar mensajes')

      setMessages(data.messages)
      setTotal(data.total)
      setPage(p)
      setHasMore(data.hasMore)

      // Guardar en cache solo pagina 1 sin busqueda
      if (p === 1 && !s && data.messages?.length > 0) {
        try { localStorage.setItem(cacheKey, JSON.stringify(data.messages.slice(0, 50))) } catch {}
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [activeFolder, searchQuery])

  const [hasMore, setHasMore] = useState(false)

  const cambiarFolder = useCallback((folder: string) => {
    setActiveFolder(folder)
    setPage(1)
    setMessages([])
    setSearchQuery('')
  }, [])

  const buscar = useCallback((query: string) => {
    setSearchQuery(query)
    setPage(1)
    setMessages([])
  }, [])

  const irPagina = useCallback((cuentaId: string, pageNum: number) => {
    cargarMensajes(cuentaId, activeFolder, pageNum, searchQuery)
  }, [activeFolder, searchQuery, cargarMensajes])

  const optimisticUpdate = useCallback((uid: number, changes: Partial<EmailMessageSummary>) => {
    setMessages(prev => prev.map(m => m.uid === uid ? { ...m, ...changes } : m))
  }, [])

  return {
    folders, activeFolder, messages, total, page, totalPages, hasMore, loading, error, searchQuery,
    cargarFolders, cargarMensajes, cargarDesdeCache, cambiarFolder, buscar, irPagina, optimisticUpdate, setError,
  }
}
