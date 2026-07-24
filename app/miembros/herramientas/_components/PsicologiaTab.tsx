"use client"

import { useState, useMemo, useEffect } from 'react'
import {
  Brain, TrendingUp, BarChart3, Save, Loader2, CheckCircle2, AlertCircle,
  AlertTriangle, FileText, Target, Calendar,
} from 'lucide-react'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { usePsicologia, calcularPuntaje } from '../_hooks/usePsicologia'

// ============ CONFIGURACIÓN DE PILLS ============
const EMOCIONES = [
  { id: 'ansioso', label: 'Ansioso', icon: '😰' },
  { id: 'confiado', label: 'Confiado', icon: '💪' },
  { id: 'cansado', label: 'Cansado', icon: '😫' },
  { id: 'motivado', label: 'Motivado', icon: '🔥' },
  { id: 'estresado', label: 'Estresado', icon: '😤' },
  { id: 'tranquilo', label: 'Tranquilo', icon: '😌' },
  { id: 'frustrado', label: 'Frustrado', icon: '😞' },
  { id: 'enfocado', label: 'Enfocado', icon: '🎯' },
  { id: 'neutral', label: 'Neutral', icon: '😐' },
]

const PRESIONES = [
  { id: 'familia', label: 'Familia', icon: '👨‍👩‍👧‍👦' },
  { id: 'financiero', label: 'Financiero', icon: '💰' },
  { id: 'salud', label: 'Salud', icon: '🏥' },
  { id: 'sueno', label: 'Sueño', icon: '😴' },
  { id: 'trabajo', label: 'Trabajo', icon: '💼' },
  { id: 'distracciones', label: 'Distracciones', icon: '📱' },
  { id: 'ninguna', label: 'Ninguna', icon: '✅' },
]

const EVENTOS = [
  { id: 'mala_noticia', label: 'Mala noticia', icon: '📰' },
  { id: 'discusion', label: 'Discusión', icon: '💢' },
  { id: 'emergencia', label: 'Emergencia', icon: '🚨' },
  { id: 'interrupcion', label: 'Interrupción', icon: '🛑' },
  { id: 'imprevisto', label: 'Imprevisto', icon: '⚡' },
  { id: 'ninguno', label: 'Ninguno', icon: '✅' },
]

const TIME_PERIODS = [
  { id: '7d', label: '7 Días' },
  { id: '30d', label: '30 Días' },
  { id: '90d', label: '90 Días' },
]

// ============ COMPONENTES REUTILIZABLES ============
function TextareaLabel({ label, value, onChange, placeholder, accent }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; accent?: boolean;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={`w-full bg-black/40 border rounded-xl px-3 pt-6 pb-2 text-sm text-white focus:outline-none transition-colors placeholder:text-gray-600 resize-none min-h-[60px] ${
          accent ? 'border-red-500/20 focus:border-red-500/50' : 'border-white/10 focus:border-blis-red/50'
        }`}
      />
      <span className="absolute top-2 left-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider pointer-events-none">
        {label}
      </span>
    </div>
  )
}

function PillGroup({ options, selected, onToggle }: {
  options: { id: string; label: string; icon: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const isActive = selected.includes(opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
              isActive
                ? 'bg-blis-red/15 border-blis-red/50 text-blis-red shadow-[0_0_10px_rgba(232,198,0,0.15)]'
                : 'bg-zinc-800/60 border-white/5 text-gray-400 hover:border-white/15 hover:text-gray-300 hover:bg-zinc-700/60'
            }`}
          >
            <span className="text-sm leading-none">{opt.icon}</span>
            <span className="font-medium">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function PuntajeSlider({ value, onChange, modoAuto, onManualOverride }: {
  value: number; onChange: (v: number) => void;
  modoAuto: boolean; onManualOverride: () => void;
}) {
  const colorClass = value <= 3 ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : value <= 6 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'

  return (
    <div className="flex items-center gap-2">
      <input
        type="range" min="1" max="10" value={value}
        onChange={e => {
          onChange(Number(e.target.value))
          if (modoAuto) onManualOverride()
        }}
        className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blis-red"
      />
      <div className="flex flex-col items-center gap-0.5">
        <span className={`min-w-[36px] h-9 rounded-lg flex items-center justify-center text-sm font-black border ${colorClass}`}>
          {value}
        </span>
        <span className={`text-[8px] font-black uppercase tracking-wider ${
          modoAuto ? 'text-cyan-400' : 'text-amber-400'
        }`}>
          {modoAuto ? 'AUTO' : 'MANUAL'}
        </span>
      </div>
    </div>
  )
}

function SaveFeedback({ lastSave, lastError, clearSaveStatus }: {
  lastSave: 'success' | 'error' | null
  lastError: string
  clearSaveStatus: () => void
}) {
  if (!lastSave) return null
  const isSuccess = lastSave === 'success'
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
      isSuccess ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
    }`}>
      {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
      <span className="font-bold">{isSuccess ? 'Guardado' : lastError || 'Error'}</span>
      <button onClick={clearSaveStatus} className="ml-auto text-gray-500 hover:text-white text-[10px]">✕</button>
    </div>
  )
}

// ============ COMPONENTE PRINCIPAL ============
export function PsicologiaTab() {
  const {
    evaluacionHoy, loading, saving, lastSave, lastError, clearSaveStatus,
    guardarPreSesion, guardarPostSesion,
    periodoStats, fetchPeriodo,
  } = usePsicologia()

  const [subTab, setSubTab] = useState<'pre' | 'post' | 'stats'>('pre')
  const [periodo, setPeriodo] = useState('30d')

  // Pre-sesión
  const [estadoTags, setEstadoTags] = useState<string[]>(evaluacionHoy?.estado_emocional_tags || [])
  const [presionesTags, setPresionesTags] = useState<string[]>(evaluacionHoy?.presiones_externas_tags || [])
  const [eventosTags, setEventosTags] = useState<string[]>(evaluacionHoy?.eventos_manana_tags || [])
  const [estadoNota, setEstadoNota] = useState(evaluacionHoy?.estado_emocional || '')
  const [presionesNota, setPresionesNota] = useState(evaluacionHoy?.presiones_externas || '')
  const [eventosNota, setEventosNota] = useState(evaluacionHoy?.eventos_manana || '')
  const [puntajeFlujo, setPuntajeFlujo] = useState(evaluacionHoy?.puntaje_flujo || 5)
  const [modoAuto, setModoAuto] = useState(true)

  // Cálculo automático del puntaje según tags seleccionados
  const puntajeCalculado = useMemo(() =>
    calcularPuntaje(estadoTags, presionesTags, eventosTags),
    [estadoTags, presionesTags, eventosTags]
  )

  // Auto-ajustar slider cuando está en modo AUTO
  useEffect(() => {
    if (modoAuto) setPuntajeFlujo(puntajeCalculado)
  }, [puntajeCalculado, modoAuto])

  // Reactivar AUTO al togglear cualquier píldora
  const toggleTagConAuto = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) => {
    setter(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
    setModoAuto(true)
  }

  // Post-sesión
  const [perspDiario, setPerspDiario] = useState(evaluacionHoy?.perspectiva_diario || '')
  const [persp4h, setPersp4h] = useState(evaluacionHoy?.perspectiva_4h || '')
  const [persp15m, setPersp15m] = useState(evaluacionHoy?.perspectiva_15m || '')
  const [resultDiario, setResultDiario] = useState(evaluacionHoy?.resultado_diario || '')
  const [result4h, setResult4h] = useState(evaluacionHoy?.resultado_4h || '')
  const [result15m, setResult15m] = useState(evaluacionHoy?.resultado_15m || '')
  const [perspCorrecta, setPerspCorrecta] = useState(evaluacionHoy?.perspectiva_correcta || '')
  const [opsRegistradas, setOpsRegistradas] = useState(evaluacionHoy?.operaciones_registradas || '')
  const [erroresCometidos, setErroresCometidos] = useState(evaluacionHoy?.errores_cometidos || '')
  const [rendimiento, setRendimiento] = useState(evaluacionHoy?.rendimiento_general || '')

  const handleGuardarPre = async () => {
    await guardarPreSesion({
      estado_emocional: estadoNota,
      presiones_externas: presionesNota,
      eventos_manana: eventosNota,
      puntaje_flujo: puntajeFlujo,
      estado_emocional_tags: estadoTags,
      presiones_externas_tags: presionesTags,
      eventos_manana_tags: eventosTags,
    })
  }

  const handleGuardarPost = async () => {
    await guardarPostSesion({
      perspectiva_diario: perspDiario,
      perspectiva_4h: persp4h,
      perspectiva_15m: persp15m,
      resultado_diario: resultDiario,
      resultado_4h: result4h,
      resultado_15m: result15m,
      perspectiva_correcta: perspCorrecta,
      operaciones_registradas: opsRegistradas,
      errores_cometidos: erroresCometidos,
      rendimiento_general: rendimiento,
    })
  }

  const handlePeriodoChange = (p: string) => {
    setPeriodo(p)
    fetchPeriodo(p)
  }

  const chartData = periodoStats.map((e: any) => ({
    fecha: new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    puntaje: e.puntaje_flujo || 0,
    falencias: e.es_falencia ? 1 : 0,
  }))

  const topFalencias = periodoStats
    .filter((e: any) => e.es_falencia && e.errores_cometidos)
    .slice(0, 3)
    .map((e: any) => ({
      fecha: new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      texto: e.errores_cometidos.substring(0, 120) + (e.errores_cometidos.length > 120 ? '...' : ''),
    }))

  const subTabs = [
    { id: 'pre' as const, label: 'Registro Mental', icon: Brain },
    { id: 'post' as const, label: 'Análisis y Redondeo', icon: FileText },
    { id: 'stats' as const, label: 'Progreso y Falencias', icon: BarChart3 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all whitespace-nowrap ${
              subTab === t.id
                ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <SaveFeedback lastSave={lastSave} lastError={lastError} clearSaveStatus={clearSaveStatus} />

      {/* ===== MÓDULO A: REGISTRO MENTAL ===== */}
      {subTab === 'pre' && (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-4 md:px-5 py-3.5 border-b border-white/5 bg-white/[0.02] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-black uppercase tracking-wider text-xs">Registro Mental</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-5 space-y-4">
            {/* Puntaje de flujo */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Zona de flujo (1-10)
              </label>
              <PuntajeSlider value={puntajeFlujo} onChange={setPuntajeFlujo} modoAuto={modoAuto} onManualOverride={() => setModoAuto(false)} />
              {puntajeFlujo <= 3 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="text-[11px] text-red-400 font-bold">No recomendado operar — considera paper trading</span>
                </div>
              )}
            </div>

            {/* Emociones pills */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">¿Cómo me siento hoy?</label>
              <PillGroup options={EMOCIONES} selected={estadoTags} onToggle={toggleTagConAuto(setEstadoTags)} />
              <TextareaLabel label="Nota adicional" value={estadoNota} onChange={setEstadoNota} placeholder="Describe tu estado..." />
            </div>

            {/* Presiones pills */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">¿Presiones externas?</label>
              <PillGroup options={PRESIONES} selected={presionesTags} onToggle={toggleTagConAuto(setPresionesTags)} />
              <TextareaLabel label="Nota adicional" value={presionesNota} onChange={setPresionesNota} placeholder="Detalles..." />
            </div>

            {/* Eventos pills */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">¿Algo esta mañana que afecte?</label>
              <PillGroup options={EVENTOS} selected={eventosTags} onToggle={toggleTagConAuto(setEventosTags)} />
              <TextareaLabel label="Nota adicional" value={eventosNota} onChange={setEventosNota} placeholder="Describe lo sucedido..." />
            </div>

            <button
              onClick={handleGuardarPre}
              disabled={saving}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blis-red/10 border border-blis-red/20 text-blis-red rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blis-red/20 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Guardar Estado Mental
            </button>
          </div>
        </div>
      )}

      {/* ===== MÓDULO B: ANÁLISIS Y REDONDEO ===== */}
      {subTab === 'post' && (
        <div className="space-y-4">
          {/* Grid 2 columnas: Perspectiva + Resultado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Perspectiva Mañana */}
            <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
                <h2 className="text-white font-black uppercase tracking-wider text-[11px]">Perspectiva Mañana</h2>
              </div>
              <div className="p-3 space-y-2.5">
                <TextareaLabel label="Diario" value={perspDiario} onChange={setPerspDiario} placeholder="Tendencia general..." />
                <TextareaLabel label="4 Horas" value={persp4h} onChange={setPersp4h} placeholder="Estructura 4H..." />
                <TextareaLabel label="15 Minutos" value={persp15m} onChange={setPersp15m} placeholder="Entradas precisas..." />
              </div>
            </div>

            {/* Resultado Día */}
            <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-white font-black uppercase tracking-wider text-[11px]">Resultado del Día</h2>
              </div>
              <div className="p-3 space-y-2.5">
                <TextareaLabel label="Diario" value={resultDiario} onChange={setResultDiario} placeholder="¿Se cumplió?" />
                <TextareaLabel label="4 Horas" value={result4h} onChange={setResult4h} placeholder="¿Estructura válida?" />
                <TextareaLabel label="15 Minutos" value={result15m} onChange={setResult15m} placeholder="¿Entradas correctas?" />
              </div>
            </div>
          </div>

          {/* Redondeo fin del día (full width) */}
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <h2 className="text-white font-black uppercase tracking-wider text-[11px]">Redondeo Fin del Día</h2>
            </div>
            <div className="p-3 space-y-2.5">
              <TextareaLabel label="¿Era correcta mi perspectiva?" value={perspCorrecta} onChange={setPerspCorrecta} placeholder="Compara expectativa vs realidad..." />
              <TextareaLabel label="¿Registré todas mis operaciones?" value={opsRegistradas} onChange={setOpsRegistradas} placeholder="Lista las operaciones..." />
              <TextareaLabel
                label="¿Errores fuera del plan? ¿Por qué?"
                value={erroresCometidos}
                onChange={setErroresCometidos}
                placeholder="Sé honesto... esto alimenta tus estadísticas"
                accent
              />
              <TextareaLabel label="Rendimiento general y mejora" value={rendimiento} onChange={setRendimiento} placeholder="Autocrítica constructiva..." />
            </div>
          </div>

          <button
            onClick={handleGuardarPost}
            disabled={saving || !evaluacionHoy}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blis-red/10 border border-blis-red/20 text-blis-red rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blis-red/20 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {evaluacionHoy ? 'Guardar Análisis del Día' : 'Primero guarda el Registro Mental'}
          </button>
        </div>
      )}

      {/* ===== MÓDULO C: PROGRESO Y FALENCIAS ===== */}
      {subTab === 'stats' && (
        <div className="space-y-4">
          {/* Filtros de tiempo */}
          <div className="flex items-center gap-1.5">
            {TIME_PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => handlePeriodoChange(p.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all ${
                  periodo === p.id
                    ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                    : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-white/10 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Gráfica */}
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-white font-black uppercase tracking-wider text-xs">Estado Mental vs Errores</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{periodoStats.length} registros</p>
              </div>
            </div>
            <div className="p-3">
              {chartData.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">Sin datos en este período</p>
                </div>
              ) : (
                <div className="h-[300px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="fecha" stroke="#52525b" tick={{ fontSize: 10, fontWeight: 700 }} />
                      <YAxis yAxisId="left" stroke="#06b6d4" tick={{ fontSize: 10 }} domain={[0, 10]} label={{ value: 'Flujo', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#06b6d4' } }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 10 }} domain={[0, 'auto']} tickFormatter={(v) => v === 1 ? 'Sí' : ''} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', fontSize: '12px' }}
                        labelStyle={{ color: '#a1a1aa', fontWeight: 700, fontSize: 11 }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar yAxisId="right" dataKey="falencias" name="Error Operativo" fill="#ef4444" fillOpacity={0.35} radius={[4, 4, 0, 0]} barSize={20} />
                      <Line yAxisId="left" type="monotone" dataKey="puntaje" name="Zona de Flujo" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Tabla Top 3 Falencias */}
          {topFalencias.length > 0 && (
            <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-white font-black uppercase tracking-wider text-xs">Top Falencias</h2>
              </div>
              <div className="divide-y divide-white/5">
                {topFalencias.map((f, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-black shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">{f.fecha}</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{f.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
