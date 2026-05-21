import { useState, useCallback, useRef } from 'react'
import type { EmailFolder, EmailMessageSummary } from '../_types'

export function useCorreoBandeja() {
  const [folders, setFolders] = useState<EmailFolder[]>([])
  const [activeFolder, setActiveFolder] = useState('INBOX')
  const [messages, setMessages] = useState<EmailMessageSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadingRef = useRef(false)

  const cargarFolders = useCallback(async (cuentaId: string) => {
    try {
      const res = await fetch(`/api/correo/folders?cuenta_id=${encodeURIComponent(cuentaId)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar carpetas')
      setFolders(data)
    } catch (e: any) {
      setError(e.message)
    }
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

    try {
      const params = new URLSearchParams({
        cuenta_id: cuentaId,
        folder: f,
        page: String(p),
        limit: '20',
      })
      if (s) params.set('search', s)

      const res = await fetch(`/api/correo/messages?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar mensajes')

      if (p === 1 || s) {
        setMessages(data.messages)
      } else {
        setMessages(prev => [...prev, ...data.messages])
      }

      setTotal(data.total)
      setPage(data.page)
      setHasMore(data.hasMore)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [activeFolder, searchQuery])

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

  const cargarMas = useCallback((cuentaId: string) => {
    if (hasMore && !loading) {
      cargarMensajes(cuentaId, activeFolder, page + 1, searchQuery)
    }
  }, [hasMore, loading, page, activeFolder, searchQuery, cargarMensajes])

  return {
    folders, activeFolder, messages, total, page, hasMore, loading, error, searchQuery,
    cargarFolders, cargarMensajes, cambiarFolder, buscar, cargarMas, setError,
  }
}
