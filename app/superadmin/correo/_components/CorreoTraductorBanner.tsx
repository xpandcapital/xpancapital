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
    <span className="inline-flex items-center">
      {traduciendo ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] text-blue-600 font-medium">
          <Loader2 className="w-2.5 h-2.5 animate-spin" />
          Traduciendo...
        </span>
      ) : mostrandoTraduccion ? (
        <button
          onClick={onVerOriginal}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] text-blue-600 font-medium hover:bg-blue-100 hover:border-blue-300 transition-colors"
        >
          <Languages className="w-2.5 h-2.5" />
          Ver original
        </button>
      ) : (
        <button
          onClick={onTraducir}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] text-blue-600 font-medium hover:bg-blue-100 hover:border-blue-300 transition-colors"
          title="Traducir a español"
        >
          <Languages className="w-2.5 h-2.5" />
          Traducir
        </button>
      )}
    </span>
  )
}
