"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Timer, Zap, Target, Grid3X3, Heart, ArrowLeft, Volume2, VolumeX } from 'lucide-react'
import { useGymMental } from '../_hooks/useGymMental'

// ============ JUEGOS DISPONIBLES ============
const GAMES = [
  { id: 'schulte_grid', title: 'Schulte Grid', desc: 'Atención focalizada', icon: '🧠', time: '2 min', color: 'cyan' },
  { id: 'stroop', title: 'Stroop Challenge', desc: 'Flexibilidad cognitiva', icon: '🎨', time: '1 min', color: 'purple' },
  { id: 'speed_math', title: 'Speed Math', desc: 'Agilidad mental', icon: '🔢', time: '1 min', color: 'amber' },
  { id: 'reaction_time', title: 'Reaction Time', desc: 'Velocidad de respuesta', icon: '🎯', time: '1 min', color: 'rose' },
  { id: 'memory_grid', title: 'Memory Grid', desc: 'Memoria de trabajo', icon: '🧩', time: '2 min', color: 'emerald' },
  { id: 'coherencia_cardiaca', title: 'Coherencia Cardíaca', desc: 'Box Breathing', icon: '🫁', time: '2 min', color: 'blue' },
]

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
const COLOR_NAMES = ['ROJO', 'AZUL', 'VERDE', 'AMARILLO', 'PÚRPURA']

// ============ UTILIDADES ============
function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ============ MÓDULO 1: SCHULTE GRID ============
function SchulteGrid({ onDone }: { onDone: (score: Record<string, number>) => void }) {
  const [nums] = useState(() => shuffle(Array.from({ length: 25 }, (_, i) => i + 1)))
  const [next, setNext] = useState(1)
  const [timeLeft, setTimeLeft] = useState(120)
  const [done, setDone] = useState(false)
  const [clicks, setClicks] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (done || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(t)
  }, [done, timeLeft])

  useEffect(() => {
    if (timeLeft <= 0 && !done) {
      setDone(true)
      onDone({ tiempo_segundos: 120, completados: next - 1, clicks })
    }
  }, [timeLeft, done, next, clicks, onDone])

  const handleClick = (n: number) => {
    setClicks(c => c + 1)
    if (n === next) {
      if (next === 25) {
        setDone(true)
        onDone({ tiempo_segundos: Math.round((Date.now() - startRef.current) / 1000), completados: 25, clicks: clicks + 1 })
      }
      setNext(p => p + 1)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs">Siguiente: <span className="text-[#e8c600] font-black text-lg">{next}</span></span>
        <span className={`font-mono text-sm font-black ${timeLeft <= 10 ? 'text-red-400' : 'text-white/60'}`}>{formatTime(timeLeft)}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {nums.map((n, i) => (
          <button
            key={i}
            onClick={() => handleClick(n)}
            disabled={done}
            className={`aspect-square rounded-lg text-sm font-bold transition-all disabled:opacity-60 ${
              n < next ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              n === next ? 'bg-[#e8c600]/15 text-[#e8c600] border border-[#e8c600]/40 shadow-[0_0_10px_rgba(232,198,0,0.2)]' :
              'bg-zinc-800/40 border border-white/5 text-gray-400 hover:border-white/15'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {done && <div className="text-center text-emerald-400 font-black text-sm py-2">🧠 Mente Despierta — {next - 1}/25 completados</div>}
    </div>
  )
}

// ============ MÓDULO 2: STROOP CHALLENGE ============
function StroopChallenge({ onDone }: { onDone: (score: Record<string, number>) => void }) {
  const [wordIdx, setWordIdx] = useState(() => Math.floor(Math.random() * 5))
  const [colorIdx, setColorIdx] = useState(() => { let c; do { c = Math.floor(Math.random() * 5) } while (c === wordIdx); return c })
  const [aciertos, setAciertos] = useState(0)
  const [errores, setErrores] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [done])

  useEffect(() => {
    if (timeLeft <= 0 && !done) { setDone(true); onDone({ aciertos, errores }) }
  }, [timeLeft, done, aciertos, errores, onDone])

  const genNew = () => {
    const w = Math.floor(Math.random() * 5)
    let c; do { c = Math.floor(Math.random() * 5) } while (c === w)
    setWordIdx(w); setColorIdx(c)
  }

  const handleColor = (idx: number) => {
    if (idx === colorIdx) { setAciertos(a => a + 1) } else { setErrores(e => e + 1) }
    genNew()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Click color de la <b>tinta</b>, no la palabra</span>
        <span className={`font-mono text-sm font-black ${timeLeft <= 10 ? 'text-red-400' : 'text-white/60'}`}>{formatTime(timeLeft)}</span>
      </div>
      <div className="text-center py-8">
        <div className="text-5xl font-black mb-6" style={{ color: COLORS[colorIdx] }}>{COLOR_NAMES[wordIdx]}</div>
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((c, i) => (
            <button key={i} onClick={() => handleColor(i)} disabled={done}
              className="h-12 rounded-xl border border-white/10 font-bold text-xs text-white/70 hover:border-white/30 transition-all"
              style={{ backgroundColor: c + '30' }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-4 text-xs font-mono">
        <span className="text-emerald-400">✓ {aciertos}</span>
        <span className="text-red-400">✗ {errores}</span>
      </div>
      {done && <div className="text-center text-emerald-400 font-black text-sm">🎨 Completado — {aciertos} aciertos</div>}
    </div>
  )
}

// ============ MÓDULO 3: SPEED MATH ============
function SpeedMath({ onDone }: { onDone: (score: Record<string, number>) => void }) {
  const [a, setA] = useState(() => Math.floor(Math.random() * 90) + 10)
  const [b, setB] = useState(() => Math.floor(Math.random() * 90) + 10)
  const [op, setOp] = useState<'plus' | 'minus'>(() => Math.random() > 0.5 ? 'plus' : 'minus')
  const [answer, setAnswer] = useState('')
  const [aciertos, setAciertos] = useState(0)
  const [errores, setErrores] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const correct = op === 'plus' ? a + b : a - b

  useEffect(() => { if (done) return; const t = setInterval(() => setTimeLeft(p => p - 1), 1000); return () => clearInterval(t) }, [done])
  useEffect(() => { if (timeLeft <= 0 && !done) { setDone(true); onDone({ aciertos, errores }) } }, [timeLeft, done, aciertos, errores, onDone])
  useEffect(() => { inputRef.current?.focus() }, [a, b, op])

  const handleSubmit = () => {
    const val = parseInt(answer)
    if (isNaN(val)) return
    if (val === correct) setAciertos(a => a + 1)
    else setErrores(e => e + 1)
    setAnswer('')
    setA(Math.floor(Math.random() * 90) + 10)
    setB(Math.floor(Math.random() * 90) + 10)
    setOp(Math.random() > 0.5 ? 'plus' : 'minus')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Resuelve lo más rápido que puedas</span>
        <span className={`font-mono text-sm font-black ${timeLeft <= 10 ? 'text-red-400' : 'text-white/60'}`}>{formatTime(timeLeft)}</span>
      </div>
      <div className="text-center py-6">
        <div className="text-4xl font-black text-white mb-1">{a} {op === 'plus' ? '+' : '−'} {b}</div>
        <div className="text-xs text-gray-500 mb-4">= ?</div>
        <input
          ref={inputRef}
          type="number"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          disabled={done}
          className="w-32 text-center bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-2xl font-black focus:outline-none focus:border-[#e8c600]/50 transition-colors"
        />
      </div>
      <div className="flex justify-center gap-4 text-xs font-mono">
        <span className="text-emerald-400">✓ {aciertos}</span>
        <span className="text-red-400">✗ {errores}</span>
      </div>
    </div>
  )
}

// ============ MÓDULO 4: REACTION TIME ============
function ReactionTime({ onDone }: { onDone: (score: Record<string, number>) => void }) {
  const [phase, setPhase] = useState<'waiting' | 'ready' | 'clicked' | 'done'>('waiting')
  const [timeLeft, setTimeLeft] = useState(60)
  const [reactions, setReactions] = useState<number[]>([])
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const readyRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scheduleReady = () => {
    setPhase('waiting')
    const delay = 800 + Math.random() * 2200
    const t = setTimeout(() => {
      if (phase === 'done') return
      setPhase('ready')
      readyRef.current = Date.now()
      setPos({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 })
    }, delay)
    return () => clearTimeout(t)
  }

  useEffect(() => {
    const cleanup = scheduleReady()
    timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000)
    return () => { cleanup?.(); if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    if (timeLeft <= 0 && phase !== 'done') {
      setPhase('done')
      if (timerRef.current) clearInterval(timerRef.current)
      const avg = reactions.length > 0 ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length) : 0
      onDone({ promedio_ms: avg, intentos: reactions.length })
    }
  }, [timeLeft])

  const handleClick = () => {
    if (phase === 'ready') {
      const rt = Date.now() - readyRef.current
      setReactions(r => [...r, rt])
      setPhase('clicked')
      setTimeout(() => {
        if (timeLeft > 0) scheduleReady()
      }, 600)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Click el círculo apenas aparezca</span>
        <span className={`font-mono text-sm font-black ${timeLeft <= 10 ? 'text-red-400' : 'text-white/60'}`}>{formatTime(timeLeft)}</span>
      </div>
      <div className="relative bg-zinc-900 rounded-2xl h-[250px] overflow-hidden cursor-pointer" onClick={handleClick}>
        {phase === 'waiting' && <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs">Espera...</div>}
        {phase === 'ready' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute w-14 h-14 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
        {phase === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center text-emerald-400 font-black text-sm">
            🎯 {reactions.length > 0 ? `${Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)}ms promedio` : 'Completado'}
          </div>
        )}
      </div>
      {reactions.length > 0 && (
        <div className="text-center text-xs text-gray-500">
          Último: <span className="text-white font-mono">{reactions[reactions.length - 1]}ms</span>
          {reactions.length > 1 && <> · Promedio: <span className="text-white font-mono">{Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)}ms</span></>}
        </div>
      )}
    </div>
  )
}

// ============ MÓDULO 5: MEMORY GRID (SIMON) ============
function MemoryGrid({ onDone }: { onDone: (score: Record<string, number>) => void }) {
  const [sequence, setSequence] = useState<number[]>([Math.floor(Math.random() * 9)])
  const [playerSeq, setPlayerSeq] = useState<number[]>([])
  const [showing, setShowing] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const [level, setLevel] = useState(1)
  const [timeLeft, setTimeLeft] = useState(120)
  const [done, setDone] = useState(false)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => { if (done) return; const t = setInterval(() => setTimeLeft(p => p - 1), 1000); return () => clearInterval(t) }, [done])
  useEffect(() => {
    if (timeLeft <= 0 && !done) { setDone(true); onDone({ nivel_maximo: level, intentos: attempts }) }
  }, [timeLeft])

  useEffect(() => {
    if (done) return
    setShowing(true)
    let i = 0
    const iv = setInterval(() => {
      if (i < sequence.length) { setActive(sequence[i]); setTimeout(() => setActive(null), 350); i++ }
      else { clearInterval(iv); setShowing(false) }
    }, 700)
    return () => clearInterval(iv)
  }, [sequence, done])

  const handleCell = (idx: number) => {
    if (showing || done) return
    const newSeq = [...playerSeq, idx]
    setPlayerSeq(newSeq)
    if (sequence[newSeq.length - 1] !== idx) { setDone(true); onDone({ nivel_maximo: level - 1, intentos: attempts + 1 }); return }
    if (newSeq.length === sequence.length) {
      setAttempts(a => a + 1)
      setTimeout(() => { setPlayerSeq([]); setSequence(s => [...s, Math.floor(Math.random() * 9)]); setLevel(l => l + 1) }, 800)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Nivel: <span className="text-white font-black">{level}</span></span>
        <span className={`font-mono text-sm font-black ${timeLeft <= 10 ? 'text-red-400' : 'text-white/60'}`}>{formatTime(timeLeft)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
        {Array.from({ length: 9 }).map((_, i) => (
          <button key={i} onClick={() => handleCell(i)} disabled={showing || done}
            className={`aspect-square rounded-xl transition-all duration-150 ${
              active === i ? 'bg-[#e8c600] shadow-[0_0_15px_rgba(232,198,0,0.6)] scale-105' :
              'bg-zinc-800/60 border border-white/5 hover:border-white/20'
            }`}
          />
        ))}
      </div>
      {showing && <div className="text-center text-xs text-amber-400 font-bold">Observa la secuencia...</div>}
      {done && <div className="text-center text-emerald-400 font-black text-sm">🧩 Nivel máximo: {level - 1}</div>}
    </div>
  )
}

// ============ MÓDULO 6: COHERENCIA CARDÍACA ============
function CoherenciaCardiaca({ onDone }: { onDone: (score: Record<string, number>) => void }) {
  const [phase, setPhase] = useState<'inhala' | 'sosten1' | 'exhala' | 'sosten2'>('inhala')
  const [timeLeft, setTimeLeft] = useState(120)
  const [done, setDone] = useState(false)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const phaseRef = useRef(phase)
  const cyclesRef = useRef(0)

  const phaseLabels = { inhala: 'Inhala...', sosten1: 'Sostén...', exhala: 'Exhala...', sosten2: 'Sostén...' }

  useEffect(() => { phaseRef.current = phase }, [phase])

  const startBreathing = () => {
    setStarted(true)
    if (!muted) {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const oscL = ctx.createOscillator()
      const oscR = ctx.createOscillator()
      const gain = ctx.createGain()
      const merger = ctx.createChannelMerger(2)
      oscL.type = 'sine'; oscL.frequency.value = 200
      oscR.type = 'sine'; oscR.frequency.value = 208
      gain.gain.value = 0.08
      oscL.connect(merger, 0, 0)
      oscR.connect(merger, 0, 1)
      merger.connect(gain)
      gain.connect(ctx.destination)
      oscL.start(); oscR.start()
    }

    let cycle = 0
    let elapsed = 0
    const phases: ('inhala' | 'sosten1' | 'exhala' | 'sosten2')[] = ['inhala', 'sosten1', 'exhala', 'sosten2']
    let phaseIdx = 0
    let phaseTime = 0

    const iv = setInterval(() => {
      phaseTime++
      if (phaseTime >= 4) { phaseTime = 0; phaseIdx = (phaseIdx + 1) % 4; if (phaseIdx === 0) cyclesRef.current++; cycle++ }
      setPhase(phases[phaseIdx])
      elapsed++
      setTimeLeft(120 - elapsed)
      if (elapsed >= 120) {
        clearInterval(iv)
        setDone(true)
        if (audioCtxRef.current) audioCtxRef.current.close()
        onDone({ ciclos_completados: cyclesRef.current })
      }
    }, 1000)
  }

  const scale = phase === 'inhala' ? 1.4 : phase === 'exhala' ? 0.8 : phase === 'sosten1' ? 1.4 : 0.8
  const bgScale = phase === 'inhala' ? 1.0 : phase === 'exhala' ? 0.6 : phase === 'sosten1' ? 1.0 : 0.6

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Box Breathing 4-4-4-4</span>
        <div className="flex items-center gap-2">
          {started && (
            <button onClick={() => {
              setMuted(!muted)
              if (muted) startBreathing()
              else if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null }
            }} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
          <span className={`font-mono text-sm font-black ${timeLeft <= 10 ? 'text-red-400' : 'text-white/60'}`}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {!started ? (
        <div className="text-center py-12">
          <button onClick={startBreathing} className="px-6 py-3 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl font-bold text-sm hover:bg-blue-500/25 transition-colors">
            Comenzar Respiración
          </button>
        </div>
      ) : (
        <div className="relative flex items-center justify-center h-[250px]">
          <motion.div
            animate={{ scale: bgScale, opacity: bgScale * 0.15 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className="absolute w-40 h-40 rounded-full bg-blue-500"
          />
          <motion.div
            animate={{ scale }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className="relative w-28 h-28 rounded-full bg-blue-500/30 border-2 border-blue-400/50 flex items-center justify-center"
          >
            <div className="text-center">
              <Heart className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-blue-200">{phaseLabels[phase]}</div>
            </div>
          </motion.div>
        </div>
      )}

      {done && <div className="text-center text-emerald-400 font-black text-sm">🧘 Sistema Nervioso Regulado — {cyclesRef.current} ciclos</div>}
    </div>
  )
}

// ============ COMPONENTE PRINCIPAL ============
export function GymMentalTab() {
  const { registrar } = useGymMental()
  const [game, setGame] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const handleDone = async (tipo: string, score: Record<string, number>) => {
    setCompleted(true)
    await registrar(tipo, score)
  }

  const handleBack = () => { setGame(null); setCompleted(false) }

  const gameInfo = GAMES.find(g => g.id === game)

  if (game && gameInfo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">{gameInfo.icon}</span>
            <div>
              <h2 className="text-white font-black uppercase tracking-wider text-xs">{gameInfo.title}</h2>
              <span className="text-[10px] text-gray-500">{gameInfo.desc}</span>
            </div>
          </div>
          <div className="w-16" />
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5">
          {!completed && (
            <>
              {game === 'schulte_grid' && <SchulteGrid onDone={s => handleDone('schulte_grid', s)} />}
              {game === 'stroop' && <StroopChallenge onDone={s => handleDone('stroop', s)} />}
              {game === 'speed_math' && <SpeedMath onDone={s => handleDone('speed_math', s)} />}
              {game === 'reaction_time' && <ReactionTime onDone={s => handleDone('reaction_time', s)} />}
              {game === 'memory_grid' && <MemoryGrid onDone={s => handleDone('memory_grid', s)} />}
              {game === 'coherencia_cardiaca' && <CoherenciaCardiaca onDone={s => handleDone('coherencia_cardiaca', s)} />}
            </>
          )}
          {completed && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">{gameInfo.icon}</div>
              <div className="text-emerald-400 font-black text-lg mb-1">¡Completado!</div>
              <div className="text-gray-500 text-sm mb-6">Tu sesión de {gameInfo.title} ha sido registrada.</div>
              <button onClick={handleBack} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-colors">
                Volver al Lobby
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ===== LOBBY =====
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Brain className="w-4.5 h-4.5" />
        </div>
        <div>
          <h2 className="text-white font-black uppercase tracking-wider text-xs">Gym Mental</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Prepara tu mente antes de operar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {GAMES.map(g => (
          <button
            key={g.id}
            onClick={() => setGame(g.id)}
            className="bg-zinc-950 border border-white/5 rounded-2xl p-5 text-left hover:border-white/10 hover:bg-white/[0.02] transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{g.icon}</span>
              <span className="text-[10px] text-gray-600 font-mono bg-white/5 px-2 py-0.5 rounded-md">⏱ {g.time}</span>
            </div>
            <h3 className="text-white font-bold text-sm mb-1">{g.title}</h3>
            <p className="text-gray-500 text-xs">{g.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
