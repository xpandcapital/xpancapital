"use client"

import { use } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  Loader2,
  Video,
  Package,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEntregaProducto } from '@/lib/hooks/useEntregaProducto'
import { useToast } from '@/components/ui/Toast'

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

function getFileIcon(tipo: string | null) {
  if (!tipo) return <FileText className="w-5 h-5" />
  const t = tipo.toLowerCase()
  if (t.includes('zip') || t.includes('rar') || t.includes('7z')) return <FileArchive className="w-5 h-5 text-amber-400" />
  if (t.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />
  if (t.includes('notion')) return <ExternalLink className="w-5 h-5 text-purple-400" />
  if (t.includes('figma')) return <ExternalLink className="w-5 h-5 text-pink-400" />
  return <FileText className="w-5 h-5" />
}

export default function ProductoEntregaPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: productoId } = use(params)
  const { user } = useAuth()
  const { showToast } = useToast()
  const { data, loading, error, descargarArchivo, abrirEnlace, descargarZip } = useEntregaProducto(
    productoId,
    user?.id || null
  )

  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [preparingZip, setPreparingZip] = useState(false)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)

  const handleDescargar = async (archivoId: string, _nombre: string) => {
    try {
      setDownloadingId(archivoId)
      const url = await descargarArchivo(archivoId)
      if (url) {
        window.open(url, '_blank')
        showToast('Descarga iniciada', 'success')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al descargar', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleAbrirEnlace = async (archivoId: string) => {
    try {
      await abrirEnlace(archivoId)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al abrir enlace', 'error')
    }
  }

  const handleDescargarZip = async () => {
    try {
      setPreparingZip(true)
      const result = await descargarZip()
      if (result?.url) {
        window.open(result.url, '_blank')
        showToast('Descarga iniciada', 'success')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al crear ZIP', 'error')
    } finally {
      setPreparingZip(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
        <Package className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Inicia sesión para ver este producto</h2>
        <p className="text-gray-500 mb-6">Accede a tu cuenta para ver los productos adquiridos.</p>
        <Link href="/login" className="px-6 py-3 bg-blis-red text-white rounded-xl font-bold">
          Iniciar Sesión
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
        <Package className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Producto no encontrado</h2>
        <p className="text-gray-500 mb-6">{error || 'No tienes acceso a este producto'}</p>
        <Link href="/miembros/productos" className="px-6 py-3 bg-blis-red text-white rounded-xl font-bold">
          Ver mis productos
        </Link>
      </div>
    )
  }

  const { producto, videos, archivos } = data
  const archivosParaDescargar = archivos.filter(a => a.tipo_entrega === 'archivo')
  const enlacesExternos = archivos.filter(a => a.tipo_entrega === 'enlace')

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/miembros/productos"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Volver a Mis Productos</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-zinc-900/50 rounded-[2rem] overflow-hidden border border-white/5">
            {producto.imagen_principal && (
              <div className="relative w-full h-64 md:h-80">
                <Image
                  src={producto.imagen_principal}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
              </div>
            )}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blis-red/20 text-blis-red text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  {producto.categoria?.nombre || 'Producto Digital'}
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Adquirido</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                {producto.nombre}
              </h1>
              {producto.descripcion && (
                <p className="text-gray-400 mt-4 leading-relaxed">{producto.descripcion}</p>
              )}
            </div>
          </div>

          {videos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-blis-red" />
                <h2 className="text-lg font-black text-white uppercase tracking-widest">
                  Videos Tutoriales
                </h2>
              </div>

              <div className="bg-zinc-900/50 rounded-[2rem] overflow-hidden border border-white/5">
                <div className="aspect-video bg-black w-full">
                  {videos[activeVideoIndex]?.video_url.includes('<iframe') ||
                  videos[activeVideoIndex]?.video_url.includes('<script') ? (
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{
                        __html: videos[activeVideoIndex].video_url
                          .replace(/width=".*?"/g, 'width="100%"')
                          .replace(/height=".*?"/g, 'height="100%"')
                      }}
                    />
                  ) : (
                    <iframe
                      src={videos[activeVideoIndex]?.video_url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-white font-black text-lg">{videos[activeVideoIndex]?.titulo}</h3>
                  {videos[activeVideoIndex]?.descripcion && (
                    <p className="text-gray-400 text-sm mt-2">{videos[activeVideoIndex].descripcion}</p>
                  )}
                </div>

                {videos.length > 1 && (
                  <div className="px-6 pb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {videos.map((video, idx) => (
                        <button
                          key={video.id}
                          onClick={() => setActiveVideoIndex(idx)}
                          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            idx === activeVideoIndex
                              ? 'bg-blis-red text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {idx + 1}. {video.titulo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {producto.descripcion_entrega && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blis-red" />
                <h2 className="text-lg font-black text-white uppercase tracking-widest">
                  Instrucciones de Entrega
                </h2>
              </div>
              <div className="bg-zinc-900/50 rounded-[2rem] overflow-hidden border border-white/5 p-8">
                <div
                  className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-blis-red prose-strong:text-white"
                  dangerouslySetInnerHTML={{ __html: producto.descripcion_entrega }}
                />
              </div>
            </div>
          )}

          {archivos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blis-red" />
                <h2 className="text-lg font-black text-white uppercase tracking-widest">
                  Archivos para Descargar
                </h2>
              </div>

              <div className="bg-zinc-900/50 rounded-[2rem] overflow-hidden border border-white/5">
                {archivosParaDescargar.length > 0 && (
                  <div className="p-6 space-y-3">
                    {archivosParaDescargar.map((archivo) => (
                      <div
                        key={archivo.id}
                        className="flex items-center justify-between bg-black/40 rounded-xl p-4 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(archivo.tipo_archivo)}
                          <div>
                            <p className="text-white font-bold text-sm">{archivo.nombre}</p>
                            {archivo.tamano_bytes && (
                              <p className="text-gray-500 text-xs">{formatBytes(archivo.tamano_bytes)}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDescargar(archivo.id, archivo.nombre)}
                          disabled={downloadingId === archivo.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blis-red/20 hover:bg-blis-red/30 text-blis-red font-bold text-xs uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
                        >
                          {downloadingId === archivo.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Descargar
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {enlacesExternos.length > 0 && (
                  <div className={`p-6 space-y-3 ${archivosParaDescargar.length > 0 ? 'border-t border-white/5' : ''}`}>
                    {enlacesExternos.map((enlace) => (
                      <div
                        key={enlace.id}
                        className="flex items-center justify-between bg-black/40 rounded-xl p-4 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(enlace.tipo_archivo)}
                          <div>
                            <p className="text-white font-bold text-sm">{enlace.nombre}</p>
                            <p className="text-gray-500 text-xs">Enlace externo</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAbrirEnlace(enlace.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-bold text-xs uppercase tracking-widest rounded-lg transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {archivosParaDescargar.length > 1 && (
                <button
                  onClick={handleDescargarZip}
                  disabled={preparingZip}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blis-red to-blis-red/80 hover:from-blis-red/90 text-white font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-70"
                >
                  {preparingZip ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Preparando descarga...
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-5 h-5" />
                      Descargar Todo en ZIP
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {archivos.length === 0 && videos.length === 0 && !producto.descripcion_entrega && (
            <div className="bg-zinc-900/50 rounded-[2rem] overflow-hidden border border-white/5 p-12 text-center">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Este producto aún no tiene contenido</h2>
              <p className="text-gray-500">Pronto agregaremos videos, archivos y más.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
