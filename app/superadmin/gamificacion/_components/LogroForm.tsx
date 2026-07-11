'use client'

import { useState } from 'react'
import type { GamificacionLogro } from '@/lib/types/database'
import type { LogroFormData } from '../_types'

interface Props {
  logro: GamificacionLogro | null
  onSubmit: (data: LogroFormData) => Promise<void>
  onCancel: () => void
}

export function LogroForm({ logro, onSubmit, onCancel }: Props) {
  const [nombre, setNombre] = useState(logro?.nombre || '')
  const [descripcion, setDescripcion] = useState(logro?.descripcion || '')
  const [tipo, setTipo] = useState<LogroFormData['tipo']>(logro?.tipo as LogroFormData['tipo'] || 'cursos')
  const [iconoSvg, setIconoSvg] = useState(logro?.icono_svg || '')
  const [imagenUrl, setImagenUrl] = useState(logro?.imagen_url || '')
  const [condicionJson, setCondicionJson] = useState(JSON.stringify(logro?.condicion || {}, null, 2))
  const [puntosBonus, setPuntosBonus] = useState(logro?.puntos_bonus || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let condicion = {}
    try { condicion = JSON.parse(condicionJson) } catch {}
    onSubmit({
      nombre,
      descripcion: descripcion || undefined,
      tipo,
      icono_svg: iconoSvg || undefined,
      imagen_url: imagenUrl || undefined,
      condicion,
      puntos_bonus: puntosBonus,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg space-y-4">
        <h3 className="text-lg font-semibold text-white">{logro ? 'Editar Logro' : 'Nuevo Logro'}</h3>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Nombre</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#f5e100] focus:outline-none" required />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Descripción</label>
          <input value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#f5e100] focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as LogroFormData['tipo'])} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#f5e100] focus:outline-none">
            <option value="cursos">Cursos</option>
            <option value="comunidad">Comunidad</option>
            <option value="blog">Blog</option>
            <option value="certificados">Certificados</option>
            <option value="racha">Racha</option>
            <option value="social">Social</option>
            <option value="especial">Especial</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Ícono SVG</label>
            <input value={iconoSvg} onChange={e => setIconoSvg(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#f5e100] focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Imagen URL</label>
            <input value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#f5e100] focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Condición (JSON)</label>
          <textarea value={condicionJson} onChange={e => setCondicionJson(e.target.value)} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm font-mono focus:border-[#f5e100] focus:outline-none" placeholder='{"cursos_completados": 5}' />
          <p className="text-xs text-gray-600 mt-1">Ej: {"{"}"cursos_completados": 5{"}"}, {"{"}"comentarios": 10{"}"}, {"{"}"racha_dias": 7{"}"}, {"{"}"puntos_totales": 10000{"}"}</p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Puntos bonus al desbloquear</label>
          <input type="number" value={puntosBonus} onChange={e => setPuntosBonus(parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#f5e100] focus:outline-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 px-4 py-2 bg-[#f5e100] text-white rounded-lg text-sm hover:bg-[#d4c000] transition-colors">Guardar</button>
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">Cancelar</button>
        </div>
      </form>
    </div>
  )
}

