"use client"

import { Edit2, ExternalLink, Clock } from 'lucide-react'
import type { Calendario } from '../_types'
import { calendarTypeLabels } from '../_types'

interface CalendarCardProps {
  calendar: Calendario
  onEdit: (calendar: Calendario) => void
  onPublic: (calendar: Calendario) => void
}

export default function CalendarCard({ calendar, onEdit, onPublic }: CalendarCardProps) {
  const typeLabel = calendarTypeLabels[calendar.tipo] || calendar.tipo

  const typeColors: Record<string, string> = {
    personal: 'from-blue-500 to-blue-700',
    rotacion: 'from-purple-500 to-purple-700',
    clases: 'from-emerald-500 to-emerald-700',
    colectiva: 'from-amber-500 to-amber-700',
    eventos: 'from-pink-500 to-pink-700',
    servicio: 'from-cyan-500 to-cyan-700',
  }

  const gradient = typeColors[calendar.tipo] || 'from-zinc-500 to-zinc-700'

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500 group">
      <div className="h-2 bg-gradient-to-r" style={{ background: `linear-gradient(to right, ${calendar.color_principal}, #000)` }} />
      <div className="relative h-24 bg-gradient-to-br to-black/60 overflow-hidden" style={{ backgroundImage: `linear-gradient(to bottom right, ${calendar.color_principal}22, transparent)` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white/30" />
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r ${gradient} text-white`}>
            {typeLabel}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 rounded-full border-2 border-white/20 shadow-lg" style={{ backgroundColor: calendar.color_principal }} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-1 truncate">{calendar.nombre}</h3>
        {calendar.descripcion && (
          <p className="text-sm text-white/40 mb-4 line-clamp-2">{calendar.descripcion}</p>
        )}
        {!calendar.descripcion && <div className="mb-4" />}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-white/30">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{calendar.duracion}min</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/30">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {calendar.tipo_horario === 'semanal' ? 'Semanal' : 'Fechas específicas'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(calendar)}
            className="flex-1 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Editar</span>
          </button>
          <button
            onClick={() => onPublic(calendar)}
            className="py-2.5 px-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
            title="Ver página pública"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}