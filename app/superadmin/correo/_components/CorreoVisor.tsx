'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Reply, ReplyAll, Forward, Archive, AlertTriangle, Trash2, Star, Loader2,
  ChevronDown, Paperclip, FileDown,
} from 'lucide-react'
import { useState } from 'react'
import type { EmailMessageFull, EmailTranslateResult } from '../_types'
import { sanitizeHtml } from '../_lib/sanitizer'
import { CorreoVisorAdjuntos } from './CorreoVisorAdjuntos'
import { CorreoTraductorBanner } from './CorreoTraductorBanner'

interface Props {
  mensaje: EmailMessageFull | null
  loading: boolean
  traduciendo: boolean
  mostrandoTraduccion: boolean
  traduccion: EmailTranslateResult | null
  toggleTraduccion: () => void
  verOriginal: () => void
  cuentaId: string
  activeFolder: string
  onBack?: () => void
  onResponder: (modo: 'reply' | 'replyAll' | 'forward') => void
  onAccion: (action: string, uid: number) => void
  onExportPDF: () => void
}

export function CorreoVisor({
  mensaje, loading, traduciendo, mostrandoTraduccion, traduccion,
  toggleTraduccion, verOriginal, cuentaId, activeFolder, onBack, onResponder, onAccion, onExportPDF
}: Props) {
  const [showFullHeaders, setShowFullHeaders] = useState(false)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!mensaje) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Selecciona un correo para leerlo</p>
        </div>
      </div>
    )
  }

  const htmlContent = mostrandoTraduccion && traduccion?.translatedHtml
    ? traduccion.translatedHtml
    : (mensaje.html || mensaje.text || '')
  const sanitizedHtml = sanitizeHtml(htmlContent)

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 lg:hidden">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h3 className="text-sm font-bold text-white truncate">{mensaje.subject}</h3>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => onAccion(mensaje.isFlagged ? 'unflag' : 'flag', mensaje.uid)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <Star className={`w-3.5 h-3.5 ${mensaje.isFlagged ? 'text-amber-500 fill-amber-500' : 'text-gray-500'}`} />
          </button>
          <button onClick={() => onAccion('moveToArchive', mensaje.uid)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onAccion('moveToSpam', mensaje.uid)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onAccion('delete', mensaje.uid)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onExportPDF}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors" title="Imprimir / PDF">
            <FileDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 max-w-3xl">
          {/* From/To header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blis-red/20 flex items-center justify-center text-xs font-bold text-blis-red shrink-0">
                {(mensaje.fromName || mensaje.from).substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{mensaje.fromName || mensaje.from}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {mensaje.from}
                  {mensaje.to && mensaje.to !== mensaje.from && <span className="ml-2 text-gray-600">para {mensaje.to}</span>}
                </p>
                <p className="text-[11px] text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                  {new Date(mensaje.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  <span className="text-gray-700">·</span>
                  <CorreoTraductorBanner
                    traduciendo={traduciendo}
                    mostrandoTraduccion={mostrandoTraduccion}
                    onTraducir={() => toggleTraduccion()}
                    onVerOriginal={verOriginal}
                  />
                </p>
              </div>
            </div>

            {/* Reply buttons */}
            <div className="flex items-center gap-1">
              <button onClick={() => onResponder('reply')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <Reply className="w-3 h-3" /> Responder
              </button>
              <button onClick={() => onResponder('replyAll')}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                <ReplyAll className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onResponder('forward')}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                <Forward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Email body */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="prose prose-sm prose-invert max-w-none
              [&_a]:text-blis-red [&_a]:no-underline [&_a:hover]:underline
              [&_img]:max-w-full [&_img]:rounded-xl"
          >
            {sanitizedHtml ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
            ) : (
              <p className="text-gray-500 italic">(Sin contenido)</p>
            )}
          </motion.div>

          {/* Attachments */}
          <CorreoVisorAdjuntos attachments={mensaje.attachments || []} />

          {/* Full headers */}
          <button onClick={() => setShowFullHeaders(!showFullHeaders)}
            className="flex items-center gap-1 mt-4 text-xs text-gray-600 hover:text-gray-400 transition-colors">
            <ChevronDown className={`w-3 h-3 transition-transform ${showFullHeaders ? 'rotate-180' : ''}`} />
            {showFullHeaders ? 'Ocultar detalles' : 'Ver detalles completos'}
          </button>

          <AnimatePresence>
            {showFullHeaders && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                {mensaje.messageId && <div className="flex gap-2 text-xs"><span className="text-gray-600 w-20 shrink-0">Message-ID:</span><span className="text-gray-500 font-mono truncate">{mensaje.messageId}</span></div>}
                {mensaje.inReplyTo && <div className="flex gap-2 text-xs"><span className="text-gray-600 w-20 shrink-0">In-Reply-To:</span><span className="text-gray-500 font-mono truncate">{mensaje.inReplyTo}</span></div>}
                <div className="flex gap-2 text-xs"><span className="text-gray-600 w-20 shrink-0">Tamaño:</span><span className="text-gray-500">{(mensaje.size / 1024).toFixed(1)} KB</span></div>
                <div className="flex gap-2 text-xs"><span className="text-gray-600 w-20 shrink-0">UID:</span><span className="text-gray-500 font-mono">{mensaje.uid}</span></div>
                {mensaje.cc && <div className="flex gap-2 text-xs"><span className="text-gray-600 w-20 shrink-0">CC:</span><span className="text-gray-500 truncate">{mensaje.cc}</span></div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
