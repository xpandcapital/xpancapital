'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, Loader2, ChevronDown, Sparkles, Eye, FileText,
  Paperclip, Bold, Italic, Underline, Link, Image as ImageIcon,
} from 'lucide-react'
import { CorreoRedactorIA } from './CorreoRedactorIA'
import type { EmailMessageFull } from '../_types'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

interface Props {
  open: boolean
  modo: 'reply' | 'replyAll' | 'forward' | 'compose'
  mensajeOriginal?: EmailMessageFull | null
  cuentaEmail: string
  cuentaNombre: string
  cuentaFirma?: string
  cuentaPlantillaDefault?: string
  cuentaId: string
  activeFolder: string
  onClose: () => void
  onEnviado: () => void
}

export function CorreoRespuesta({
  open, modo, mensajeOriginal, cuentaEmail, cuentaNombre, cuentaFirma, cuentaPlantillaDefault, cuentaId, activeFolder,
  onClose, onEnviado,
}: Props) {
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [templateId, setTemplateId] = useState(cuentaPlantillaDefault || 'none')
  const [showIA, setShowIA] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [sending, setSending] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [error, setError] = useState('')
  const [archivos, setArchivos] = useState<Array<{ filename: string; content: string; contentType: string; size: number }>>([])
  const [uploadingAdjunto, setUploadingAdjunto] = useState(false)
  const adjuntoRef = useRef<HTMLInputElement>(null)

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

  const handleAdjuntarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingAdjunto(true)
    const nuevos: typeof archivos = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.readAsDataURL(f)
        })
        nuevos.push({ filename: f.name, content: base64, contentType: f.type, size: f.size })
      } catch {}
    }
    setArchivos(prev => [...prev, ...nuevos])
    setUploadingAdjunto(false)
    if (adjuntoRef.current) adjuntoRef.current.value = ''
  }

  const handleGuardarBorrador = () => {
    try {
      const borrador = { to, cc, subject, body, templateId, timestamp: Date.now() }
      localStorage.setItem(`blis_correo_draft_${cuentaId}`, JSON.stringify(borrador))
      alert('Borrador guardado localmente.')
    } catch {}
    onClose()
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
        attachments: archivos.length > 0 ? archivos : undefined,
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
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={modo === 'compose'
            ? 'bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden'
            : 'border-t border-gray-200 bg-white overflow-hidden'
          }
        >
          <div className={modo === 'compose' ? 'p-5 md:p-8 space-y-4' : 'p-4 md:p-6 space-y-3 w-full'}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className={modo === 'compose'
                ? 'text-lg font-black text-white uppercase tracking-tight'
                : 'text-sm font-bold text-gray-900'
              }>
                {modo === 'reply' ? 'Responder' : modo === 'replyAll' ? 'Responder a Todos' : modo === 'forward' ? 'Reenviar' : 'Nuevo Correo'}
              </h3>
              {modo === 'compose' && (
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Enviando como {cuentaEmail}</span>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white transition-colors">
                <X className={modo === 'compose' ? 'w-5 h-5' : 'w-4 h-4'} />
              </button>
            </div>

            {/* Para */}
            <div>
              <label className={`block mb-1.5 font-bold uppercase tracking-wider ${modo === 'compose' ? 'text-[10px] text-gray-500' : 'text-[10px] text-gray-500'}`}>Para</label>
              <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="correo@dominio.com"
                className={`w-full rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blis-red/50 transition-all ${
                  modo === 'compose'
                    ? 'bg-white/[0.05] border border-white/10 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {/* CC */}
            <AnimatePresence>
              {showCc && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <input type="text" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="cc@dominio.com"
                    className={`w-full rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blis-red/50 transition-all ${
                      modo === 'compose'
                        ? 'bg-white/[0.05] border border-white/10 text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-900'
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowCc(!showCc)} className="text-[11px] text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                <span className={`rounded-full w-4 h-4 border text-[9px] flex items-center justify-center ${showCc ? 'border-gray-400 bg-gray-400 text-white' : 'border-gray-500'}`}>{showCc ? '−' : '+'}</span>
                CC
              </button>
              <span className="text-gray-600">•</span>
              <span className="text-[11px] text-gray-500">De: <b className="text-gray-400">{cuentaEmail}</b></span>
            </div>

            {/* Asunto */}
            <div>
              <label className={`block mb-1.5 font-bold uppercase tracking-wider ${modo === 'compose' ? 'text-[10px] text-gray-500' : 'text-[10px] text-gray-500'}`}>Asunto</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blis-red/50 transition-all ${
                  modo === 'compose'
                    ? 'bg-white/[0.05] border border-white/10 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {/* Plantilla opcional (solo en compose, colapsable) */}
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between p-2 bg-zinc-900 border-b border-white/5">
                  <span className="text-xs text-gray-400">Vista previa de la plantilla</span>
                  <button onClick={() => setShowPreview(false)} className="text-xs text-gray-500 hover:text-white">Cerrar</button>
                </div>
                <div className="p-4 bg-white max-h-64 overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              </motion.div>
            )}

            {/* Área de mensaje con toolbar */}
            <div>
              <label className={`block mb-1.5 font-bold uppercase tracking-wider ${modo === 'compose' ? 'text-[10px] text-gray-500' : 'text-[10px] text-gray-500'}`}>
                {modo === 'compose' ? 'Mensaje' : (templateId !== 'none' ? 'Tu Respuesta' : 'Mensaje')}
              </label>
              {/* HTML Toolbar */}
              <div className={`flex items-center gap-0.5 p-1.5 border-b-0 rounded-t-xl ${modo === 'compose' ? 'bg-white/[0.05] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                {[
                  { icon: Bold, tag: 'b', title: 'Negrita' },
                  { icon: Italic, tag: 'i', title: 'Cursiva' },
                  { icon: Underline, tag: 'u', title: 'Subrayado' },
                ].map(({ icon: Icon, tag, title }) => (
                  <button key={tag} type="button" onClick={() => {
                    const ta = document.getElementById('respuesta-textarea') as HTMLTextAreaElement
                    if (!ta) return
                    const s = ta.selectionStart, e = ta.selectionEnd
                    const sel = body.substring(s, e)
                    const wrapped = `<${tag}>${sel}</${tag}>`
                    const nuevo = body.substring(0, s) + wrapped + body.substring(e)
                    setBody(nuevo)
                    setTimeout(() => { ta.selectionStart = s; ta.selectionEnd = s + wrapped.length }, 0)
                  }} title={title}
                    className={`p-1.5 rounded transition-colors ${modo === 'compose' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
                <div className={`w-px h-4 mx-1 ${modo === 'compose' ? 'bg-white/10' : 'bg-gray-300'}`} />
                <button type="button" onClick={() => {
                  const ta = document.getElementById('respuesta-textarea') as HTMLTextAreaElement
                  if (!ta) return
                  const url = prompt('URL:') || ''
                  if (!url) return
                  const s = ta.selectionStart, e = ta.selectionEnd
                  const sel = body.substring(s, e) || url
                  const wrapped = `<a href="${url}">${sel}</a>`
                  const nuevo = body.substring(0, s) + wrapped + body.substring(e)
                  setBody(nuevo)
                }} title="Insertar enlace"
                  className={`p-1.5 rounded transition-colors ${modo === 'compose' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                >
                  <Link className="w-3.5 h-3.5" />
                </button>
                <div className={`w-px h-4 mx-1 ${modo === 'compose' ? 'bg-white/10' : 'bg-gray-300'}`} />
                <input type="file" ref={adjuntoRef} accept="*/*" multiple onChange={handleAdjuntarArchivo} className="hidden" />
                <button type="button" onClick={() => adjuntoRef.current?.click()} disabled={uploadingAdjunto} title="Adjuntar archivos"
                  className={`flex items-center gap-1 p-1.5 rounded transition-colors ${modo === 'compose' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                >
                  {uploadingAdjunto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                </button>
              </div>
              <textarea
                id="respuesta-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className={`rounded-b-xl p-4 text-sm placeholder-gray-400 focus:outline-none focus:border-blis-red/50 transition-all resize-none ${
                  modo === 'compose'
                    ? 'w-full min-h-[400px] md:min-h-[500px] bg-white/[0.05] border border-white/10 border-t-0 text-white'
                    : 'bg-white border border-gray-200 border-t-0 text-gray-900 min-h-[300px] md:min-h-[400px]'
                }`}
              />
              {/* Adjuntos */}
              {archivos.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{archivos.length} adjunto(s)</p>
                  {archivos.map((a, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${modo === 'compose' ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <span className={`truncate flex items-center gap-1.5 ${modo === 'compose' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <Paperclip className="w-3 h-3 text-gray-400" /> {a.filename} ({(a.size / 1024).toFixed(1)} KB)
                      </span>
                      <button onClick={() => setArchivos(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 ml-2">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mensaje forwarded original (solo en forward) */}
            {modo === 'forward' && mensajeOriginal && (
              <div className={`rounded-xl p-4 border mt-2 ${modo === 'compose' ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Mensaje Original</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p><span className="text-gray-500">De:</span> {mensajeOriginal.fromName} &lt;{mensajeOriginal.from}&gt;</p>
                  <p><span className="text-gray-500">Fecha:</span> {new Date(mensajeOriginal.date).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p><span className="text-gray-500">Asunto:</span> {mensajeOriginal.subject}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-blis-red/10 border border-blis-red/20">
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Footer con botones */}
          <div className={`flex items-center justify-between px-5 py-4 border-t ${modo === 'compose' ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center gap-2">
              <button onClick={handleGuardarBorrador} className="text-[10px] text-gray-500 hover:text-white transition-colors">
                Guardar borrador
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${modo === 'compose' ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-700'}`}>
                Cancelar
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleEnviar}
                disabled={sending || !to.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  modo === 'compose'
                    ? 'bg-[#f5e100] text-black hover:bg-[#e8d000] shadow-lg shadow-[#f5e100]/20'
                    : 'bg-blis-red text-white hover:bg-blis-red-neon'
                }`}
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="w-4 h-4" /> Enviar</>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
