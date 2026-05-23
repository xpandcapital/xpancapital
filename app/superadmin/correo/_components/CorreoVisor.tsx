'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Reply, ReplyAll, Forward, Archive, Trash2, Star, Loader2,
  ChevronDown, Paperclip, Image as ImageIcon, Shield,
} from 'lucide-react'
import { useState } from 'react'
import type { EmailMessageFull, EmailTranslateResult } from '../_types'
import { sanitizeHtml } from '../_lib/sanitizer'
import { CorreoVisorAdjuntos } from './CorreoVisorAdjuntos'
import { CorreoTraductorBanner } from './CorreoTraductorBanner'
import { CorreoRespuesta } from './CorreoRespuesta'

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
  respuestaOpen: boolean
  respuestaModo: 'reply' | 'replyAll' | 'forward' | 'compose'
  onRespuestaEnviada: () => void
  onRespuestaClose: () => void
  cuentaEmail: string
  cuentaNombre: string
  cuentaFirma?: string
  cuentaPlantillaDefault?: string
}

export function CorreoVisor({
  mensaje, loading, traduciendo, mostrandoTraduccion, traduccion,
  toggleTraduccion, verOriginal, cuentaId, activeFolder, onBack, onResponder, onAccion, onExportPDF,
  respuestaOpen, respuestaModo, onRespuestaEnviada, onRespuestaClose,
  cuentaEmail, cuentaNombre, cuentaFirma, cuentaPlantillaDefault,
}: Props) {
  const [showFullHeaders, setShowFullHeaders] = useState(false)
  const [showImages, setShowImages] = useState(true)

  if (loading && !mensaje) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="flex-1 p-4 space-y-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-100 rounded w-4/6" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
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
  const rawSanitized = sanitizeHtml(htmlContent)

  // Detectar si hay imágenes
  const hasImages = /<img\b/i.test(rawSanitized)

  // Si no se muestran imagenes, remover src de TODOS los <img>
  let finalHtml = rawSanitized
  if (!showImages && hasImages) {
    finalHtml = finalHtml.replace(/<img\b[^>]*>/gi, (match) => {
      // Quitar src y srcset, mantener alt
      const alt = match.match(/alt\s*=\s*["']([^"']*)["']/i)?.[1] || 'Imagen bloqueada'
      return `<div style="background:#f3f4f6;border-radius:6px;padding:16px;text-align:center;color:#9ca3af;font-size:12px;margin:8px 0">🖼 ${alt}</div>`
    })
  }

  const sanitizedHtml = finalHtml

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden max-w-full">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h3 className="text-sm font-bold text-gray-900 leading-snug break-words">{mensaje.subject}</h3>
          {loading && mensaje && (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
              <Loader2 className="w-2.5 h-2.5 animate-spin" /> actualizando
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => onAccion(mensaje.isFlagged ? 'unflag' : 'flag', mensaje.uid)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={mensaje.isFlagged ? 'Quitar estrella' : 'Marcar con estrella'}>
            <Star className={`w-3.5 h-3.5 ${mensaje.isFlagged ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
          </button>
          <button onClick={() => onAccion('moveToArchive', mensaje.uid)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors" title="Archivar">
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onAccion('delete', mensaje.uid)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Eliminar">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-white max-w-full" style={{ overflowX: 'clip', contain: 'layout style', maxWidth: '100%' }}>
        <div className="p-3 md:p-4 max-w-full mx-auto">
          {/* From/To header */}
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex items-start gap-2.5 md:gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-blis-red/20 flex items-center justify-center text-[10px] md:text-xs font-bold text-blis-red shrink-0">
                {(mensaje.fromName || mensaje.from).substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">


                <p className="text-sm font-semibold text-gray-900 break-words inline-flex items-center gap-1.5">
                  {mensaje.fromName || mensaje.from}
                  {mensaje.spoofing && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> SPOOF
                    </span>
                  )}
                </p>
                <div className="text-[11px] md:text-xs text-gray-500 mt-1.5 space-y-0.5">
                  <div className="flex items-baseline gap-1.5"><span className="text-gray-400 font-medium shrink-0 w-10">De:</span><span className="break-all text-gray-700">{mensaje.from}</span></div>
                  <div className="flex items-baseline gap-1.5"><span className="text-gray-400 font-medium shrink-0 w-10">Para:</span><span className="break-all text-gray-700">{mensaje.to || mensaje.from}</span></div>
                  {mensaje.cc && <div className="flex items-baseline gap-1.5"><span className="text-gray-400 font-medium shrink-0 w-10">CC:</span><span className="break-all text-gray-600">{mensaje.cc}</span></div>}
                  <div className="flex items-baseline gap-1.5"><span className="text-gray-400 font-medium shrink-0 w-10">Fecha:</span><span className="text-gray-600">{new Date(mensaje.date).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                </div>
                <div className="mt-1.5">
                  <CorreoTraductorBanner
                    traduciendo={traduciendo}
                    mostrandoTraduccion={mostrandoTraduccion}
                    onTraducir={() => toggleTraduccion()}
                    onVerOriginal={verOriginal}
                  />
                </div>

                {/* Detalles forenses (colapsable) */}
                <button onClick={() => setShowFullHeaders(!showFullHeaders)}
                  className={`flex items-center gap-1 mt-2 text-[11px] transition-colors ${mensaje.spoofing ? 'text-red-500 hover:text-red-600 font-medium' : 'text-gray-400 hover:text-gray-600'}`}>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showFullHeaders ? 'rotate-180' : ''}`} />
                  {showFullHeaders ? 'Ocultar análisis' : 'Ver análisis forense'}
                  {mensaje.spoofing && <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-1" />}
                </button>

                <AnimatePresence>
                  {showFullHeaders && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden">
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-[11px]">
                        {/* Spoofing info */}
                        {mensaje.spoofing && mensaje.spoofingDetail && (
                          <div className="p-2 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-xs font-bold text-red-700 mb-1">Suplantación de identidad detectada</p>
                            <div className="space-y-0.5 text-[10px]">
                              <p className="text-red-600"><span className="font-medium">Visible:</span> {mensaje.spoofingDetail.visibleFrom}</p>
                              <p className="text-red-600"><span className="font-medium">Real:</span> {mensaje.spoofingDetail.realSender}</p>
                              {mensaje.spoofingDetail.senderIP && <p className="text-red-500"><span className="font-medium">IP:</span> {mensaje.spoofingDetail.senderIP}</p>}
                            </div>
                          </div>
                        )}
                        {/* Return-Path vs From */}
                        {mensaje.returnPath && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Return-Path</span>
                            <span className={`font-mono ${mensaje.returnPath !== mensaje.from ? 'text-red-600' : 'text-gray-600'}`}>{mensaje.returnPath}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Message-ID</span>
                          <span className="text-gray-500 font-mono text-[10px] truncate max-w-[300px]">{mensaje.messageId || '—'}</span>
                        </div>
                        {mensaje.senderIP && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">IP origen</span>
                            <span className="text-gray-600 font-mono">{mensaje.senderIP}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tamaño</span>
                          <span className="text-gray-600">{(mensaje.size / 1024).toFixed(1)} KB</span>
                        </div>
                        {/* Authentication Results */}
                        {mensaje.authResults && (
                          <div>
                            <p className="text-gray-400 mb-1">Authentication-Results</p>
                            <p className="text-gray-500 font-mono text-[10px] break-all">{mensaje.authResults}</p>
                          </div>
                        )}
                        {/* Received chain */}
                        {mensaje.receivedHeaders && mensaje.receivedHeaders.length > 0 && (
                          <div>
                            <p className="text-gray-400 mb-1">Cadena de servidores ({mensaje.receivedHeaders.length} saltos)</p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {mensaje.receivedHeaders.map((h, i) => (
                                <p key={i} className="text-gray-500 font-mono text-[10px] leading-relaxed">
                                  <span className="text-gray-400">{i + 1}.</span> {h}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Metadata */}
                        <div className="pt-1.5 border-t border-gray-200 flex justify-between">
                          <span className="text-gray-400">Flags IMAP</span>
                          <span className="text-gray-600 font-mono text-[10px]">{(mensaje.flags || []).join(', ') || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Attachments</span>
                          <span className="text-gray-600">{(mensaje.attachments || []).length} archivos</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Reply buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => onResponder('reply')} title="Responder (R)"
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition-colors font-medium">
                <Reply className="w-3.5 h-3.5" /> Responder
              </button>
              <button onClick={() => onResponder('replyAll')} title="Responder a todos (Ctrl+A)"
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                <ReplyAll className="w-4 h-4" />
              </button>
              <button onClick={() => onResponder('forward')} title="Reenviar (F)"
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                <Forward className="w-4 h-4" />
              </button>
              {hasImages && (
                <button
                  onClick={() => setShowImages(!showImages)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${showImages ? 'bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200' : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'}`}
                  title={showImages ? 'Ocultar imágenes' : 'Mostrar imágenes bloqueadas'}
                >
                  <ImageIcon className="w-3 h-3" /> {showImages ? 'Ocultar imágenes' : 'Mostrar imágenes'}
                </button>
              )}
            </div>
          </div>

          {/* Email body */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="prose prose-sm max-w-none text-gray-900 overflow-hidden break-words
              [&_a]:text-blis-red [&_a]:no-underline [&_a:hover]:underline
              [&_img]:max-w-full [&_img]:rounded-xl [&_table]:max-w-full [&_table]:block [&_table]:overflow-x-auto"
            style={{ maxWidth: '100%', overflowX: 'clip', wordBreak: 'break-word' }}
          >
            {sanitizedHtml ? (
              <div
                style={{ maxWidth: '100%', overflow: 'hidden', contain: 'layout' }}
                dangerouslySetInnerHTML={{ __html: `<style>.blis-email-content, .blis-email-content div, .blis-email-content p, .blis-email-content table, .blis-email-content td, .blis-email-content tr, .blis-email-content th, .blis-email-content img, .blis-email-content a, .blis-email-content span, .blis-email-content ul, .blis-email-content ol, .blis-email-content li, .blis-email-content h1, .blis-email-content h2, .blis-email-content h3, .blis-email-content h4, .blis-email-content h5, .blis-email-content h6, .blis-email-content blockquote, .blis-email-content pre{max-width:100%!important;word-wrap:break-word!important;overflow-wrap:break-word!important}.blis-email-content img{max-width:100%!important;height:auto!important}.blis-email-content table{max-width:100%!important;display:block!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important}.blis-email-content *{box-sizing:border-box!important}</style><div class="blis-email-content" style="max-width:100%;overflow:hidden;word-break:break-word">${sanitizedHtml}</div>` }}
                key={`msg-${mensaje.uid}-img-${showImages ? '1' : '0'}-tr-${mostrandoTraduccion ? '1' : '0'}`} />
            ) : (
              <p className="text-gray-500 italic">(Sin contenido)</p>
            )}
          </motion.div>

          {/* Attachments */}
          <CorreoVisorAdjuntos attachments={mensaje.attachments || []} />
        </div>
      </div>

      {/* Respuesta inline (se muestra debajo del contenido) */}
      <CorreoRespuesta
        open={respuestaOpen && !!mensaje}
        modo={respuestaModo}
        mensajeOriginal={mensaje}
        cuentaEmail={cuentaEmail}
        cuentaNombre={cuentaNombre}
        cuentaFirma={cuentaFirma}
        cuentaPlantillaDefault={cuentaPlantillaDefault}
        cuentaId={cuentaId}
        activeFolder={activeFolder}
        onClose={onRespuestaClose}
        onEnviado={onRespuestaEnviada}
      />
    </div>
  )
}
