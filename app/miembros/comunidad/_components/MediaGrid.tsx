"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Pause, FileText, Download, FileSpreadsheet, FileArchive, File, FileCode, FileImage } from 'lucide-react'
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
                ) : item.tipo === 'audio' ? (
                  <AudioPlayer src={item.url_original} name={item.nombre_archivo} duration={item.duracion_segundos} />
                ) : (
                  <div className="flex items-center gap-3 p-5 bg-white/[0.02] border border-white/[0.04] min-h-[80px]">
                    <FileIconByType mime={item.mime_type} name={item.nombre_archivo} />
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
            <div className="flex items-center justify-center gap-2 py-2">
              <span className="text-[10px] text-gray-600 tabular-nums">{carouselIdx + 1}/{media.length}</span>
              <div className="flex gap-1">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); scrollTo(i) }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === carouselIdx ? 'bg-blis-red' : 'bg-white/15 hover:bg-white/30'}`}
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

function AudioPlayer({ src, name, duration }: { src: string; name?: string; duration?: number }) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [dur, setDuration] = useState(duration || 0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(src)
    audioRef.current = audio
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('ended', () => setPlaying(false))
    audio.addEventListener('loadedmetadata', () => {
      if (!duration) setDuration(audio.duration)
    })
    return () => { audio.pause(); audio.src = '' }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause() }
    else { audioRef.current.play() }
    setPlaying(!playing)
  }

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00'
    const min = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const progress = dur ? (currentTime / dur) * 100 : 0

  return (
    <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/[0.04]">
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-blis-red/10 border border-blis-red/20 flex items-center justify-center hover:bg-blis-red/20 transition-colors flex-shrink-0"
      >
        {playing ? <Pause className="w-4 h-4 text-blis-red" /> : <Play className="w-4 h-4 text-blis-red ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 truncate mb-1">{name || 'Audio'}</p>
        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full bg-blis-red/30 rounded-full transition-all duration-200" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-600 tabular-nums">{formatTime(currentTime)}</span>
          <span className="text-[10px] text-gray-600 tabular-nums">{formatTime(dur)}</span>
        </div>
      </div>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function FileIconByType({ mime, name }: { mime: string; name?: string }) {
  const ext = (name || '').split('.').pop()?.toLowerCase() || ''
  const props = { className: 'w-8 h-8 flex-shrink-0' }

  if (mime.includes('pdf') || ext === 'pdf') return <FileText {...props} className="w-8 h-8 text-red-400 flex-shrink-0" />
  if (ext === 'doc' || ext === 'docx' || mime.includes('word')) return <FileText {...props} className="w-8 h-8 text-blue-400 flex-shrink-0" />
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv' || mime.includes('excel') || mime.includes('spreadsheet')) return <FileSpreadsheet {...props} className="w-8 h-8 text-emerald-400 flex-shrink-0" />
  if (ext === 'ppt' || ext === 'pptx' || mime.includes('presentation')) return <FileText {...props} className="w-8 h-8 text-orange-400 flex-shrink-0" />
  if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar' || ext === 'gz' || mime.includes('zip') || mime.includes('rar') || mime.includes('compressed') || mime.includes('gzip')) return <FileArchive {...props} className="w-8 h-8 text-purple-400 flex-shrink-0" />
  if (ext === 'json' || ext === 'xml' || mime.includes('json') || mime.includes('xml')) return <FileCode {...props} className="w-8 h-8 text-cyan-400 flex-shrink-0" />
  if (mime.startsWith('image/')) return <FileImage {...props} className="w-8 h-8 text-pink-400 flex-shrink-0" />
  return <File {...props} className="w-8 h-8 text-gray-500 flex-shrink-0" />
}
