"use client"

import { useState, useCallback } from 'react'
import type { ComunidadPost, ComunidadComentario, ReaccionTipo } from '../_types'
import { uploadMediaAction } from '@/app/actions/uploadMedia'

const API = '/api/comunidad'

interface UseComunidadOptions {
  empresaId?: string
  limit?: number
}

export function useComunidad(options: UseComunidadOptions = {}) {
  const { limit = 20 } = options
  const [posts, setPosts] = useState<ComunidadPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = useCallback(async (resetCursor = true) => {
    try {
      if (resetCursor) {
        setLoading(true)
        setCursor(undefined)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams({ limit: String(limit) })
      if (!resetCursor && cursor) params.set('cursor', cursor)

      const res = await fetch(`${API}?${params}`)
      const json = await res.json()

      if (!json.success) {
        setError(json.error)
        return
      }

      if (resetCursor) {
        setPosts(json.data)
      } else {
        setPosts(prev => [...prev, ...json.data])
      }

      setCursor(json.cursor || undefined)
      setHasMore(!!json.cursor)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [cursor, limit])

  const crearPost = useCallback(async (data: {
    tipo?: string
    contenido?: string
    encuesta?: { pregunta: string; opciones: string[]; multiple?: boolean; fecha_cierre?: string }
    evento?: {
      titulo: string; descripcion?: string; imagen_url?: string
      fecha_inicio: string; fecha_fin?: string; hora_inicio?: string; hora_fin?: string
      ubicacion?: string; ubicacion_url?: string; es_digital?: boolean; url_evento?: string
      tipo?: string; capacidad?: number
    }
    media_ids?: string[]
  }) => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    setPosts(prev => [json.data, ...prev])
    return json.data as ComunidadPost
  }, [])

  const eliminarPost = useCallback(async (id: string) => {
    const res = await fetch(`${API}?id=${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    setPosts(prev => prev.filter(p => p.id !== id))
  }, [])

  const reaccionar = useCallback(async (postId: string, tipo: ReaccionTipo = 'like') => {
    // Optimista
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const reacciones = [...(p.reacciones || [])]
      const existingIdx = reacciones.findIndex(r => r.tipo === p.mi_reaccion)
      if (p.mi_reaccion) {
        if (p.mi_reaccion === tipo) {
          // Quitar
          const r = reacciones[existingIdx]
          if (r && r.count > 1) r.count--
          else reacciones.splice(existingIdx, 1)
          return { ...p, reacciones, mi_reaccion: null as null }
        } else {
          // Cambiar tipo
          if (existingIdx >= 0 && reacciones[existingIdx].count > 1) reacciones[existingIdx].count--
          else if (existingIdx >= 0) reacciones.splice(existingIdx, 1)
          const targetIdx = reacciones.findIndex(r => r.tipo === tipo)
          if (targetIdx >= 0) reacciones[targetIdx].count++
          else reacciones.push({ tipo: tipo as ReaccionTipo, count: 1 })
          return { ...p, reacciones, mi_reaccion: tipo }
        }
      } else {
        // Nuevo
        const idx = reacciones.findIndex(r => r.tipo === tipo)
        if (idx >= 0) reacciones[idx].count++
        else reacciones.push({ tipo: tipo as ReaccionTipo, count: 1 })
        return { ...p, reacciones, mi_reaccion: tipo }
      }
    }))

    try {
      const res = await fetch(`${API}/reaccionar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, tipo })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
    } catch {
      // Revertir recargando
      fetchPosts(true)
    }
  }, [fetchPosts])

  const votar = useCallback(async (encuestaId: string, opcionId: string) => {
    // Optimista: actualizar UI inmediatamente
    setPosts(prev => prev.map(p => {
      if (p.encuesta?.id !== encuestaId) return p
      const ops = p.encuesta.opciones.map(o => {
        if (o.id !== opcionId) {
          // Si votación única y ya votó por otra, quitar ese voto
          if (!p.encuesta!.multiple && o.votada) return { ...o, votos_count: (o.votos_count || 1) - 1, votada: false }
          return o
        }
        const yaVotada = o.votada
        return {
          ...o,
          votos_count: (o.votos_count || 0) + (yaVotada ? -1 : 1),
          votada: !yaVotada
        }
      })
      const totalVotos = p.encuesta!.total_votos! + (ops.find(o => o.id === opcionId)!.votada ? 1 : -1)
      return { ...p, encuesta: { ...p.encuesta!, opciones: ops, total_votos: Math.max(0, totalVotos), usuario_voto: ops.filter(o => o.votada).map(o => o.id) } }
    }))

    try {
      const res = await fetch(`${API}/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encuesta_id: encuestaId, opcion_id: opcionId })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      // Confirmar con datos del servidor
      setPosts(prev => prev.map(p => {
        if (p.encuesta?.id !== encuestaId) return p
        return { ...p, encuesta: { ...p.encuesta!, opciones: json.data.opciones, total_votos: json.data.total_votos, usuario_voto: json.data.usuario_voto } }
      }))
    } catch {
      // Revertir recargando
      fetchPosts(true)
    }
  }, [fetchPosts])

  const inscribirEvento = useCallback(async (eventoId: string) => {
    // Optimista
    setPosts(prev => prev.map(p => {
      if (p.evento?.id !== eventoId) return p
      return { ...p, evento: { ...p.evento!, usuario_inscrito: true, usuario_estado: 'inscrito', inscritos_count: (p.evento!.inscritos_count || 0) + 1 } }
    }))
    try {
      const res = await fetch(`${API}/inscribir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: eventoId })
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
    } catch {
      fetchPosts(true)
    }
  }, [fetchPosts])

  const cancelarInscripcion = useCallback(async (eventoId: string) => {
    // Optimista
    setPosts(prev => prev.map(p => {
      if (p.evento?.id !== eventoId) return p
      return { ...p, evento: { ...p.evento!, usuario_inscrito: false, usuario_estado: 'cancelado', inscritos_count: Math.max(0, (p.evento!.inscritos_count || 1) - 1) } }
    }))
    try {
      const res = await fetch(`${API}/inscribir?evento_id=${eventoId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
    } catch {
      fetchPosts(true)
    }
  }, [fetchPosts])

  return {
    posts, loading, loadingMore, error, hasMore,
    fetchPosts, crearPost, eliminarPost, reaccionar,
    votar, inscribirEvento, cancelarInscripcion
  }
}

export function useComentarios(postId: string) {
  const [comentarios, setComentarios] = useState<ComunidadComentario[]>([])
  const [loading, setLoading] = useState(false)

  const fetchComentarios = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/comentarios?post_id=${postId}`)
      const json = await res.json()
      if (json.success) setComentarios(json.data)
    } finally {
      setLoading(false)
    }
  }, [postId])

  const crearComentario = useCallback(async (contenido: string, padreId?: string) => {
    const res = await fetch(`${API}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, contenido, padre_id: padreId })
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    await fetchComentarios()
    return json.data
  }, [postId, fetchComentarios])

  const eliminarComentario = useCallback(async (id: string) => {
    const res = await fetch(`${API}/comentarios?id=${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    setComentarios(prev => prev.filter(c => c.id !== id).map(c => ({
      ...c,
      respuestas: c.respuestas?.filter(r => r.id !== id)
    })))
  }, [])

  return { comentarios, loading, fetchComentarios, crearComentario, eliminarComentario }
}

interface MediaUploadResult {
  id: string
  url_original: string
  url_comprimida: string | null
  url_thumbnail: string | null
  tipo: 'imagen' | 'video' | 'audio' | 'archivo'
  mime_type: string
  nombre_archivo: string
  tamaño_original: number
  tamaño_comprimido: number | null
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadMedia = useCallback(async (file: File, postId?: string): Promise<MediaUploadResult> => {
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (postId) formData.append('post_id', postId)

      const result = await uploadMediaAction(formData)

      setProgress(100)
      setUploading(false)

      if (!result.success) throw new Error(result.error || 'Error al subir')
      return result.data! as MediaUploadResult
    } catch (e) {
      setUploading(false)
      throw e instanceof Error ? e : new Error('Error al subir archivo')
    }
  }, [])

  const eliminarMedia = useCallback(async (id: string) => {
    const res = await fetch(`${API}/upload?id=${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
  }, [])

  return { uploadMedia, eliminarMedia, uploading, progress }
}
