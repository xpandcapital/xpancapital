"use client"

import React from 'react'
import { Layers } from 'lucide-react'
import { motion } from 'framer-motion'

interface LayerInfo {
  id: string
  name: string
  color: string
  stitches: number
}

interface Props {
  layers: LayerInfo[]
}

export function EmbroideryLayers({ layers }: Props) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center gap-2 shrink-0">
        <Layers size={18} className="text-blis-red" />
        <h3 className="font-black text-white uppercase tracking-tighter text-sm">Estructura SVG para Wilcom</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="text-[10px] text-zinc-500 px-2 pb-2 uppercase tracking-[0.2em] font-black">
          Jerarquía de Nodos Generada
        </div>
        <ul className="space-y-1">
          <li className="p-2 rounded flex items-center gap-2 text-sm text-zinc-300 font-mono">
            &lt;svg id=&quot;Diseno_Completo&quot;&gt;
          </li>
          {layers.map((layer, index) => (
            <motion.li
              key={layer.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="pl-6 p-2 rounded hover:bg-white/[0.03] flex items-center gap-3 text-sm transition-colors border border-transparent hover:border-white/5 cursor-default"
            >
              <div
                className="w-4 h-4 rounded-sm border border-white/20 shadow-inner shrink-0"
                style={{ backgroundColor: layer.color }}
              />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-white text-xs">{layer.id}</span>
                <span className="text-zinc-500 text-xs ml-2">({layer.name})</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                ~{layer.stitches.toLocaleString()} pts
              </div>
            </motion.li>
          ))}
          <li className="p-2 rounded flex items-center gap-2 text-sm text-zinc-300 font-mono">
            &lt;/svg&gt;
          </li>
        </ul>
      </div>
    </div>
  )
}
