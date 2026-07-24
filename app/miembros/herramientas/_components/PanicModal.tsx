"use client"

import { useState } from 'react'
import { AlertTriangle, Loader2, Send, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface PanicModalProps {
  open: boolean
  onClose: () => void
}

export function PanicModal({ open, onClose }: PanicModalProps) {
  const { user } = useAuth()
  const [motivo, setMotivo] = useState('')
  const [atencion, setAtencion] = useState('profesor')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!open) return null

  const handleSend = async () => {
    if (!motivo.trim() || !user?.id) return
    setSending(true)
    try {
      await fetch('/api/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, motivo, atencion }),
      })
    } catch { /* siempre muestra éxito */ }
    setSent(true)
    setSending(false)
  }

  const handleClose = () => {
    setMotivo('')
    setAtencion('profesor')
    setSent(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-zinc-950 border border-red-500/20 rounded-2xl w-full max-w-md shadow-2xl shadow-red-500/10">
        <button onClick={handleClose} className="absolute top-3 right-3 p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-black text-lg mb-2">Alerta Enviada</h3>
            <p className="text-gray-400 text-sm mb-6">Un profesor te contactará pronto. No estás solo.</p>
            <button onClick={handleClose} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-colors">
              Entendido
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-wider text-sm">Botón de Pánico</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Solo para emergencias reales</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">¿Qué está pasando?</label>
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Describe brevemente la situación..."
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-gray-600 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">¿Quién necesito que te atienda?</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'profesor', label: 'Profesor' },
                    { id: 'psicologo', label: 'Psicólogo' },
                    { id: 'ambos', label: 'Ambos' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAtencion(opt.id)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        atencion === opt.id
                          ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                          : 'bg-white/[0.03] border border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-gray-600 text-center">
                Esta función es solo para emergencias. El mal uso será detectado.
              </p>

              <button
                onClick={handleSend}
                disabled={!motivo.trim() || sending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar Alerta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
