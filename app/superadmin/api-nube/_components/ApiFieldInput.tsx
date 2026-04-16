"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Copy, CheckCircle2, XCircle, Loader2, Check, ExternalLink } from "lucide-react"
import { useState } from "react"
import type { ApiField, ApiStatus } from '../_types'

interface ApiFieldInputProps {
  field: ApiField
  value: string
  note: string
  status: ApiStatus
  showKey: boolean
  onValueChange: (value: string) => void
  onNoteChange: (note: string) => void
  onToggleShow: () => void
  onCopy: () => void
  onTest: () => void
  copied: boolean
}

export function ApiFieldInput({
  field,
  value,
  note,
  status,
  showKey,
  onValueChange,
  onNoteChange,
  onToggleShow,
  onCopy,
  onTest,
  copied
}: ApiFieldInputProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'testing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default: return null
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <label className="text-sm font-bold text-white mb-1 block">{field.label}</label>
          <p className="text-xs text-gray-500">{field.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            field.accessType === 'Pública' 
              ? 'bg-emerald-500/10 text-emerald-500' 
              : 'bg-amber-500/10 text-amber-500'
          }`}>
            {field.accessType}
          </span>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            field.cost === 'gratis' 
              ? 'bg-blue-500/10 text-blue-500' 
              : field.cost === 'freemium'
              ? 'bg-purple-500/10 text-purple-500'
              : 'bg-rose-500/10 text-rose-500'
          }`}>
            {field.cost}
          </span>
        </div>
      </div>

      <div className="relative">
        <input
          type={field.type === 'password' && !showKey ? 'password' : 'text'}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 pr-24 text-sm text-white placeholder:text-gray-800 focus:outline-none focus:border-white/30 transition-colors"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {field.type === 'password' && (
            <button
              onClick={onToggleShow}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title={showKey ? 'Ocultar' : 'Mostrar'}
            >
              {showKey ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
            </button>
          )}
          
          <button
            onClick={onCopy}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Copiar"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
          </button>

          {field.testEndpoint && (
            <button
              onClick={onTest}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Probar conexión"
            >
              {getStatusIcon()}
            </button>
          )}

          {field.docsUrl && (
            <a
              href={field.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Ver documentación"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-3">
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Agregar nota..."
          className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-gray-400 placeholder:text-gray-800 focus:outline-none focus:border-white/20 transition-colors"
        />
      </div>
    </motion.div>
  )
}