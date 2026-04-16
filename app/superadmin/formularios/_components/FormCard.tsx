'use client'

import { motion } from 'framer-motion'
import { Eye, Pencil, Users, MousePointerClick, TrendingUp, Trash2 } from 'lucide-react'
import type { Formulario } from '../_types'

interface FormCardProps {
  form: Formulario
  onEdit: (form: Formulario) => void
  onPublic: (form: Formulario) => void
  onDelete?: (form: Formulario) => void
}

const statusConfig = {
  publicado: { label: 'Publicado', dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  borrador: { label: 'Borrador', dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  pausado: { label: 'Pausado', dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
} as const

export function FormCard({ form, onEdit, onPublic, onDelete }: FormCardProps) {
  const status = statusConfig[form.estado]
  const conversion = form.vistas > 0 ? ((form.respuestas / form.vistas) * 100).toFixed(1) : '0.0'

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-zinc-950 border border-white/10 rounded-2xl p-5 hover:border-blis-red/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{form.nombre}</h3>
          <p className="text-[11px] text-gray-500 mt-1">/{form.slug}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${status.bg} ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Eye className="w-3 h-3" />
            <span className="text-[10px] uppercase font-bold">Vistas</span>
          </div>
          <p className="text-sm font-bold text-white">{form.vistas.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <MousePointerClick className="w-3 h-3" />
            <span className="text-[10px] uppercase font-bold">Resp.</span>
          </div>
          <p className="text-sm font-bold text-white">{form.respuestas.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <TrendingUp className="w-3 h-3" />
            <span className="text-[10px] uppercase font-bold">Conv.</span>
          </div>
          <p className="text-sm font-bold text-white">{conversion}%</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(form)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-blis-red hover:bg-blis-red/80 text-white text-[11px] font-bold py-2 rounded-xl transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </button>
        <button
          onClick={() => onPublic(form)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-[11px] font-bold py-2 rounded-xl transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver Público
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(form)}
            className="flex items-center justify-center bg-white/5 hover:bg-blis-red/10 border border-white/10 text-white/20 hover:text-blis-red text-[11px] font-bold py-2 px-3 rounded-xl transition-all"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}