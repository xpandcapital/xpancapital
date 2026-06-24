"use client"

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react'

interface AudioRecorderProps {
  onRecorded: (file: File) => void
  onCancel: () => void
}

export function AudioRecorder({ onRecorded, onCancel }: AudioRecorderProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'preview'>('idle')
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setState('preview')
        stream.getTracks().forEach(t => t.stop())
      }

      recorder.start()
      setState('recording')
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch {
      alert('No se pudo acceder al micrófono. Verifica los permisos.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }, [playing])

  const handleSubmit = () => {
    if (!chunksRef.current.length) return
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
    onRecorded(file)
  }

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  if (state === 'idle') {
    return (
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] space-y-3">
        <p className="text-xs text-gray-400 text-center">Presiona el micrófono para comenzar a grabar</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={startRecording}
            className="w-14 h-14 rounded-full bg-blis-red/10 border-2 border-blis-red/30 flex items-center justify-center hover:bg-blis-red/20 transition-colors group"
          >
            <Mic className="w-6 h-6 text-blis-red group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={onCancel} className="p-2 text-gray-500 hover:text-white transition-colors text-xs">
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  if (state === 'recording') {
    return (
      <div className="bg-red-500/[0.03] rounded-xl p-4 border border-red-500/10 space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-mono text-lg tabular-nums">{formatTime(duration)}</span>
        </div>
        <p className="text-[10px] text-gray-500 text-center">Grabando audio...</p>
        <div className="flex justify-center">
          <button
            onClick={stopRecording}
            className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-colors"
          >
            <Square className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    )
  }

  // Preview
  return (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] space-y-3">
      <p className="text-[10px] text-gray-500 text-center">Vista previa — {formatTime(duration)}</p>
      <audio ref={audioRef} src={audioUrl!} onEnded={() => setPlaying(false)} className="hidden" />
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
        </button>
        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
          <div className="h-full bg-blis-red/30 rounded-full" style={{ width: playing ? '100%' : '0%' }} />
        </div>
        <span className="text-[10px] text-gray-600 tabular-nums">{formatTime(duration)}</span>
      </div>
      <div className="flex justify-center gap-2">
        <button onClick={handleSubmit} className="px-3 py-1.5 rounded-lg bg-blis-red/10 text-blis-red text-[11px] font-medium hover:bg-blis-red/20 transition-colors">
          Usar audio
        </button>
        <button
          onClick={() => {
            setState('idle')
            setAudioUrl(null)
            chunksRef.current = []
          }}
          className="px-3 py-1.5 rounded-lg text-gray-500 text-[11px] hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Regrabar
        </button>
      </div>
    </div>
  )
}
