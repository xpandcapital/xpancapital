'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'

interface Props {
  visible: boolean
  originalEmail: { from?: string; subject?: string; text?: string; html?: string }
  onDraft: (text: string) => void
  onClose: () => void
}

export function CorreoRedactorIA({ visible, originalEmail, onDraft, onClose }: Props) {
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!instructions.trim()) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/correo/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalEmail, instructions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al redactar')
      onDraft(data.draft || '')
      setInstructions('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4"
    >
      <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-purple-400">Redactar con IA</span>
          <span className="text-[10px] text-gray-600 ml-auto">Gemini Flash</span>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          Describe qué quieres responder. La IA leerá el correo original y redactará una respuesta profesional.
        </p>

        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder='Ej: "Confírmale que su pedido fue enviado y llegará en 2-3 días hábiles. Adjunta el número de tracking."'
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600
            focus:outline-none focus:border-purple-500/30 transition-all resize-none h-24"
          disabled={loading}
        />

        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={!instructions.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm font-semibold
              hover:bg-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Redactando...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generar Respuesta
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
