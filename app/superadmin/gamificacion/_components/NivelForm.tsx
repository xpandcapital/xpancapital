'use client'

import { useState, useEffect } from 'react'
import type { GamificacionNivel } from '@/lib/types/database'
import type { NivelFormData } from '../_types'

interface Props {
  nivel: GamificacionNivel | null
  onSubmit: (data: NivelFormData) => Promise<void>
  onCancel: () => void
}

export function NivelForm({ nivel, onSubmit, onCancel }: Props) {
  const [nombre, setNombre] = useState(nivel?.nombre || '')
  const [color, setColor] = useState(nivel?.color || '#ff1e56')
  const [iconoSvg, setIconoSvg] = useState(nivel?.icono_svg || '')
  const [imagenUrl, setImagenUrl] = useState(nivel?.imagen_url || '')
  const [puntosReq, setPuntosReq] = useState(nivel?.puntos_requeridos || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      nombre,
      color,
      icono_svg: iconoSvg || undefined,
      imagen_url: imagenUrl || undefined,
      puntos_requeridos: puntosReq,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold text-white">{nivel ? 'Editar Rango' : 'Nuevo Rango'}</h3>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Nombre</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#ff1e56] focus:outline-none" required />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Color</label>
          <div className="flex gap-2">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded border border-gray-700 bg-transparent cursor-pointer" />
            <input value={color} onChange={e => setColor(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#ff1e56] focus:outline-none font-mono" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Ícono SVG (nombre de lucide-react)</label>
          <input value={iconoSvg} onChange={e => setIconoSvg(e.target.value)} placeholder="medal, crown, star..." className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#ff1e56] focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Imagen URL (opcional, sobreescribe ícono)</label>
          <input value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#ff1e56] focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Puntos requeridos</label>
          <input type="number" value={puntosReq} onChange={e => setPuntosReq(parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#ff1e56] focus:outline-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 px-4 py-2 bg-[#ff1e56] text-white rounded-lg text-sm hover:bg-[#e01a4c] transition-colors">Guardar</button>
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
