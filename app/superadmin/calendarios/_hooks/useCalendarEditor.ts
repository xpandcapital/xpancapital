'use client'

import { useState, useCallback } from 'react'
import type { Calendario, WeekSchedule, DaySchedule, SpecificDate, FormFieldCal } from '../_types'
import { defaultSchedule, defaultFormFields } from '../_types'

export function useCalendarEditor(calendar: Calendario) {
  const [formData, setFormData] = useState<Calendario>({ ...calendar })
  const [activeTab, setActiveTab] = useState<string>('basico')
  const [saving, setSaving] = useState(false)

  const updateField = useCallback(<K extends keyof Calendario>(key: K, value: Calendario[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateNested = useCallback(<K extends keyof Calendario>(key: K, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [key]: { ...(prev[key] as Record<string, unknown>), [field]: value }
    }))
  }, [])

  const updateDaySchedule = useCallback((day: keyof WeekSchedule, data: Partial<DaySchedule>) => {
    setFormData(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [day]: { ...prev.horarios[day], ...data }
      }
    }))
  }, [])

  const addSpecificDate = useCallback((date: SpecificDate) => {
    setFormData(prev => ({
      ...prev,
      fechas_especificas: [...(prev.fechas_especificas || []), date]
    }))
  }, [])

  const removeSpecificDate = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      fechas_especificas: prev.fechas_especificas.filter((_, i) => i !== index)
    }))
  }, [])

  const toggleUser = useCallback((userId: string) => {
    setFormData(prev => {
      const assigned = prev.usuarios_asignados.includes(userId)
        ? prev.usuarios_asignados.filter(id => id !== userId)
        : [...prev.usuarios_asignados, userId]
      return { ...prev, usuarios_asignados: assigned }
    })
  }, [])

  const addFormField = useCallback((field: FormFieldCal) => {
    setFormData(prev => ({
      ...prev,
      formulario: [...(prev.formulario || defaultFormFields), field]
    }))
  }, [])

  const removeFormField = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      formulario: prev.formulario.filter(f => f.id !== id)
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({ ...calendar })
  }, [calendar])

  return {
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    saving,
    setSaving,
    updateField,
    updateNested,
    updateDaySchedule,
    addSpecificDate,
    removeSpecificDate,
    toggleUser,
    addFormField,
    removeFormField,
    resetForm,
  }
}