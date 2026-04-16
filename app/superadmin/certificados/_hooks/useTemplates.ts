'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { CertificateTemplate, CertificateElement } from '../_types'

export function useTemplates() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/certificados/plantillas')
      const data = await response.json()
      if (data.success && data.data) {
        const { dbToLocal } = await import('../_types')
        const localTemplates = data.data.map(dbToLocal)
        setTemplates(localTemplates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveTemplate = useCallback(async (template: CertificateTemplate) => {
    setSaving(true)
    try {
      const { localToDb } = await import('../_types')
      const dbData = localToDb(template)
      const isNew = template.id === 'new'
      
      const response = await fetch('/api/certificados/plantillas', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? dbData : { id: template.id, ...dbData })
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchTemplates()
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Error saving template:', error)
      return { success: false, error: 'Error al guardar la plantilla' }
    } finally {
      setSaving(false)
    }
  }, [fetchTemplates])

  const deleteTemplate = useCallback(async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return { success: false }
    
    try {
      const response = await fetch(`/api/certificados/plantillas?id=${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        await fetchTemplates()
        return { success: true }
      }
      return { success: false, error: data.error }
    } catch (error) {
      console.error('Error deleting template:', error)
      return { success: false, error: 'Error al eliminar' }
    }
  }, [fetchTemplates])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    saving,
    fetchTemplates,
    saveTemplate,
    deleteTemplate
  }
}

export function useCanvasEditor(canvasRef: React.RefObject<HTMLDivElement | null>) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [canvasBounds, setCanvasBounds] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const syncBounds = useCallback(() => {
    if (canvasRef.current) {
      setCanvasBounds(canvasRef.current.getBoundingClientRect())
    }
  }, [canvasRef])

  const stopContinuousMove = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current)
      moveIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopContinuousMove()
  }, [stopContinuousMove])

  const moveElement = useCallback((template: CertificateTemplate, elId: string, dx: number, dy: number): CertificateTemplate | null => {
    const el = template.elements.find(e => e.id === elId)
    if (!el) return null

    const sensitivity = 0.2
    return {
      ...template,
      elements: template.elements.map(e => e.id === elId ? {
        ...e,
        x: Math.max(0, Math.min(100, e.x + dx * sensitivity)),
        y: Math.max(0, Math.min(100, e.y + dy * sensitivity))
      } : e)
    }
  }, [])

  const scaleElement = useCallback((template: CertificateTemplate, elId: string, delta: number): CertificateTemplate | null => {
    const el = template.elements.find(e => e.id === elId)
    if (!el) return null

    return {
      ...template,
      elements: template.elements.map(e => e.id === elId ? {
        ...e,
        fontSize: Math.max(10, Math.min(150, e.fontSize + delta))
      } : e)
    }
  }, [])

  const startContinuousMove = useCallback((
    template: CertificateTemplate,
    elId: string,
    dx: number,
    dy: number,
    onUpdate: (newTemplate: CertificateTemplate) => void
  ) => {
    stopContinuousMove()
    const result = moveElement(template, elId, dx, dy)
    if (result) onUpdate(result)
    moveIntervalRef.current = setInterval(() => {
      const current = moveElement(template, elId, dx, dy)
      if (current) onUpdate(current)
    }, 16)
  }, [moveElement, stopContinuousMove])

  const startContinuousScale = useCallback((
    template: CertificateTemplate,
    elId: string,
    delta: number,
    onUpdate: (newTemplate: CertificateTemplate) => void
  ) => {
    stopContinuousMove()
    const result = scaleElement(template, elId, delta)
    if (result) onUpdate(result)
    moveIntervalRef.current = setInterval(() => {
      const current = scaleElement(template, elId, delta)
      if (current) onUpdate(current)
    }, 40)
  }, [scaleElement, stopContinuousMove])

  const handleDragStart = useCallback((
    e: React.PointerEvent,
    template: CertificateTemplate,
    el: CertificateElement,
    onUpdate: (newTemplate: CertificateTemplate) => void
  ) => {
    e.preventDefault()
    e.stopPropagation()
    syncBounds()
    setSelectedId(el.id)

    if (!canvasRef.current) return
    const canvasRect = canvasRef.current.getBoundingClientRect()

    const initialCenterX = canvasRect.left + (el.x / 100) * canvasRect.width
    const initialCenterY = canvasRect.top + (el.y / 100) * canvasRect.height

    const offsetX = initialCenterX - e.clientX
    const offsetY = initialCenterY - e.clientY

    const onPointerMove = (moveEvent: PointerEvent) => {
      const targetX = moveEvent.clientX + offsetX
      const targetY = moveEvent.clientY + offsetY

      let newX = ((targetX - canvasRect.left) / canvasRect.width) * 100
      let newY = ((targetY - canvasRect.top) / canvasRect.height) * 100

      newX = Math.max(0, Math.min(100, parseFloat(newX.toFixed(4))))
      newY = Math.max(0, Math.min(100, parseFloat(newY.toFixed(4))))

      if (Math.abs(newX - 50) < 0.8) newX = 50
      if (Math.abs(newY - 50) < 0.8) newY = 50

      const newEl = template.elements.find(e => e.id === el.id)
      if (newEl) {
        onUpdate({
          ...template,
          elements: template.elements.map(e => e.id === el.id ? { ...e, x: newX, y: newY } : e)
        })
      }
    }

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }, [canvasRef, syncBounds])

  return {
    selectedId,
    setSelectedId,
    canvasBounds,
    syncBounds,
    moveElement,
    scaleElement,
    startContinuousMove,
    startContinuousScale,
    handleDragStart,
    stopContinuousMove
  }
}