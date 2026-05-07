import { useState, useEffect, useCallback } from 'react'

export interface PublicBlogPost {
  id: string
  titulo: string
  slug: string
  contenido: string
  extracto?: string
  seo_title?: string
  seo_description?: string
  imagen_portada?: string
  imagen_alt?: string
  categoria?: { id: string; nombre: string; slug: string }
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
  contrasena?: string
  visibilidad?: string
  sin_recompensa?: boolean
  tags?: { id: string; nombre: string; slug: string }[]
  creado_en: string
  actualizado_en: string
  empresa?: { id: string; nombre: string; slug: string }
}

export function usePublicBlog() {
  const [posts, setPosts] = useState<PublicBlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/blog?estado=publicado&limit=50')
      const data = await response.json()

      if (data.success && data.data) {
        const visiblePosts = data.data.filter((p: PublicBlogPost) => p.visibilidad !== 'oculto');
        setPosts(visiblePosts)
      } else {
        setError(data.error || 'Error al cargar posts')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const getPostBySlug = useCallback(async (slug: string): Promise<PublicBlogPost | null> => {
    try {
      const response = await fetch(`/api/blog?slug=${slug}&estado=publicado`)
      const data = await response.json()

      if (!data.success || !data.data || data.data.length === 0) return null

      return data.data[0]
    } catch {
      return null
    }
  }, [])

  const getCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/blog/categorias')
      const data = await response.json()
      return data.success ? data.data : []
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    getPostBySlug,
    getCategories
  }
}

export default usePublicBlog