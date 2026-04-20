"use client"

import { Briefcase, ExternalLink, Copy, Trash2, Users, FileQuestion, ToggleLeft, ToggleRight } from 'lucide-react'
import { PuestoTrabajo, PuestoPregunta } from '../../_types'

interface PuestoCardProps {
  puesto: PuestoTrabajo
  preguntaCount: number
  isSelected: boolean
  onClick: () => void
  onToggleActivo: (id: string, activo: boolean) => void
  onDelete: (id: string) => void
  onCopyLink: (slug: string) => void
  onPreview: (slug: string) => void
}

export function PuestoCard({ puesto, preguntaCount, isSelected, onClick, onToggleActivo, onDelete, onCopyLink, onPreview }: PuestoCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border p-5 transition-all cursor-pointer hover:scale-[1.01] ${
        isSelected
          ? 'bg-blis-red/5 border-blis-red/30 shadow-lg shadow-blis-red/5'
          : 'bg-zinc-950 border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isSelected ? 'bg-blis-red/20 text-blis-red' : 'bg-white/5 text-gray-500 group-hover:text-white'
          }`}>
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
              {puesto.nombre}
            </h3>
            <p className="text-gray-600 text-[11px] font-mono">/{puesto.slug}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleActivo(puesto.id, !puesto.activo) }}
          className="shrink-0"
          title={puesto.activo ? 'Desactivar' : 'Activar'}
        >
          {puesto.activo
            ? <ToggleRight className="w-6 h-6 text-emerald-400 hover:text-emerald-300" />
            : <ToggleLeft className="w-6 h-6 text-gray-600 hover:text-gray-400" />
          }
        </button>
      </div>

      {puesto.descripcion && (
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">{puesto.descripcion}</p>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 text-xs">
          <FileQuestion className={`w-3.5 h-3.5 ${isSelected ? 'text-blis-red' : 'text-gray-600'}`} />
          <span className={isSelected ? 'text-gray-300' : 'text-gray-500'}>{preguntaCount} preguntas</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          puesto.activo
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
        }`}>
          {puesto.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onCopyLink(puesto.slug)}
          className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
        >
          <Copy className="w-3 h-3" />Link
        </button>
        <button
          onClick={() => onPreview(puesto.slug)}
          className="flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />Vista
        </button>
        <button
          onClick={() => onDelete(puesto.id)}
          className="py-1.5 px-2 text-[10px] font-bold rounded-lg bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}