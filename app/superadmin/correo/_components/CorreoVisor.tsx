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
  const [showImages, setShowImages] = useState(false)

  if (loading && !mensaje) {
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
  let finalHtml = sanitizeHtml(htmlContent)

  // Si no se muestran imagenes, reemplazar src por placeholder
  if (!showImages) {
    finalHtml = finalHtml.replace(/<img\s+[^>]*src="https?:\/\/[^"]*"[^>]*>/gi, (match) => {
      const alt = match.match(/alt="([^"]*)"/)?.[1] || 'Imagen no cargada'
      return match.replace(/src="[^"]*"/, `src="" alt="${alt}" style="display:none"`)
    })
  }

  const sanitizedHtml = finalHtml
  const hasImages = /<img[^>]+src="https?:\/\//i.test(sanitizeHtml(htmlContent))
  const blockedCount = !showImages && hasImages

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h3 className="text-sm font-bold text-gray-900 truncate">{mensaje.subject}</h3>
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide bg-white">
        <div className="p-4 max-w-3xl mx-auto">
          {/* From/To header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blis-red/20 flex items-center justify-center text-xs font-bold text-blis-red shrink-0">
                {(mensaje.fromName || mensaje.from).substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{mensaje.fromName || mensaje.from}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {mensaje.from}
                  {mensaje.to && mensaje.to !== mensaje.from && <span className="ml-2 text-gray-400">para {mensaje.to}</span>}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                  {new Date(mensaje.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  <span className="text-gray-300">·</span>
                  <CorreoTraductorBanner
                    traduciendo={traduciendo}
                    mostrandoTraduccion={mostrandoTraduccion}
                    onTraducir={() => toggleTraduccion()}
                    onVerOriginal={verOriginal}
                  />
                </p>

                {/* Alerta de suplantacion (spoofing) */}
                {mensaje.spoofing && mensaje.spoofingDetail && (
                  <div className="mt-2 mb-1 p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> ALERTA: Posible suplantación de identidad
                    </p>
                    <div className="space-y-1 text-[11px]">
                      <p className="text-red-600">
                        <span className="font-medium">Remitente visible (From):</span> {mensaje.spoofingDetail.visibleFrom}
                      </p>
                      <p className="text-red-600">
                        <span className="font-medium">Remitente real (Return-Path):</span> {mensaje.spoofingDetail.realSender}
                      </p>
                      {mensaje.spoofingDetail.senderIP && (
                        <p className="text-red-500">
                          <span className="font-medium">IP de origen:</span> {mensaje.spoofingDetail.senderIP}
                        </p>
                      )}
                      <p className="text-red-400 mt-1 text-[10px]">
                        El remitente visible no coincide con el remitente real del sobre SMTP. 
                        Este correo fue enviado desde un servidor externo haciéndose pasar por {mensaje.from?.split('@')[1] || 'este dominio'}.
                      </p>
                    </div>
                  </div>
                )}

                {/* Detalles forenses (colapsable) */}
                <button onClick={() => setShowFullHeaders(!showFullHeaders)}
                  className="flex items-center gap-1 mt-2 text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showFullHeaders ? 'rotate-180' : ''}`} />
                  {showFullHeaders ? 'Ocultar análisis' : 'Ver análisis forense'}
                </button>

                <AnimatePresence>
                  {showFullHeaders && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden">
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-[11px]">
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
            <div className="flex items-center gap-1">
              <button onClick={() => onResponder('reply')} title="Responder (R)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 transition-colors">
                <Reply className="w-3 h-3" /> Responder
              </button>
              <button onClick={() => onResponder('replyAll')} title="Responder a todos (Ctrl+A)"
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                <ReplyAll className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onResponder('forward')} title="Reenviar (F)"
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                <Forward className="w-3.5 h-3.5" />
              </button>
              {blockedCount && (
                <button
                  onClick={() => setShowImages(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                  title="Mostrar imágenes bloqueadas"
                >
                  <ImageIcon className="w-3 h-3" /> Mostrar imágenes
                </button>
              )}
            </div>
          </div>

          {/* Email body */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="prose prose-sm max-w-none text-gray-900 overflow-hidden
              [&_a]:text-blis-red [&_a]:no-underline [&_a:hover]:underline
              [&_img]:max-w-full [&_img]:rounded-xl [&_table]:max-w-full [&_table]:block [&_table]:overflow-x-auto"
          >
            {sanitizedHtml ? (
              <div
                style={{ maxWidth: '100%', overflow: 'hidden', contain: 'layout' }}
                dangerouslySetInnerHTML={{ __html: `<style>img{max-width:100%!important;height:auto!important}table{max-width:100%!important;display:block!important;overflow-x:auto!important}*{max-width:100%!important;box-sizing:border-box!important;word-wrap:break-word!important}</style><div style="max-width:100%;overflow:hidden">${sanitizedHtml}</div>` }} />
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
