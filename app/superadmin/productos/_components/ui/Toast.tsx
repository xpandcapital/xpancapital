"use client"

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

interface ToastProps {
  show: boolean
  type: 'success' | 'deleted' | 'error'
  message?: string
  onClose?: () => void
}

export function Toast({ show, type, message, onClose }: ToastProps) {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-2xl
            ${type === 'success' ? 'bg-emerald-500/90' : ''}
            ${type === 'deleted' ? 'bg-red-500/90' : ''}
            ${type === 'error' ? 'bg-red-600/90' : ''}
            backdrop-blur-xl border border-white/10 shadow-2xl
          `}>
            {type === 'success' && <CheckCircle2 className="w-5 h-5 text-white" />}
            {type === 'deleted' && <XCircle className="w-5 h-5 text-white" />}
            {type === 'error' && <XCircle className="w-5 h-5 text-white" />}
            <span className="text-white font-bold text-sm">
              {message || (type === 'success' ? 'Guardado correctamente' : type === 'deleted' ? 'Eliminado correctamente' : 'Error')}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}