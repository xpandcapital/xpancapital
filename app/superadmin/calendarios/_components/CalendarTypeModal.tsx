"use client"

import { motion } from 'framer-motion'
import { X, User, RefreshCw, GraduationCap, Users, CalendarDays, Wrench } from 'lucide-react'
import { calendarTypeLabels } from '../_types'

interface CalendarTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (tipo: string) => void
}

const calendarTypes = [
  { tipo: 'personal', icon: User, description: 'Reservas individuales de 1 a 1' },
  { tipo: 'rotacion', icon: RefreshCw, description: 'Turnos rotativos y disponibilidad' },
  { tipo: 'clases', icon: GraduationCap, description: 'Reserva de clases grupales' },
  { tipo: 'colectiva', icon: Users, description: 'Múltiples asistentes por horario' },
  { tipo: 'eventos', icon: CalendarDays, description: 'Eventos con fecha y hora fija' },
  { tipo: 'servicio', icon: Wrench, description: 'Reserva de servicios específicos' },
]

export default function CalendarTypeModal({ isOpen, onClose, onSelect }: CalendarTypeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0a0a0a] border border-white/5 rounded-3xl w-full max-w-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Nuevo Calendario</h2>
            <p className="text-white/40 text-sm mt-1">Selecciona el tipo de calendario que deseas crear</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {calendarTypes.map(({ tipo, icon: Icon, description }) => (
              <button
                key={tipo}
                onClick={() => onSelect(tipo)}
                className="group bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] hover:border-blis-red/30 transition-all duration-300 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-blis-red/10 border border-blis-red/20 flex items-center justify-center mb-4 group-hover:bg-blis-red/20 transition-colors">
                  <Icon className="w-5 h-5 text-blis-red" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blis-red transition-colors">
                  {calendarTypeLabels[tipo]}
                </h3>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  {description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}