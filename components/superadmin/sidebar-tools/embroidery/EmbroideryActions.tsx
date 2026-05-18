"use client"

import React from 'react'
import { Download, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface LayerInfo {
  id: string
  name: string
  color: string
  stitches: number
  svgPath?: string
}

interface Props {
  layers: LayerInfo[]
  fileName: string
  onDownloadSVG: () => void
}

export function EmbroideryActions({ layers, fileName, onDownloadSVG }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4"
    >
      <h4 className="font-black text-white uppercase tracking-tighter text-sm">Exportar Resultados</h4>
      <p className="text-sm text-zinc-500 leading-relaxed">
        El archivo SVG mantiene la separación por colores en etiquetas <code className="bg-white/5 px-1.5 py-0.5 rounded text-blis-red text-xs">&lt;g&gt;</code> para importación nativa a CorelDRAW y el puente Wilcom.
      </p>

      <button
        onClick={onDownloadSVG}
        className="w-full flex items-center justify-center gap-2 bg-blis-red hover:bg-blis-red/80 text-white px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blis-red/20 transition-all hover:shadow-xl active:scale-[0.98]"
      >
        <Download size={18} />
        Descargar SVG para Wilcom
      </button>

      <div className="bg-blis-red/5 border border-blis-red/20 rounded-xl p-4">
        <h5 className="text-xs font-black text-blis-red uppercase tracking-wider mb-2 flex items-center gap-2">
          <AlertCircle size={14} />
          Cómo importar en Wilcom
        </h5>
        <ol className="text-[10px] text-zinc-400 list-decimal pl-4 space-y-1.5 leading-relaxed">
          <li>Cambia a <strong className="text-white">Modo Gráfico</strong> (ícono CorelDRAW, arriba izq).</li>
          <li>Ve a <strong className="text-white">Archivo &gt; Importar (Ctrl+I)</strong> y selecciona el .SVG.</li>
          <li>Selecciona el diseño en el lienzo.</li>
          <li>Vuelve a <strong className="text-white">Modo Bordado</strong> o presiona <em>Convertir a bordado</em>.</li>
        </ol>
      </div>
    </motion.div>
  )
}
