"use client"

import React from 'react'
import { Box, Layers } from 'lucide-react'
import { motion } from 'framer-motion'

interface LayerInfo {
  id: string
  name: string
  color: string
  stitches: number
}

interface Props {
  previewImage: string | null
  layers: LayerInfo[]
}

export function EmbroideryResult({ previewImage, layers }: Props) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full pb-4 overflow-hidden">
      <div className="flex-[3] flex flex-col bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <h3 className="font-black text-white uppercase tracking-tighter flex items-center gap-2 text-sm">
            <Box size={18} className="text-blis-red" />
            Previsualización Fotorrealista
          </h3>
          <span className="text-[10px] bg-blis-red/10 text-blis-red px-2 py-1 rounded-full font-black uppercase tracking-widest border border-blis-red/20">
            IA Render
          </span>
        </div>
        <div
          className="flex-1 p-6 flex items-center justify-center relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative group max-h-full max-w-full flex items-center justify-center"
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Bordado 3D"
                className="max-h-[55vh] max-w-full object-contain drop-shadow-2xl rounded-sm transition-transform duration-500 ease-out hover:scale-[1.02]"
                style={{ imageRendering: 'auto' }}
              />
            ) : (
              <div className="w-64 h-64 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                <p className="text-zinc-600 text-xs uppercase font-black tracking-widest">Sin preview</p>
              </div>
            )}
            <div className="absolute -bottom-4 bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-wider pointer-events-none border border-white/10">
              Simulación de puntadas (Tatami &amp; Satín)
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-[2] flex flex-col gap-6 overflow-auto">
        <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 shrink-0">
            <Layers size={18} className="text-blis-red" />
            <h3 className="font-black text-white uppercase tracking-tighter text-sm">Estructura SVG Wilcom</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="text-[10px] text-zinc-500 px-2 pb-2 uppercase tracking-[0.2em] font-black">
              Jerarquía de Capas
            </div>
            <ul className="space-y-1">
              <li className="p-2 rounded flex items-center gap-2 text-sm text-zinc-300 font-mono">
                &lt;svg id=&quot;Diseno_Completo&quot;&gt;
              </li>
              {layers.map((layer) => (
                <motion.li
                  key={layer.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: layers.indexOf(layer) * 0.06 }}
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
      </div>
    </div>
  )
}
