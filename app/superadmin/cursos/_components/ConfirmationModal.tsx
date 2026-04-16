'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import type { ConfirmDelete } from '../_types'

interface ConfirmationModalProps {
  confirmDelete: ConfirmDelete
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationModal({ confirmDelete, onConfirm, onCancel }: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {confirmDelete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm space-y-6 shadow-2xl ring-1 ring-white/10 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-black uppercase text-xs tracking-widest">¿Confirmar Eliminación?</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Estás a punto de borrar <span className="text-white">"{confirmDelete.title}"</span>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-4 bg-white/5 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all">Cancelar</button>
              <button onClick={onConfirm} className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Eliminar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}