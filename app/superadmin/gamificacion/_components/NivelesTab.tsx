'use client'

import { useState } from 'react'
import type { GamificacionNivel } from '@/lib/types/database'
import type { NivelFormData } from '../_types'
import { NivelForm } from './NivelForm'

interface Props {
  niveles: GamificacionNivel[]
  onSave: (id: string | null, data: NivelFormData) => Promise<any>
  onDelete: (id: string) => Promise<any>
}

export function NivelesTab({ niveles, onSave, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<GamificacionNivel | null>(null)

  const handleEdit = (nivel: GamificacionNivel) => {
    setEditing(nivel)
    setShowForm(true)
  }

  const handleNew = () => {
    setEditing(null)
    setShowForm(true)
  }

  const handleSubmit = async (data: NivelFormData) => {
    const result = await onSave(editing?.id || null, data)
    if (result?.success) setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Rangos / Niveles</h3>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-[#f5e100] text-white rounded-lg text-sm hover:bg-[#d4c000] transition-colors"
        >
          + Nuevo Rango
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {niveles.sort((a, b) => a.orden - b.orden).map(nivel => (
          <div
            key={nivel.id}
            className="flex items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-lg" style={{ backgroundColor: nivel.color + '30', color: nivel.color, border: `2px solid ${nivel.color}` }}>
              {nivel.nivel}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium">{nivel.nombre}</p>
              <p className="text-gray-400 text-sm">Desde {nivel.puntos_requeridos.toLocaleString()} pts</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(nivel)} className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors">Editar</button>
              <button onClick={() => onDelete(nivel.id)} className="px-3 py-1 text-xs bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <NivelForm
          nivel={editing}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

