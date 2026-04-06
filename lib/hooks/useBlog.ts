import { useState, useCallback } from 'react'

interface BlogPost {
  id: string
  titulo: string
  slug: string
  contenido: string
  extracto?: string
  seo_title?: string
  seo_description?: string
  imagen_portada?: string
  imagen_alt?: string
  categoria_id?: string
  categoria?: { id: string; nombre: string; slug: string }
  autor_id?: string
  autor?: { id: string; nombre: string; apellido: string; avatar_url?: string }
  estado: 'borrador' | 'publicado' | 'archivado'
  publicado_en?: string
  es_premium: boolean
  metodo_pago: 'coins' | 'dinero' | 'ambos'
  precio_coins: number
  precio_usd: number
  recompensa_segundos: number
  recompensa_coins: number
  vistas: number
  tiempo_lectura_minutos: number
  tags?: { id: string; nombre: string; slug: string }[]
  creado_en: string
  actualizado_en: string
}

interface CreatePostData {
  empresa_id: string
  titulo: string
  contenido: string
  extracto?: string
  seo_title?: string
  seo_description?: string
  imagen_portada?: string
  imagen_alt?: string
  categoria_id?: string
  autor_id?: string
  estado?: 'borrador' | 'publicado'
  es_premium?: boolean
  metodo_pago?: 'coins' | 'dinero' | 'ambos'
  precio_coins?: number
  precio_usd?: number
  recompensa_segundos?: number
  recompensa_coins?: number
  tags?: string[]
}

interface UpdatePostData {
  titulo?: string
  contenido?: string
  extracto?: string
  seo_title?: string
  seo_description?: string
  imagen_portada?: string
  imagen_alt?: string
  categoria_id?: string
  autor_id?: string
  estado?: 'borrador' | 'publicado' | 'archivado'
  es_premium?: boolean
  metodo_pago?: 'coins' | 'dinero' | 'ambos'
  precio_coins?: number
  precio_usd?: number
  recompensa_segundos?: number
  recompensa_coins?: number
  tags?: string[]
}

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export function useBlog() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Subir imagen
  const uploadImage = useCallback(async (file: File, folder: string = 'blog'): Promise<UploadResult> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/storage', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error || 'Error al subir imagen' }
      }

      return { success: true, url: data.data.url }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  // Crear post
  const createPost = useCallback(async (postData: CreatePostData): Promise<{ success: boolean; data?: BlogPost; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Error al crear post')
        return { success: false, error: data.error }
      }

      return { success: true, data: data.data }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  // Actualizar post
  const updatePost = useCallback(async (id: string, updates: UpdatePostData): Promise<{ success: boolean; data?: BlogPost; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Error al actualizar post')
        return { success: false, error: data.error }
      }

      return { success: true, data: data.data }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  // Eliminar post
  const deletePost = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/blog?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Error al eliminar post')
        return { success: false, error: data.error }
      }

      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener posts
  const getPosts = useCallback(async (options?: {
    empresa_id?: string
    estado?: string
    categoria?: string
    limit?: number
    offset?: number
  }): Promise<{ success: boolean; data?: BlogPost[]; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options?.empresa_id) params.append('empresa_id', options.empresa_id)
      if (options?.estado) params.append('estado', options.estado)
      if (options?.categoria) params.append('categoria', options.categoria)
      if (options?.limit) params.append('limit', options.limit.toString())
      if (options?.offset) params.append('offset', options.offset.toString())

      const response = await fetch(`/api/blog?${params.toString()}`)
      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Error al obtener posts')
        return { success: false, error: data.error }
      }

      return { success: true, data: data.data }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener categorías
  const getCategories = useCallback(async (empresaId?: string): Promise<{ success: boolean; data?: { id: string; nombre: string; slug: string }[]; error?: string }> => {
    try {
      const params = empresaId ? `?empresa_id=${empresaId}` : ''
      const response = await fetch(`/api/blog/categorias${params}`)
      const data = await response.json()

      if (!data.success) {
        return { success: false, error: data.error }
      }

      return { success: true, data: data.data }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  return {
    loading,
    error,
    uploadImage,
    createPost,
    updatePost,
    deletePost,
    getPosts,
    getCategories
  }
}

export default useBlog