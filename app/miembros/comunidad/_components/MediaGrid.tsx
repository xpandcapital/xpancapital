"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Play, FileText, Download } from 'lucide-react'
import type { ComunidadPostMedia } from '../_types'

interface MediaGridProps {
  media: ComunidadPostMedia[]
}

export function MediaGrid({ media }: MediaGridProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    if (media[index].tipo === 'imagen') setLightbox(index)
  }

  const containerClass = media.length === 1
    ? 'grid-cols-1'
    : media.length === 2
      ? 'grid-cols-2'
      : media.length === 3
        ? 'grid-cols-2'
        : 'grid-cols-2'

  return (
    <>
      <div className={`grid ${containerClass} gap-1.5`}>
        {media.map((item, i) => (
          <div
            key={item.id}
            className={`relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.04] cursor-pointer group ${
              media.length === 3 && i === 0 ? 'row-span-2' : ''
            }`}
            onClick={() => openLightbox(i)}
          >
            {item.tipo === 'imagen' && (
              <>
                <Image
                  src={item.url_comprimida || item.url_original}
                  alt=""
                  width={600}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ aspectRatio: media.length === 1 ? '16/9' : '1/1' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </>
            )}
            {item.tipo === 'video' && (
              <div className="relative w-full aspect-video bg-black/40 flex items-center justify-center">
                {item.url_thumbnail ? (
                  <Image src={item.url_thumbnail} alt="" fill className="object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-blis-red/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
                {item.duracion_segundos && (
                  <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
                    {Math.floor(item.duracion_segundos / 60)}:{String(item.duracion_segundos % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
            )}
            {item.tipo === 'archivo' && (
              <div className="flex items-center gap-3 p-4 min-h-[80px]">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{item.nombre_archivo || 'Archivo'}</p>
                  <p className="text-xs text-gray-500">{formatBytes(item.tamaño_original)}</p>
                </div>
                <a
                  href={item.url_original}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Download className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            {lightbox > 0 && (
              <button
                onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1) }}
                className="absolute left-4 p-2 text-white/60 hover:text-white transition-colors z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            {lightbox < media.filter(m => m.tipo === 'imagen').length - 1 && (
              <button
                onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1) }}
                className="absolute right-4 p-2 text-white/60 hover:text-white transition-colors z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
            <motion.div
              key={lightbox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={media[lightbox].url_original}
                alt=""
                width={1200}
                height={800}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
