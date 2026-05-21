'use client'

import { Languages, Loader2 } from 'lucide-react'

interface Props {
  traduciendo: boolean
  mostrandoTraduccion: boolean
  onTraducir: () => void
  onVerOriginal: () => void
}

export function CorreoTraductorBanner({ traduciendo, mostrandoTraduccion, onTraducir, onVerOriginal }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      {traduciendo ? (
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          Traduciendo...
        </span>
      ) : mostrandoTraduccion ? (
        <button
          onClick={onVerOriginal}
          className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
        >
          <Languages className="w-3 h-3" />
          Ver original
        </button>
      ) : (
        <button
          onClick={onTraducir}
          className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-white transition-colors"
          title="Traducir a español"
        >
          <Languages className="w-3 h-3" />
          Traducir
        </button>
      )}
    </span>
  )
}
