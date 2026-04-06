import { useState, useCallback } from 'react'

export interface Comment {
  id: string
  contenido: string
  estado: string
  creado_en: string
  actualizado_en: string
  padre_id: string | null
  user: {
    id: string
    nombre: string
    apellido: string
    avatar_url?: string
  }
  respuestas?: Comment[]
}

export function useComments(postId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!postId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/blog/comments?post_id=${postId}`)
      const data = await response.json()

      if (data.success) {
        setComments(data.data)
      } else {
        setError(data.error || 'Error al cargar comentarios')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [postId])

  const createComment = useCallback(async (
    userId: string,
    empresaId: string,
    contenido: string,
    padreId?: string
  ): Promise<{ success: boolean; data?: Comment; error?: string }> => {
    if (!postId) {
      return { success: false, error: 'Post ID requerido' }
    }

    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresaId,
          post_id: postId,
          user_id: userId,
          contenido,
          padre_id: padreId
        })
      })

      const data = await response.json()

      if (data.success) {
        setComments(prev => [data.data, ...prev])
        return { success: true, data: data.data }
      }

      return { success: false, error: data.error || 'Error al crear comentario' }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [postId])

  const updateComment = useCallback(async (
    commentId: string,
    userId: string,
    contenido: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: commentId,
          user_id: userId,
          contenido
        })
      })

      const data = await response.json()

      if (data.success) {
        setComments(prev => 
          prev.map(c => c.id === commentId ? { ...c, contenido, actualizado_en: data.data.actualizado_en } : c)
        )
        return { success: true }
      }

      return { success: false, error: data.error || 'Error al actualizar' }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  const deleteComment = useCallback(async (
    commentId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/blog/comments?id=${commentId}&user_id=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId))
        return { success: true }
      }

      return { success: false, error: data.error || 'Error al eliminar' }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }, [])

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment
  }
}

export default useComments