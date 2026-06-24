"use client"

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, FileText, Download } from 'lucide-react'
import type { ComunidadPostMedia, ComunidadPost, ReaccionTipo } from '../_types'

interface MediaGridProps {
  media: ComunidadPostMedia[]
  post?: ComunidadPost
  onReaccionar?: (postId: string, tipo: ReaccionTipo) => void
}

export function MediaGrid({ media }: MediaGridProps) {
  return <MediaGridInner media={media} />
}

function MediaGridInner({ media }: MediaGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [carouselIdx, setCarouselIdx] = useState(0)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setCarouselIdx(idx)
  }

  const scrollTo = (idx: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: el.clientWidth * idx, behavior: 'smooth' })
  }

  const isSingleImage = media.length === 1 && media[0].tipo === 'imagen'

  return (
    <div>
      {isSingleImage ? (
        /* Imagen única: centrada, altura fija, sin recorte */
        <div className="max-h-[500px] flex items-center justify-center bg-black/30 rounded-xl overflow-hidden border border-white/[0.04]">
          <Image
            src={media[0].url_comprimida || media[0].url_original}
            alt=""
            width={1200}
            height={900}
            className="max-h-[500px] w-auto h-auto object-contain"
            unoptimized
          />
        </div>
      ) : (
        /* Carrusel horizontal con flechas */
        <div className="relative group/carousel">
          {/* Flecha izquierda */}
          {carouselIdx > 0 && (
            <button
              onClick={() => scrollTo(carouselIdx - 1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.06] flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-xl"
            onScroll={handleScroll}
          >
            {media.map((item, i) => (
              <div key={item.id} className="snap-center flex-shrink-0 w-full">
                {item.tipo === 'imagen' ? (
                  <div className="relative max-h-[440px] flex items-center justify-center bg-black/30 border border-white/[0.04] overflow-hidden">
                    <Image
                      src={item.url_comprimida || item.url_original}
                      alt=""
                      width={1200}
                      height={900}
                      className="max-h-[440px] w-auto h-auto object-contain"
                      unoptimized
                    />
                  </div>
                ) : item.tipo === 'video' ? (
                  <div className="relative aspect-video bg-black/40 flex items-center justify-center border border-white/[0.04] overflow-hidden">
                    {item.url_thumbnail ? (
                      <Image src={item.url_thumbnail} alt="" fill className="object-cover opacity-60" />
                    ) : null}
                    <Play className="w-14 h-14 text-white/30 absolute" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-5 bg-white/[0.02] border border-white/[0.04] min-h-[80px]">
                    <FileText className="w-8 h-8 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-300 truncate">{item.nombre_archivo || 'Archivo'}</p>
                      <p className="text-xs text-gray-500">{formatBytes(item.tamaño_original)}</p>
                    </div>
                    <a href={item.url_original} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/10">
                      <Download className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Flecha derecha */}
          {carouselIdx < media.length - 1 && (
            <button
              onClick={() => scrollTo(carouselIdx + 1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/[0.06] flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Dots + counter */}
          {media.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
              <span className="text-[10px] text-white/80 tabular-nums">{carouselIdx + 1}/{media.length}</span>
              <div className="flex gap-1">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); scrollTo(i) }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === carouselIdx ? 'bg-blis-red' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
