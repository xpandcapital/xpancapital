"use client"

import { motion } from 'framer-motion'
import { MapPin, Video, Users, Calendar, Clock, Link2 } from 'lucide-react'
import type { ComunidadEvento } from '../_types'

interface EventoCardProps {
  evento: ComunidadEvento
  onInscribir: () => void
  onCancelar: () => void
}

export function EventoCard({ evento, onInscribir, onCancelar }: EventoCardProps) {
  const pasado = new Date(evento.fecha_inicio) < new Date()
  const lleno = !!(evento.capacidad && (evento.inscritos_count || 0) >= evento.capacidad)
  const IconoTipo = evento.es_digital ? Video : MapPin

  const formatFecha = (f: string) => {
    return new Date(f).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10 p-4 md:p-5 space-y-3"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">📅</span>
        <div className="flex-1">
          <h4 className="text-white font-bold text-base md:text-lg">{evento.titulo}</h4>
          {evento.descripcion && <p className="text-gray-400 text-sm mt-1 line-clamp-2">{evento.descripcion}</p>}
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
          evento.tipo === 'presencial' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          evento.tipo === 'digital' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
          'bg-purple-500/10 text-purple-400 border border-purple-500/20'
        }`}>
          {evento.tipo === 'presencial' ? 'Presencial' : evento.tipo === 'digital' ? 'Digital' : 'Híbrido'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>{formatFecha(evento.fecha_inicio)}</span>
        </div>
        {evento.hora_inicio && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{evento.hora_inicio}{evento.hora_fin ? ` — ${evento.hora_fin}` : ''}</span>
          </div>
        )}
        {evento.ubicacion && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <IconoTipo className="w-3.5 h-3.5 text-purple-400" />
            <span className="line-clamp-1">{evento.ubicacion}</span>
          </div>
        )}
        {evento.url_evento && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <Link2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="line-clamp-1 text-blue-400">{evento.url_evento}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-1">
          <Users className="w-3.5 h-3.5" />
          <span>
            {evento.inscritos_count || 0}{evento.capacidad ? ` / ${evento.capacidad}` : ''} inscritos
            {lleno && <span className="text-red-400 ml-1">· Completo</span>}
          </span>
        </div>
        {evento.usuario_inscrito ? (
          <button
            onClick={onCancelar}
            disabled={pasado}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            Cancelar asistencia
          </button>
        ) : (
          <button
            onClick={onInscribir}
            disabled={pasado || lleno}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blis-red/10 text-blis-red border border-blis-red/20 hover:bg-blis-red/20 transition-colors disabled:opacity-50"
          >
            {pasado ? 'Finalizado' : lleno ? 'Lleno' : 'Asistiré'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
