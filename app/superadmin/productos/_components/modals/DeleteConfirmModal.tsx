"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, XCircle } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  isBulk?: boolean
  count?: number
}

export function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  isBulk = false,
  count = 0
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              {isBulk ? `¿Eliminar ${count} productos?` : '¿Eliminar producto?'}
            </h3>
            
            <p className="text-gray-400 text-sm mb-6">
              {isBulk 
                ? 'Esta acción es permanente y no se puede deshacer.'
                : 'Esta acción es permanente y no se puede deshacer.'}
            </p>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}