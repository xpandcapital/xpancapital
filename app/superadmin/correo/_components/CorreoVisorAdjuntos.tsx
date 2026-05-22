'use client'

import { useState } from 'react'
import type { EmailAttachment } from '../_types'

interface Props {
  attachments: EmailAttachment[]
}

function isPreviewablePdf(mimeType: string): boolean {
  return mimeType === 'application/pdf' || mimeType.includes('pdf')
}

function isPreviewableImage(mimeType: string): boolean {
  return mimeType.startsWith('image/') && mimeType !== 'image/svg+xml'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function CorreoVisorAdjuntos({ attachments }: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  if (!attachments || attachments.length === 0) return null

  const inlineImages = attachments.filter(a => a.inline)
  const realAttachments = attachments.filter(a => !a.inline && a.filename)

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
        {realAttachments.length} adjunto{realAttachments.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-2">
        {realAttachments.map((att, i) => {
          const id = `att-${i}-${att.filename}`
          const isPdf = isPreviewablePdf(att.mimeType)
          const isImg = isPreviewableImage(att.mimeType)

          return (
            <div key={id}>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200
                hover:bg-gray-100 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-blis-red/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-blis-red uppercase">
                    {att.mimeType.split('/')[1]?.substring(0, 4) || 'FILE'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{att.filename}</p>
                  <p className="text-[11px] text-gray-500">{formatSize(att.size)}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(isPdf || isImg) && (
                    <button
                      onClick={() => isImg ? setImagePreview(att.content) : setPreviewId(id)}
                      className="px-3 py-1.5 rounded-lg bg-gray-200 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-300 transition-colors"
                    >
                      Previsualizar
                    </button>
                  )}
                  <a
                    href={`data:${att.mimeType};base64,${att.content}`}
                    download={att.filename}
                    className="px-3 py-1.5 rounded-lg bg-blis-red/20 text-xs text-blis-red hover:bg-blis-red/30 transition-colors"
                  >
                    Descargar
                  </a>
                </div>
              </div>

              {previewId === id && isPdf && (
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-black">
                  <div className="flex items-center justify-between p-2 bg-zinc-900">
                    <span className="text-xs text-gray-400">{att.filename}</span>
                    <button
                      onClick={() => setPreviewId(null)}
                      className="text-xs text-gray-500 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>
                  <iframe
                    src={`data:${att.mimeType};base64,${att.content}`}
                    className="w-full h-[500px]"
                    title={att.filename}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {imagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setImagePreview(null)}
        >
          <img
            src={`data:image/*;base64,${imagePreview}`}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  )
}
