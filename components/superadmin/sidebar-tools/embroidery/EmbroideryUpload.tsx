"use client"

import React, { useRef } from 'react'
import { UploadCloud, Shapes, Image, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export type DesignType = 'logo' | 'ilustracion'

interface Props {
  onFileSelect: (file: File, designType: DesignType, enhance: boolean) => void
  disabled?: boolean
}

export function EmbroideryUpload({ onFileSelect, disabled }: Props) {
  const dropRef = useRef<HTMLDivElement>(null)
  const [isOver, setIsOver] = React.useState(false)
  const [designType, setDesignType] = React.useState<DesignType>('logo')
  const [enhance, setEnhance] = React.useState(true)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOver(false)
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    onFileSelect(file, designType, enhance)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOver(false)
    if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFile(e.target.files[0])
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-6">
        <motion.h2
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black uppercase tracking-tighter text-white"
        >
          Convertir imagen a <span className="text-blis-red">bordado</span>
        </motion.h2>

        <div className="flex items-center justify-center gap-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setDesignType('logo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                designType === 'logo'
                  ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Shapes size={14} />
              Logo / Color Plano
            </button>
            <button
              onClick={() => setDesignType('ilustracion')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                designType === 'ilustracion'
                  ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Image size={14} />
              Ilustración / Foto
            </button>
          </div>
        </div>

        <p className="text-zinc-500 text-xs max-w-md mx-auto">
          {designType === 'logo'
            ? 'Óptimo para logos, íconos y texto. Trazos nítidos, colores planos, sin degradados.'
            : 'Para ilustraciones y fotos. Suaviza degradados, reduce a 6 colores, curvas orgánicas.'}
        </p>

        <div className="flex items-center justify-center">
          <button
            onClick={() => setEnhance(!enhance)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              enhance
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/5'
                : 'bg-white/5 border border-white/10 text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <Sparkles size={14} className={enhance ? 'text-amber-400' : ''} />
            Mejora IA (Real-ESRGAN)
          </button>
        </div>
        {enhance && (
          <p className="text-amber-400/60 text-[10px] max-w-sm mx-auto">
            La IA reconstruye bordes, limpia ruido y escala 4x antes de vectorizar. Consume tokens de Replicate.
          </p>
        )}

        <motion.div
          ref={dropRef}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('bordado-file-input')?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center
            cursor-pointer transition-all duration-200
            ${isOver
              ? 'border-blis-red bg-blis-red/10 scale-[1.02]'
              : 'border-white/10 bg-black/20 hover:border-blis-red/40 hover:bg-blis-red/5'
            }
            ${disabled ? 'opacity-40 pointer-events-none' : ''}
          `}
        >
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all
            ${isOver ? 'bg-blis-red/20 text-blis-red scale-110' : 'bg-blis-red/10 text-blis-red'}
          `}>
            <UploadCloud size={40} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {isOver ? 'Suelta tu imagen aquí' : 'Arrastra tu imagen aquí'}
          </h3>
          <p className="text-sm text-zinc-500">
            o haz clic para explorar archivos (JPG, PNG)
          </p>
          <input
            type="file"
            id="bordado-file-input"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput}
            disabled={disabled}
          />
        </motion.div>
      </div>
    </div>
  )
}
