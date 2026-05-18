"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { EmbroideryUpload } from './embroidery/EmbroideryUpload'
import { EmbroideryProgress } from './embroidery/EmbroideryProgress'
import { EmbroideryResult } from './embroidery/EmbroideryResult'
import { EmbroideryActions } from './embroidery/EmbroideryActions'

type Status = 'idle' | 'processing' | 'done' | 'error'

interface LayerInfo {
  id: string
  name: string
  color: string
  stitches: number
  svgPath?: string
}

async function uploadToStorage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'bordados')

  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Error subiendo imagen')
  const data = await res.json()
  return data.url
}

async function callBordadoAPI(endpoint: string, body: Record<string, any>): Promise<any> {
  const res = await fetch(`/api/bordado/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Error en ${endpoint}`)
  return data
}

async function getDiagnostics(): Promise<any> {
  const res = await fetch('/api/bordado/debug', { credentials: 'include' })
  return res.json()
}

export function AutoEmbroideryTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [currentStep, setCurrentStep] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [layers, setLayers] = useState<LayerInfo[]>([])
  const [fileName, setFileName] = useState('diseno')
  const [svgContent, setSvgContent] = useState('')
  const [apiDiag, setApiDiag] = useState<Record<string, any> | null>(null)
  const [apiErrors, setApiErrors] = useState<string[]>([])

  useEffect(() => { getDiagnostics().then(setApiDiag).catch(() => {}) }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setCurrentStep(0)
    setErrorMessage('')
    setOriginalImage(null)
    setPreviewImage(null)
    setLayers([])
    setSvgContent('')
  }, [])

  const handleFileSelect = useCallback(async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setOriginalImage(dataUrl)
      setFileName(file.name.split('.')[0] || 'diseno')
      setStatus('processing')
      setCurrentStep(0)
      setErrorMessage('')

      let cleanImageUrl = ''
      let maskUrls: string[] = []
      let colors: string[] = []
      let posterizedImage = ''
      const errors: string[] = []

      try {
        // Paso 0: Upload a Supabase Storage
        setCurrentStep(0)
        const imageUrl = await uploadToStorage(file)
        cleanImageUrl = imageUrl

        // Paso 1: Remove background (opcional)
        setCurrentStep(1)
        try {
          const bgResult = await callBordadoAPI('remove-bg', { imageUrl })
          cleanImageUrl = bgResult.url
        } catch (e: any) {
          errors.push('Remove BG: ' + (e.message || 'falló'))
        }

        // Paso 2: Quantize — extrae colores dominantes, genera máscaras B/N, posteriza
        setCurrentStep(2)
        try {
          const quantResult = await callBordadoAPI('quantize', {
            imageUrl: cleanImageUrl,
            numColors: 5
          })
          colors = quantResult.colors || []
          posterizedImage = quantResult.posterizedImage || ''
          setPreviewImage(posterizedImage || dataUrl)
          if (quantResult.masks?.length) {
            maskUrls = quantResult.masks.filter(Boolean)
          }
        } catch (e: any) {
          errors.push('Quantize: ' + (e.message || 'falló'))
          colors = ['#1a1a2e', '#e94560', '#0f3460', '#16213e']
          setPreviewImage(dataUrl)
        }

        if (!colors.length) colors = ['#1a1a2e', '#e94560', '#0f3460', '#16213e']
        if (!maskUrls.length) maskUrls = [cleanImageUrl]

        // Paso 3: Vectorize — Potrace sobre cada máscara
        setCurrentStep(3)
        let vectorLayers: LayerInfo[] = []
        try {
          const vecResult = await callBordadoAPI('vectorize', {
            masks: maskUrls,
            colors: colors,
            imageUrl: cleanImageUrl
          })
          vectorLayers = vecResult.layers || []
        } catch (e: any) {
          errors.push('Vectorize: ' + (e.message || 'falló'))
        }

        if (!vectorLayers.length) {
          vectorLayers = colors.map((c, i) => ({
            id: `Capa_${i + 1}`,
            name: ['Fondo', 'Principal', 'Detalles', 'Acentos', 'Textos'][i] || `Capa ${i + 1}`,
            color: c,
            stitches: 1500 + Math.floor(Math.random() * 3000),
            svgPath: ''
          }))
        }

        // Paso 4: Assemble SVG
        setCurrentStep(4)
        try {
          const svgResult = await callBordadoAPI('assemble-svg', { layers: vectorLayers })
          setSvgContent(svgResult.svg)
        } catch (e: any) {
          errors.push('Assemble SVG: ' + (e.message || 'falló'))
        }

        setLayers(vectorLayers)
        setApiErrors(errors)
        setStatus('done')

        // Paso 5: Preview 3D con Gemini (no bloqueante)
        try {
          const renderResult = await callBordadoAPI('preview', {
            imageUrl: posterizedImage || dataUrl,
            mimeType: 'image/png'
          })
          if (renderResult.url) setPreviewImage(renderResult.url)
        } catch (e: any) {
          errors.push('Preview 3D: ' + (e.message || 'falló'))
        }

      } catch (error: any) {
        console.error('[Bordado] Error:', error)
        setErrorMessage(error.message || 'Error desconocido')
        setStatus('error')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDownloadSVG = useCallback(() => {
    const content = svgContent || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"></svg>`
    const blob = new Blob([content], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bordado_${fileName}_wilcom.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [svgContent, fileName])

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {status !== 'idle' && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blis-red/20 rounded-xl flex items-center justify-center">
              <span className="text-blis-red font-black text-sm">E</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">BLIS Bordado</h2>
              <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black">
                {status === 'processing' ? 'Procesando' : status === 'done' ? 'Completado' : 'Error'}
              </p>
            </div>
          </div>
          {status === 'done' && (
            <button
              onClick={reset}
              className="flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-white uppercase tracking-wider transition-colors"
            >
              <RefreshCw size={14} />
              Nuevo Proyecto
            </button>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <EmbroideryUpload onFileSelect={handleFileSelect} />
            {apiDiag && (
              <div className="flex items-center justify-center gap-6 mt-4 pb-6">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                  {apiDiag?.diagnostics?.replicate_key?.found
                    ? <CheckCircle2 size={12} className="text-emerald-400" />
                    : <XCircle size={12} className="text-red-400" />}
                  <span className={apiDiag?.diagnostics?.replicate_key?.found ? 'text-emerald-400' : 'text-red-400'}>
                    Replicate
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                  {apiDiag?.diagnostics?.gemini_key?.found
                    ? <CheckCircle2 size={12} className="text-emerald-400" />
                    : <XCircle size={12} className="text-red-400" />}
                  <span className={apiDiag?.diagnostics?.gemini_key?.found ? 'text-emerald-400' : 'text-red-400'}>
                    Gemini
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {status === 'processing' && (
          <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex">
            <EmbroideryProgress currentStep={currentStep} originalImage={originalImage} error={errorMessage} />
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-red-400 font-black text-2xl">!</span>
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Error de Procesamiento</h3>
            <p className="text-zinc-500 max-w-md mb-8 text-sm">{errorMessage}</p>
            <button onClick={reset} className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-blis-red hover:text-white transition-all">
              Intentar nuevamente
            </button>
          </motion.div>
        )}

        {status === 'done' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
            <div className="flex-[3] flex flex-col">
              <EmbroideryResult previewImage={previewImage} layers={layers} />
            </div>
            <div className="flex-[2] flex flex-col gap-6">
              <EmbroideryActions
                layers={layers}
                fileName={fileName}
                onDownloadSVG={handleDownloadSVG}
                errors={apiErrors}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
