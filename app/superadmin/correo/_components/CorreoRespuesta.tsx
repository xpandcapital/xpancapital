'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, Loader2, ChevronDown, Sparkles, Eye, FileText,
} from 'lucide-react'
import { CorreoRedactorIA } from './CorreoRedactorIA'
import type { EmailMessageFull } from '../_types'

interface Props {
  open: boolean
  modo: 'reply' | 'replyAll' | 'forward' | 'compose'
  mensajeOriginal?: EmailMessageFull | null
  cuentaEmail: string
  cuentaNombre: string
  cuentaFirma?: string
  cuentaId: string
  activeFolder: string
  onClose: () => void
  onEnviado: () => void
}

export function CorreoRespuesta({
  open, modo, mensajeOriginal, cuentaEmail, cuentaNombre, cuentaFirma, cuentaId, activeFolder,
  onClose, onEnviado,
}: Props) {
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [templateId, setTemplateId] = useState('none')
  const [showIA, setShowIA] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [sending, setSending] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (modo === 'reply' && mensajeOriginal) {
        setTo(mensajeOriginal.from || '')
        setSubject(`Re: ${mensajeOriginal.subject}`)
        setBody(cuentaFirma ? `\n\n---\n${cuentaFirma}` : '')
      } else if (modo === 'replyAll' && mensajeOriginal) {
        const all = [mensajeOriginal.from, mensajeOriginal.to]
          .filter(Boolean)
          .filter(e => e !== cuentaEmail)
          .join(', ')
        setTo(all)
        setSubject(`Re: ${mensajeOriginal.subject}`)
        setBody(cuentaFirma ? `\n\n---\n${cuentaFirma}` : '')
      } else if (modo === 'forward' && mensajeOriginal) {
        setTo('')
        setSubject(`Fwd: ${mensajeOriginal.subject}`)
        setBody(`\n\n--- Mensaje reenviado ---\nDe: ${mensajeOriginal.fromName} <${mensajeOriginal.from}>\nFecha: ${mensajeOriginal.date}\nAsunto: ${mensajeOriginal.subject}\n\n${mensajeOriginal.text || ''}${cuentaFirma ? `\n\n---\n${cuentaFirma}` : ''}`)
      } else {
        setTo('')
        setSubject('')
        setBody(cuentaFirma ? `\n\n---\n${cuentaFirma}` : '')
      }
      cargarTemplates()
    }
  }, [open])

  const cargarTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) setTemplates(data.data)
    } catch {}
  }

  const handleEnviar = async () => {
    if (!to.trim()) {
      setError('Destinatario requerido')
      return
    }

    setSending(true)
    setError('')

    try {
      const payload: any = {
        cuenta_id: cuentaId,
        folder: activeFolder,
        template_id: templateId !== 'none' ? templateId : undefined,
        respuesta_texto: body,
        to_email: to,
        subject,
      }

      const uid = mensajeOriginal?.uid || Date.now()

      const res = await fetch(`/api/correo/messages/${uid}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar')

      onEnviado()
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  const handleDraftIA = (text: string) => {
    setBody(prev => prev + text)
    setShowIA(false)
  }

  const handlePreviewTemplate = async () => {
    if (templateId === 'none') return
    try {
      const res = await fetch(`/api/email-templates`)
      const data = await res.json()
      const template = (data.success && Array.isArray(data.data)) ? data.data.find((t: any) => t.id === templateId) : null
      if (template) {
        const { generateHTML } = await import('@/app/superadmin/mails/lib/htmlGenerator')
        let blocks = template.blocks
        if (typeof blocks === 'string') blocks = JSON.parse(blocks)
        const settings = typeof template.settings === 'string' ? JSON.parse(template.settings) : template.settings || {}
        let html = generateHTML(blocks, settings)
        html = html.replace(/\{\{respuesta-de-correo\}\}/g, body || '(Tu respuesta aparecerá aquí)')
        setPreviewHtml(html)
        setShowPreview(true)
      }
    } catch {}
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-3xl
              shadow-2xl shadow-blis-red/5 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
              <h3 className="text-sm font-bold text-white">
                {modo === 'reply' ? 'Responder' : modo === 'replyAll' ? 'Responder a Todos' : modo === 'forward' ? 'Reenviar' : 'Nuevo Correo'}
              </h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Para</label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="correo@dominio.com"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-sm text-white
                    placeholder-gray-600 focus:outline-none focus:border-blis-red/30 transition-all"
                />
              </div>

              <AnimatePresence>
                {showCc && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">CC</label>
                    <input
                      type="text"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="cc@dominio.com"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-sm text-white
                        placeholder-gray-600 focus:outline-none focus:border-blis-red/30 transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setShowCc(!showCc)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showCc ? 'Ocultar CC' : 'Añadir CC/BCC'}
              </button>

              <div>
                <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Asunto</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-sm text-white
                    placeholder-gray-600 focus:outline-none focus:border-blis-red/30 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-medium text-gray-500 uppercase">Plantilla (opcional)</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowIA(!showIA)}
                      className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      IA
                    </button>
                    {templateId !== 'none' && (
                      <button
                        onClick={handlePreviewTemplate}
                        className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Vista previa
                      </button>
                    )}
                  </div>
                </div>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-sm text-gray-300
                    focus:outline-none focus:border-blis-red/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="none">Sin plantilla (texto plano)</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
                {templateId !== 'none' && (
                  <p className="text-[10px] text-gray-600 mt-1">
                    Escribe tu respuesta. Se insertará donde esté {'{{respuesta-de-correo}}'} en la plantilla.
                  </p>
                )}
              </div>

              <CorreoRedactorIA
                visible={showIA}
                originalEmail={{
                  from: mensajeOriginal?.from,
                  subject: mensajeOriginal?.subject,
                  text: mensajeOriginal?.text,
                  html: mensajeOriginal?.html,
                }}
                onDraft={handleDraftIA}
                onClose={() => setShowIA(false)}
              />

              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-xl border border-white/10 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-2 bg-zinc-900 border-b border-white/5">
                    <span className="text-xs text-gray-400">Vista previa de la plantilla</span>
                    <button onClick={() => setShowPreview(false)} className="text-xs text-gray-500 hover:text-white">Cerrar</button>
                  </div>
                  <div className="p-4 bg-white max-h-64 overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">
                  {templateId !== 'none' ? 'Tu Respuesta (se inserta en {{respuesta-de-correo}})' : 'Mensaje'}
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 text-sm text-white
                    placeholder-gray-600 focus:outline-none focus:border-blis-red/30 transition-all
                    resize-none min-h-[200px]"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-blis-red/10 border border-blis-red/20">
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-white/5 shrink-0">
              <span className="text-[10px] text-gray-600">
                Enviando como {cuentaEmail}
              </span>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleEnviar}
                disabled={sending || !to.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blis-red text-white text-sm font-semibold
                  hover:bg-blis-red-neon disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
