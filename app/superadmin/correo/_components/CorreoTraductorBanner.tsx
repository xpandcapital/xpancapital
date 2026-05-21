'use client'

import { motion } from 'framer-motion'
import { Languages, Loader2, Eye, EyeOff } from 'lucide-react'

interface Props {
  traduciendo: boolean
  mostrandoTraduccion: boolean
  onTraducir: () => void
  onVerOriginal: () => void
  idiomaOriginal?: string
}

export function CorreoTraductorBanner({ traduciendo, mostrandoTraduccion, onTraducir, onVerOriginal, idiomaOriginal }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Languages className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-sm text-amber-400 font-medium">
            {mostrandoTraduccion
              ? `Traducido a Español`
              : idiomaOriginal
                ? `Este correo está en ${idiomaOriginal}`
                : 'Traducción disponible'}
          </p>
          <p className="text-xs text-gray-500">
            {mostrandoTraduccion
              ? 'Mostrando versión traducida automáticamente'
              : 'Traduce al español con un clic'}
          </p>
        </div>
      </div>

      {traduciendo ? (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span className="text-xs text-amber-400">Traduciendo...</span>
        </div>
      ) : mostrandoTraduccion ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onVerOriginal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300
            hover:text-white hover:bg-white/10 transition-colors"
        >
          <EyeOff className="w-3.5 h-3.5" />
          Ver Original
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onTraducir}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-xs text-amber-400
            hover:bg-amber-500/30 transition-colors font-semibold"
        >
          <Languages className="w-3.5 h-3.5" />
          Traducir a Español
        </motion.button>
      )}
    </motion.div>
  )
}
