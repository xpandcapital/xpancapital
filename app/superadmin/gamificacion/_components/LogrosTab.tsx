'use client'

import { useState } from 'react'
import type { GamificacionLogro } from '@/lib/types/database'
import type { LogroFormData } from '../_types'
import { LogroForm } from './LogroForm'

interface Props {
  logros: GamificacionLogro[]
  onSave: (id: string | null, data: LogroFormData) => Promise<any>
  onDelete: (id: string) => Promise<any>
}

const tipoLabel: Record<string, string> = {
  cursos: 'Cursos',
  comunidad: 'Comunidad',
  blog: 'Blog',
  certificados: 'Certificados',
  racha: 'Racha',
  social: 'Social',
  especial: 'Especial',
}

export function LogrosTab({ logros, onSave, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<GamificacionLogro | null>(null)

  const handleEdit = (logro: GamificacionLogro) => {
    setEditing(logro)
    setShowForm(true)
  }

  const handleNew = () => {
    setEditing(null)
    setShowForm(true)
  }

  const handleSubmit = async (data: LogroFormData) => {
    const result = await onSave(editing?.id || null, data)
    if (result?.success) setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Logros / Insignias</h3>
        <button
          onClick={handleNew}
          className="px-4 py-2 bg-[#ff1e56] text-white rounded-lg text-sm hover:bg-[#e01a4c] transition-colors"
        >
          + Nuevo Logro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {logros.map(logro => (
          <div
            key={logro.id}
            className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${logro.activo ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                    {logro.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-xs text-gray-500">{tipoLabel[logro.tipo] || logro.tipo}</span>
                </div>
                <p className="text-white font-medium">{logro.nombre}</p>
                {logro.descripcion && <p className="text-gray-400 text-sm mt-1">{logro.descripcion}</p>}
                {logro.puntos_bonus > 0 && (
                  <p className="text-[#ff1e56] text-xs mt-1">+{logro.puntos_bonus} pts bonus</p>
                )}
                {logro.condicion && (
                  <p className="text-gray-600 text-xs mt-1 font-mono truncate">
                    {JSON.stringify(logro.condicion)}
                  </p>
                )}
              </div>
              <div className="flex gap-2 ml-3">
                <button onClick={() => handleEdit(logro)} className="px-3 py-1 text-xs bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors">Editar</button>
                <button onClick={() => onDelete(logro.id)} className="px-3 py-1 text-xs bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
        {logros.length === 0 && (
          <p className="text-gray-500 text-sm col-span-2 text-center py-8">No hay logros creados aún</p>
        )}
      </div>

      {showForm && (
        <LogroForm
          logro={editing}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
