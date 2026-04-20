import { useState, useEffect, useCallback } from 'react'
import { PuestoTrabajo, Pregunta, PuestoPregunta } from '../../_types'

export function usePuestos() {
  const [puestos, setPuestos] = useState<PuestoTrabajo[]>([])
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [puestoPreguntasMap, setPuestoPreguntasMap] = useState<Record<string, PuestoPregunta[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchPuestos = useCallback(async () => {
    setLoading(true)
    try {
      const [puestosRes, preguntasRes] = await Promise.all([
        fetch('/api/postulantes/puestos'),
        fetch('/api/postulantes/preguntas'),
      ])
      const puestosData = await puestosRes.json()
      const preguntasData = await preguntasRes.json()
      if (puestosData.success) setPuestos(puestosData.data || [])
      if (preguntasData.success) setPreguntas(preguntasData.data || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  const fetchPuestoPreguntas = useCallback(async (puestoId: string) => {
    try {
      const res = await fetch(`/api/postulantes/puestos/${puestoId}/preguntas`)
      const data = await res.json()
      if (data.success) {
        setPuestoPreguntasMap(prev => ({ ...prev, [puestoId]: data.data || [] }))
      }
    } catch {}
  }, [])

  useEffect(() => { fetchPuestos() }, [fetchPuestos])

  useEffect(() => {
    puestos.forEach(p => fetchPuestoPreguntas(p.id))
  }, [puestos, fetchPuestoPreguntas])

  const createPuesto = async (nombre: string, descripcion?: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/postulantes/puestos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion }),
      })
      const data = await res.json()
      if (data.success) { await fetchPuestos(); return data.data as PuestoTrabajo }
      return null
    } finally { setSaving(false) }
  }

  const updatePuesto = async (id: string, updates: Partial<PuestoTrabajo>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/postulantes/puestos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (data.success) {
        setPuestos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
        return true
      }
      return false
    } finally { setSaving(false) }
  }

  const deletePuesto = async (id: string) => {
    try {
      await fetch(`/api/postulantes/puestos?id=${id}`, { method: 'DELETE' })
      setPuestos(prev => prev.filter(p => p.id !== id))
      setPuestoPreguntasMap(prev => { const next = { ...prev }; delete next[id]; return next })
      return true
    } catch { return false }
  }

  const savePuestoPreguntas = async (puestoId: string, questions: PuestoPregunta[]) => {
    try {
      const res = await fetch(`/api/postulantes/puestos/${puestoId}/preguntas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: questions.map(q => ({
          pregunta_id: q.pregunta_id,
          label_publico: q.label_publico || null,
          texto_apoyo_publico: q.texto_apoyo_publico || null,
          orden: q.orden,
          requerido: q.requerido,
          visible_formulario: q.visible_formulario,
        }))}),
      })
      const data = await res.json()
      if (data.success) { fetchPuestoPreguntas(puestoId); return true }
      return false
    } catch { return false }
  }

  const togglePregunta = (puestoId: string, preguntaId: string, checked: boolean) => {
    const current = puestoPreguntasMap[puestoId] || []
    let updated: PuestoPregunta[]
    if (checked) {
      const pregunta = preguntas.find(p => p.id === preguntaId)
      if (!pregunta) return current
      updated = [...current, {
        id: '', puesto_id: puestoId, pregunta_id: preguntaId,
        label_publico: pregunta.label_base, texto_apoyo_publico: pregunta.texto_apoyo || '',
        orden: pregunta.orden, requerido: pregunta.requerido, visible_formulario: pregunta.visible_formulario, creado_en: '',
      }]
    } else {
      updated = current.filter(pp => pp.pregunta_id !== preguntaId)
    }
    setPuestoPreguntasMap(prev => ({ ...prev, [puestoId]: updated }))
    return updated
  }

  const updatePuestoPregunta = (puestoId: string, preguntaId: string, field: string, value: any) => {
    const current = puestoPreguntasMap[puestoId] || []
    const updated = current.map(pp => pp.pregunta_id === preguntaId ? { ...pp, [field]: value } : pp)
    setPuestoPreguntasMap(prev => ({ ...prev, [puestoId]: updated }))
  }

  const copyPreguntasFrom = (targetPuestoId: string, sourcePuestoId: string) => {
    const sourceQuestions = puestoPreguntasMap[sourcePuestoId] || []
    const newQuestions = sourceQuestions.map(q => ({
      ...q, id: '', puesto_id: targetPuestoId,
      label_publico: q.label_publico || preguntas.find(p => p.id === q.pregunta_id)?.label_base || '',
      texto_apoyo_publico: q.texto_apoyo_publico || preguntas.find(p => p.id === q.pregunta_id)?.texto_apoyo || '',
    }))
    setPuestoPreguntasMap(prev => ({ ...prev, [targetPuestoId]: newQuestions }))
    return newQuestions
  }

  const grupos = [...new Set(preguntas.map(p => p.grupo))].sort()

  return {
    puestos, preguntas, puestoPreguntasMap, loading, saving,
    fetchPuestos, fetchPuestoPreguntas, createPuesto, updatePuesto, deletePuesto,
    savePuestoPreguntas, togglePregunta, updatePuestoPregunta, copyPreguntasFrom,
    grupos,
  }
}