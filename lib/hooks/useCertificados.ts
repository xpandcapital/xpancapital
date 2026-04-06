import { useState, useEffect } from 'react'

interface Certificado {
  id: string
  user_id: string
  curso_id?: string
  nombre: string
  fecha_emision: string
  codigo_verificacion: string
  archivo_url?: string
  creado_en: string
  curso?: {
    id: string
    nombre: string
    slug?: string
  }
  user?: {
    id: string
    nombre: string
    apellido: string
    avatar_url?: string
  }
}

export function useCertificados(userId: string | null) {
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchCertificados = async () => {
      try {
        const response = await fetch(`/api/certificados?user_id=${userId}`)
        const data = await response.json()

        if (data.success) {
          setCertificados(data.data || [])
        } else {
          setError(data.error || 'Error al cargar certificados')
        }
      } catch {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificados()
  }, [userId])

  const generateCertificate = async (cursoId: string, nombre: string) => {
    if (!userId) return null

    try {
      const response = await fetch('/api/certificados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          curso_id: cursoId,
          nombre
        })
      })

      const data = await response.json()

      if (data.success) {
        setCertificados(prev => [data.data, ...prev])
        return data.data
      }

      return null
    } catch {
      return null
    }
  }

  return { certificados, loading, error, generateCertificate }
}

export function useVerifyCertificado(codigo: string | null) {
  const [certificado, setCertificado] = useState<Certificado | null>(null)
  const [valid, setValid] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!codigo) {
      setLoading(false)
      return
    }

    const verifyCertificado = async () => {
      try {
        const response = await fetch(`/api/certificados?codigo=${codigo}`)
        const data = await response.json()

        if (data.valid) {
          setCertificado(data.data)
          setValid(true)
        } else {
          setValid(false)
          setError(data.error || 'Certificado no válido')
        }
      } catch {
        setValid(false)
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    verifyCertificado()
  }, [codigo])

  return { certificado, valid, loading, error }
}