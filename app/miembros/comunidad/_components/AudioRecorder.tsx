"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react'

interface AudioRecorderProps {
  onRecorded: (file: File) => void
  onCancel: () => void
}

export function AudioRecorder({ onRecorded, onCancel }: AudioRecorderProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'paused' | 'preview'>('idle')
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0)
  const [playDuration, setPlayDuration] = useState(0)
  const [waveform, setWaveform] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.3
      source.connect(analyser)
      analyserRef.current = analyser

      // Animar ondas en tiempo real
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const animate = () => {
        analyser.getByteFrequencyData(dataArray)
        setWaveform(Array.from(dataArray.slice(0, 16)).map(v => v / 255))
        animFrameRef.current = requestAnimationFrame(animate)
      }
      animate()

      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm' })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      recorder.onstop = () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setState('preview')
        stream.getTracks().forEach(t => t.stop())
        audioCtx.close()
      }

      recorder.start()
      setState('recording')
      setDuration(0)
      clearTimer()
      timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000)
    } catch {
      alert('No se pudo acceder al micrófono. Verifica los permisos del navegador.')
    }
  }, [])

  const pauseRecording = useCallback(() => {
    const rec = mediaRecorderRef.current
    if (rec?.state === 'recording') {
      rec.pause()
      setState('paused')
      clearTimer()
    }
  }, [])

  const resumeRecording = useCallback(() => {
    const rec = mediaRecorderRef.current
    if (rec?.state === 'paused') {
      rec.resume()
      setState('recording')
      timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000)
    }
  }, [])

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current
    if (rec && rec.state !== 'inactive') {
      rec.stop()
      clearTimer()
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const handleSubmit = () => {
    if (!chunksRef.current.length) return
    const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' })
    const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })
    onRecorded(file)
  }

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  // Efecto para el audio preview
  useEffect(() => {
    if (!audioRef.current) return
    const audio = audioRef.current
    const onTime = () => {
      setPlayProgress(audio.currentTime)
      setPlayDuration(audio.duration || 0)
    }
    const onEnd = () => setPlaying(false)
    const onMeta = () => setPlayDuration(audio.duration || 0)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('loadedmetadata', onMeta)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('loadedmetadata', onMeta)
    }
  }, [audioUrl])

  // Cleanup
  useEffect(() => () => clearTimer(), [])

  const maxWave = Math.max(...waveform, 0.05)
  const waveBars = waveform.map((v, i) => ({
    height: Math.max(4, (v / maxWave) * 48),
    delay: i * 0.015
  }))

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.04] overflow-hidden">
      {state === 'idle' && (
        <div className="p-5 space-y-4 text-center">
          <p className="text-xs text-gray-400">Presiona el micrófono para comenzar a grabar</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-blis-red/10 border-2 border-blis-red/30 flex items-center justify-center hover:bg-blis-red/20 hover:border-blis-red/50 transition-all group shadow-lg shadow-blis-red/5"
            >
              <Mic className="w-7 h-7 text-blis-red group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={onCancel} className="self-center px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {(state === 'recording' || state === 'paused') && (
        <div className="p-5 space-y-4">
          {/* Timer + status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {state === 'recording' && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
              <span className={`font-mono text-lg tabular-nums ${state === 'recording' ? 'text-red-400' : 'text-amber-400'}`}>
                {formatTime(duration)}
              </span>
            </div>
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">
              {state === 'recording' ? 'Grabando' : 'Pausado'}
            </span>
          </div>

          {/* Waveform bars */}
          <div className="flex items-end justify-center gap-1 h-12">
            {waveBars.map((bar, i) => (
              <motion.div
                key={i}
                animate={{ height: state === 'recording' ? bar.height : 4 }}
                transition={{ duration: 0.1, delay: bar.delay, ease: 'easeOut' }}
                className={`w-1.5 rounded-full ${state === 'recording' ? 'bg-blis-red/60' : 'bg-white/10'}`}
                style={{ minHeight: 4 }}
              />
            ))}
            {waveBars.length === 0 && (
              <div className="flex items-end justify-center gap-1 h-12">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="w-1.5 rounded-full bg-white/5" style={{ height: 4 + Math.random() * 8 }} />
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {state === 'recording' ? (
              <button onClick={pauseRecording} className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 transition-colors">
                <Pause className="w-4 h-4 text-amber-400" />
              </button>
            ) : (
              <button onClick={resumeRecording} className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 transition-colors">
                <Play className="w-4 h-4 text-amber-400 ml-0.5" />
              </button>
            )}
            <button
              onClick={stopRecording}
              disabled={state === 'paused' ? false : duration < 1}
              className="w-12 h-12 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center hover:bg-red-500/20 transition-colors disabled:opacity-30"
            >
              <Square className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      )}

      {state === 'preview' && (
        <div className="p-5 space-y-4">
          <p className="text-[10px] text-gray-600 uppercase tracking-wider text-center">Vista previa</p>

          <audio ref={audioRef} src={audioUrl!} preload="auto" className="hidden" />

          {/* Playback controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
            >
              {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1.5">
              {/* Progress bar */}
              <div
                className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  if (!audioRef.current || !playDuration) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pct = (e.clientX - rect.left) / rect.width
                  audioRef.current.currentTime = pct * playDuration
                }}
              >
                <div
                  className="h-full bg-blis-red/50 rounded-full transition-all duration-100"
                  style={{ width: `${playDuration ? (playProgress / playDuration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-600 tabular-nums">{formatTime(playProgress)}</span>
                <span className="text-[10px] text-gray-500 tabular-nums">{formatTime(playDuration || duration)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-1">
            <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-blis-red text-white text-xs font-bold hover:bg-blis-red/90 transition-colors">
              Usar audio
            </button>
            <button
              onClick={() => { setState('idle'); setAudioUrl(null); chunksRef.current = []; setWaveform([]) }}
              className="px-4 py-2 rounded-lg text-gray-500 text-xs hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" /> Regrabar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
