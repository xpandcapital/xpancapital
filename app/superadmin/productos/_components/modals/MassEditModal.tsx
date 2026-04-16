"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Layers, X } from "lucide-react"
import { createPortal } from "react-dom"

interface MassEditModalProps {
  isOpen: boolean
  selectedCount: number
  categories: string[]
  statuses: string[]
  massEditData: { category: string; status: string }
  onCategoryChange: (category: string) => void
  onStatusChange: (status: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export function MassEditModal({
  isOpen,
  selectedCount,
  categories,
  statuses,
  massEditData,
  onCategoryChange,
  onStatusChange,
  onConfirm,
  onCancel
}: MassEditModalProps) {
  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-[0_0_50px_rgba(255,255,255,0.05)] space-y-8 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Layers className="w-6 h-6 text-blis-red" /> Editar {selectedCount} Productos
            </h3>
            <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cambiar Categoría</label>
              <select
                value={massEditData.category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-blis-red appearance-none"
              >
                <option value="" className="bg-zinc-900">Mantener actual</option>
                {categories.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cambiar Estado</label>
              <select
                value={massEditData.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-blis-red appearance-none"
              >
                <option value="" className="bg-zinc-900">Mantener actual</option>
                {statuses.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button onClick={onCancel} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black text-gray-300 uppercase tracking-widest transition-all">
              Cancelar
            </button>
            <button onClick={onConfirm} className="flex-1 py-4 bg-blis-red text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blis-red/20 active:scale-95">
              Aplicar Cambios
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}