import { useState, useCallback } from 'react'

interface EmailMedia {
  id: string
  nombre: string
  descripcion?: string
  url: string
  tipo: 'image' | 'gif' | 'video' | 'icon'
  categoria: string
  tamano?: number
  ancho?: number
  alto?: number
  creado_en: string
}

export function useEmailMedia() {
  const [media, setMedia] = useState<EmailMedia[]>([])
  const [loading, setLoading] = useState(false)

  const getMedia = useCallback(async (categoria?: string, tipo?: string) => {
    setLoading(true)
    try {
      let url = '/api/email-media'
      const params = new URLSearchParams()
      if (categoria) params.append('categoria', categoria)
      if (tipo) params.append('tipo', tipo)
      if (params.toString()) url += '?' + params.toString()
      
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) {
        setMedia(data)
        return data
      }
      return []
    } catch (e) {
      console.error('Error loading media:', e)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadMedia = useCallback(async (file: File, nombre: string, categoria: string = 'general') => {
    setLoading(true)
    try {
      // Primero subir a Supabase Storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('empresa_id', '6186f014-c8c7-4027-9f08-8acf2bae3eae')
      
      const uploadRes = await fetch('/api/images', {
        method: 'POST',
        body: formData
      })
      
      if (!uploadRes.ok) {
        throw new Error('Error al subir imagen')
      }
      
      const uploadData = await uploadRes.json()
      
      // Determinar tipo
      const tipo = file.type.includes('gif') ? 'gif' : 
                   file.type.includes('video') ? 'video' :
                   file.type.includes('icon') || file.size < 50000 ? 'icon' : 'image'
      
      // Guardar en la base de datos
      const res = await fetch('/api/email-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          url: uploadData.url,
          tipo,
          categoria,
          tamano: file.size
        })
      })
      
      const data = await res.json()
      if (data.id) {
        await getMedia()
        return data
      }
      return null
    } catch (e) {
      console.error('Error uploading media:', e)
      return null
    } finally {
      setLoading(false)
    }
  }, [getMedia])

  const saveMedia = useCallback(async (mediaData: Partial<EmailMedia>) => {
    setLoading(true)
    try {
      const isUpdate = !!mediaData.id
      const res = await fetch('/api/email-media', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaData)
      })
      const data = await res.json()
      if (data.id) {
        await getMedia()
        return data
      }
      return null
    } catch (e) {
      console.error('Error saving media:', e)
      return null
    } finally {
      setLoading(false)
    }
  }, [getMedia])

  const deleteMedia = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/email-media?id=${id}`, { method: 'DELETE' })
      await getMedia()
      return true
    } catch (e) {
      console.error('Error deleting media:', e)
      return false
    } finally {
      setLoading(false)
    }
  }, [getMedia])

  return { media, loading, getMedia, uploadMedia, saveMedia, deleteMedia }
}