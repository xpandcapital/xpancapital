"use client"

import { motion } from 'framer-motion'
import { Globe, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { Transmision } from '../_types'

interface TransmisionHistorialProps {
  historial: Transmision[]
  loading: boolean
  onEliminar: (id: string) => Promise<void>
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-MX')
}

export function TransmisionHistorial({ historial, loading, onEliminar }: TransmisionHistorialProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/[0.02] rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (historial.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <Globe className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-bold text-gray-500">Sin transmisiones</p>
        <p className="text-[11px]">El historial aparecerá aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {historial
        .filter((t) => !t.activo)
        .map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <div className="p-1.5 rounded-lg bg-white/5">
              {t.activo ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{t.titulo}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <a href={t.link} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 truncate flex items-center gap-1">
                  <Globe className="w-3 h-3 shrink-0" />
                  {t.link}
                </a>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatFecha(t.creado_en)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onEliminar(t.id)}
              className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}

      {historial.filter((t) => t.activo).length === 0 && historial.filter((t) => !t.activo).length > 0 && (
        <p className="text-center text-gray-600 text-[11px] pt-4">No hay más transmisiones en el historial</p>
      )}
    </div>
  )
}
