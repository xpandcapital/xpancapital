'use client'

import { useState, useCallback } from 'react'
import type { Formulario, FormField, FormAppearance, FlowStep } from '../_types'
import { defaultAppearance } from '../_types'

export function useFormEditor(form: Formulario) {
  const [formData, setFormData] = useState<Formulario>({ ...form })
  const [activeTab, setActiveTab] = useState<string>('build')
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const activeField = formData.campos.find(f => f.id === activeFieldId) || null

  const updateField = useCallback(<K extends keyof Formulario>(key: K, value: Formulario[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const addField = useCallback((type: string) => {
    const fieldTypes: Record<string, string> = {
      text: 'Texto corto', textarea: 'Área de texto', email: 'Email',
      phone: 'Teléfono', dropdown: 'Desplegable', radio: 'Opción única',
      checkbox: 'Casillas', date: 'Fecha', time: 'Hora', url: 'Enlace URL',
    }
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type,
      label: fieldTypes[type] || 'Nuevo campo',
      required: false,
      placeholder: type === 'dropdown' || type === 'radio' || type === 'checkbox' ? undefined : 'Escribe aquí...',
      options: (type === 'dropdown' || type === 'radio' || type === 'checkbox') ? ['Opción 1', 'Opción 2'] : undefined,
    }
    setFormData(prev => ({ ...prev, campos: [...prev.campos, newField] }))
    if (type !== 'page_break') setActiveFieldId(newField.id)
  }, [])

  const addPageBreak = useCallback(() => {
    const newField: FormField = {
      id: `pb_${Date.now()}`,
      type: 'page_break',
      label: 'Salto de Página',
      required: false,
    }
    setFormData(prev => ({ ...prev, campos: [...prev.campos, newField] }))
  }, [])

  const updateFormField = useCallback((id: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      campos: prev.campos.map(f => f.id === id ? { ...f, ...updates } : f)
    }))
  }, [])

  const deleteField = useCallback((id: string) => {
    setFormData(prev => ({ ...prev, campos: prev.campos.filter(f => f.id !== id) }))
    if (activeFieldId === id) setActiveFieldId(null)
  }, [activeFieldId])

  const moveField = useCallback((index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const newFields = [...prev.campos]
      if (direction === 'up' && index > 0) {
        [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]]
      } else if (direction === 'down' && index < newFields.length - 1) {
        [newFields[index + 1], newFields[index]] = [newFields[index], newFields[index + 1]]
      }
      return { ...prev, campos: newFields }
    })
  }, [])

  const updateAppearance = useCallback((key: keyof FormAppearance, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, apariencia: { ...prev.apariencia, [key]: value } }))
  }, [])

  const addFlowStep = useCallback((type: 'webhook' | 'email' | 'redirect', title: string) => {
    const newStep: FlowStep = { id: `fs_${Date.now()}`, type, title, url: '' }
    setFormData(prev => ({ ...prev, pasos_flujo: [...prev.pasos_flujo, newStep] }))
  }, [])

  const updateFlowStep = useCallback((id: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      pasos_flujo: prev.pasos_flujo.map(fs => fs.id === id ? { ...fs, url } : fs)
    }))
  }, [])

  const deleteFlowStep = useCallback((id: string) => {
    setFormData(prev => ({ ...prev, pasos_flujo: prev.pasos_flujo.filter(fs => fs.id !== id) }))
  }, [])

  const formPages = (() => {
    const pages: FormField[][] = []
    let current: FormField[] = []
    formData.campos.forEach(f => {
      if (f.type === 'page_break') { pages.push(current); current = [] }
      else { current.push(f) }
    })
    pages.push(current)
    return pages
  })()

  return {
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    activeFieldId,
    setActiveFieldId,
    activeField,
    saving,
    setSaving,
    updateField,
    addField,
    addPageBreak,
    updateFormField,
    deleteField,
    moveField,
    updateAppearance,
    addFlowStep,
    updateFlowStep,
    deleteFlowStep,
    formPages,
  }
}