"use client"

import React from 'react'
import { Loader2, CheckCircle, UploadCloud, PenTool, Box, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const STEPS = [
  { id: 'upload', label: 'Subiendo y preparando imagen', icon: UploadCloud },
  { id: 'enhance', label: 'Mejora IA — Real-ESRGAN 4x', icon: Sparkles },
  { id: 'quantize', label: 'Extrayendo colores dominantes (Sharp)', icon: PenTool },
  { id: 'vectorize', label: 'Vectorizando curvas (Potrace)', icon: PenTool },
  { id: 'render', label: 'Generando previsualización 3D (Gemini)', icon: Box },
]

interface Props {
  currentStep: number
  originalImage: string | null
  error?: string
}

export function EmbroideryProgress({ currentStep, originalImage, error }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/40 border border-white/5 rounded-2xl p-8 max-w-md w-full"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            {originalImage && (
              <img
                src={originalImage}
                alt="Original"
                className="w-32 h-32 object-cover rounded-xl shadow-md opacity-50"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={48} className="text-blis-red animate-spin" />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-black text-white text-center mb-6 uppercase tracking-tighter">
          {error ? 'Error detectado' : 'Procesando diseño...'}
        </h3>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          {STEPS.slice(0, error ? 6 : currentStep + 1).map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep && !error
            const isDone = index < currentStep
            const isFailed = error && index === currentStep

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`
                  flex items-center gap-4 p-3 rounded-lg transition-colors
                  ${isActive ? 'bg-blis-red/10 border border-blis-red/20' : ''}
                  ${isFailed ? 'bg-red-500/10 border border-red-500/20' : ''}
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${isDone ? 'bg-emerald-500/20 text-emerald-400' :
                    isFailed ? 'bg-red-500/20 text-red-400' :
                    isActive ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20' :
                    'bg-white/5 text-zinc-600'}
                `}>
                  {isDone ? <CheckCircle size={16} /> :
                   isFailed ? <CheckCircle size={16} /> :
                   <StepIcon size={14} />}
                </div>
                <span className={`
                  text-sm font-bold uppercase tracking-wider
                  ${isActive ? 'text-blis-red' :
                    isDone ? 'text-zinc-400' :
                    isFailed ? 'text-red-400' :
                    'text-zinc-600'}
                `}>
                  {step.label}
                </span>
                {isActive && <Loader2 size={12} className="ml-auto text-blis-red animate-spin" />}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
