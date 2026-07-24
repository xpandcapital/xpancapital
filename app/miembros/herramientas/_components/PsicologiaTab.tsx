"use client"

import { useState } from 'react'
import {
  Brain, TrendingUp, BarChart3, Save, Loader2, CheckCircle2, AlertCircle,
  AlertTriangle, ThumbsUp, FileText, Target, ChevronDown, Calendar,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { usePsicologia } from '../_hooks/usePsicologia'

const INPUT_CLASSES = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors placeholder:text-gray-600 resize-none"
const TEXTAREA_CLASSES = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors placeholder:text-gray-600 resize-none min-h-[80px]"

const TIME_PERIODS = [
  { id: '7d', label: '7 Días' },
  { id: '30d', label: '30 Días' },
  { id: '90d', label: '90 Días' },
]

function SaveFeedback({ lastSave, lastError, clearSaveStatus }: {
  lastSave: 'success' | 'error' | null
  lastError: string
  clearSaveStatus: () => void
}) {
  if (!lastSave) return null
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
      lastSave === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
    }`}>
      {lastSave === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
      )}
      <span className={`text-xs font-bold ${lastSave === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
        {lastSave === 'success' ? 'Guardado exitosamente' : lastError || 'Error al guardar'}
      </span>
      <button onClick={clearSaveStatus} className="ml-auto text-gray-500 hover:text-white text-[10px]">✕</button>
    </div>
  )
}

export function PsicologiaTab() {
  const {
    evaluacionHoy, loading, saving, lastSave, lastError, clearSaveStatus,
    guardarPreSesion, guardarPostSesion,
    periodoStats, fetchPeriodo,
  } = usePsicologia()

  const [subTab, setSubTab] = useState<'pre' | 'post' | 'stats'>('pre')
  const [periodo, setPeriodo] = useState('30d')

  // Pre-sesión form
  const [estadoEmocional, setEstadoEmocional] = useState(evaluacionHoy?.estado_emocional || '')
  const [presionesExternas, setPresionesExternas] = useState(evaluacionHoy?.presiones_externas || '')
  const [eventosManana, setEventosManana] = useState(evaluacionHoy?.eventos_manana || '')
  const [puntajeFlujo, setPuntajeFlujo] = useState(evaluacionHoy?.puntaje_flujo || 5)

  // Post-sesión form
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

  // Sync form with loaded data
  useState(() => {
    if (evaluacionHoy) {
      setEstadoEmocional(evaluacionHoy.estado_emocional || '')
      setPresionesExternas(evaluacionHoy.presiones_externas || '')
      setEventosManana(evaluacionHoy.eventos_manana || '')
      setPuntajeFlujo(evaluacionHoy.puntaje_flujo || 5)
      setPerspDiario(evaluacionHoy.perspectiva_diario || '')
      setPersp4h(evaluacionHoy.perspectiva_4h || '')
      setPersp15m(evaluacionHoy.perspectiva_15m || '')
      setResultDiario(evaluacionHoy.resultado_diario || '')
      setResult4h(evaluacionHoy.resultado_4h || '')
      setResult15m(evaluacionHoy.resultado_15m || '')
      setPerspCorrecta(evaluacionHoy.perspectiva_correcta || '')
      setOpsRegistradas(evaluacionHoy.operaciones_registradas || '')
      setErroresCometidos(evaluacionHoy.errores_cometidos || '')
      setRendimiento(evaluacionHoy.rendimiento_general || '')
    }
  })

  const handleGuardarPre = async () => {
    await guardarPreSesion({
      estado_emocional: estadoEmocional,
      presiones_externas: presionesExternas,
      eventos_manana: eventosManana,
      puntaje_flujo: puntajeFlujo,
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

  // Preparar datos para la gráfica
  const chartData = periodoStats.map((e: any) => ({
    fecha: new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    puntaje: e.puntaje_flujo || 0,
    falencias: e.es_falencia ? 1 : 0,
  }))

  // Top 3 falencias
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
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              subTab === t.id
                ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Save Feedback */}
      <SaveFeedback lastSave={lastSave} lastError={lastError} clearSaveStatus={clearSaveStatus} />

      {/* ===== MÓDULO A: REGISTRO MENTAL (Pre-sesión) ===== */}
      {subTab === 'pre' && (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-wider text-sm">Registro Mental</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Evaluación psicológica pre-sesión — {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Puntaje de flujo - Selector visual */}
            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                ¿Cuál es mi puntaje de zona de flujo actual? (1-10)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range" min="1" max="10" value={puntajeFlujo}
                  onChange={e => setPuntajeFlujo(Number(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blis-red"
                />
                <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${
                  puntajeFlujo <= 3 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  puntajeFlujo <= 6 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {puntajeFlujo}
                </span>
              </div>
              {puntajeFlujo <= 3 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-xs text-red-400 font-bold">No recomendado operar hoy — considera hacer paper trading o estudiar</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">¿Cómo me siento hoy?</label>
              <textarea value={estadoEmocional} onChange={e => setEstadoEmocional(e.target.value)} placeholder="Describe tu estado emocional actual..." className={TEXTAREA_CLASSES} rows={3} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">¿Existen presiones externas potenciales de las que deba ser consciente en mi vida?</label>
              <textarea value={presionesExternas} onChange={e => setPresionesExternas(e.target.value)} placeholder="Problemas personales, estrés financiero, conflictos..." className={TEXTAREA_CLASSES} rows={3} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">¿Pasó algo esta mañana que pudiera afectar mi rendimiento comercial?</label>
              <textarea value={eventosManana} onChange={e => setEventosManana(e.target.value)} placeholder="Eventos inesperados, malas noticias, distracciones..." className={TEXTAREA_CLASSES} rows={3} />
            </div>

            <button
              onClick={handleGuardarPre}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blis-red/10 border border-blis-red/20 text-blis-red rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blis-red/20 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Estado Mental
            </button>
          </div>
        </div>
      )}

      {/* ===== MÓDULO B: ANÁLISIS TÉCNICO Y REDONDEO (Post-sesión) ===== */}
      {subTab === 'post' && (
        <div className="space-y-6">
          {/* Perspectiva de la mañana */}
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-black uppercase tracking-wider text-sm">Perspectiva de la Mañana Temprano</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Análisis técnico antes de operar</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Diario', value: perspDiario, setter: setPerspDiario, ph: 'Tendencia general del día, niveles clave...' },
                { label: '4 Horas', value: persp4h, setter: setPersp4h, ph: 'Estructura en timeframe de 4 horas...' },
                { label: '15 Minutos', value: persp15m, setter: setPersp15m, ph: 'Entradas precisas, patrones de vela...' },
              ].map(f => (
                <div key={f.label} className="space-y-1.5">
                  <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{f.label}:</label>
                  <textarea value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.ph} className={TEXTAREA_CLASSES} rows={3} />
                </div>
              ))}
            </div>
          </div>

          {/* Resultado del día */}
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-black uppercase tracking-wider text-sm">Resultado del Día</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Qué ocurrió realmente en cada timeframe</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Diario', value: resultDiario, setter: setResultDiario, ph: '¿Se cumplió la tendencia esperada?' },
                { label: '4 Horas', value: result4h, setter: setResult4h, ph: '¿La estructura se mantuvo?' },
                { label: '15 Minutos', value: result15m, setter: setResult15m, ph: '¿Las entradas fueron precisas?' },
              ].map(f => (
                <div key={f.label} className="space-y-1.5">
                  <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{f.label}:</label>
                  <textarea value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.ph} className={TEXTAREA_CLASSES} rows={3} />
                </div>
              ))}
            </div>
          </div>

          {/* Redondeo fin del día */}
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-black uppercase tracking-wider text-sm">Redondeo al Final del Día</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Reflexión y cierre de jornada</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">¿Era correcta mi perspectiva de la mañana?</label>
                <textarea value={perspCorrecta} onChange={e => setPerspCorrecta(e.target.value)} placeholder="Compara lo que esperabas con lo que pasó..." className={TEXTAREA_CLASSES} rows={3} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">¿He registrado alguna operación realizada independientemente del resultado?</label>
                <textarea value={opsRegistradas} onChange={e => setOpsRegistradas(e.target.value)} placeholder="Lista las operaciones del día..." className={TEXTAREA_CLASSES} rows={3} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  ¿He realizado operaciones fuera de mi plan o he cometido algún error? ¿Por qué lo hice?
                </label>
                <textarea value={erroresCometidos} onChange={e => setErroresCometidos(e.target.value)} placeholder="Sé honesto: ¿rompiste tus reglas? ¿Por qué? Esto ayuda a identificar patrones de falencias..." className={`${TEXTAREA_CLASSES} border-red-500/20 focus:border-red-500/50`} rows={3} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Valore el rendimiento general de hoy. ¿Algo que pueda hacer para mejorar o enfocarme?
                </label>
                <textarea value={rendimiento} onChange={e => setRendimiento(e.target.value)} placeholder="Autocrítica constructiva y plan de mejora..." className={TEXTAREA_CLASSES} rows={3} />
              </div>

              <button
                onClick={handleGuardarPost}
                disabled={saving || !evaluacionHoy}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blis-red/10 border border-blis-red/20 text-blis-red rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blis-red/20 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {evaluacionHoy ? 'Guardar Análisis del Día' : 'Primero guarda el Registro Mental'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MÓDULO C: GRÁFICA DE PROGRESO Y FALENCIAS ===== */}
      {subTab === 'stats' && (
        <div className="space-y-6">
          {/* Filtros de tiempo */}
          <div className="flex items-center gap-2">
            {TIME_PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => handlePeriodoChange(p.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
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
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-black uppercase tracking-wider text-sm">Estado Mental vs Errores Operativos</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {periodoStats.length} registros en el período
                </p>
              </div>
            </div>
            <div className="p-4">
              {chartData.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Sin datos en este período</p>
                  <p className="text-gray-600 text-xs mt-1">Completa tu Registro Mental diario para ver tu progreso</p>
                </div>
              ) : (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                      <XAxis dataKey="fecha" stroke="#52525b" tick={{ fontSize: 11, fontWeight: 700 }} />
                      <YAxis yAxisId="left" stroke="#06b6d4" tick={{ fontSize: 11 }} domain={[0, 10]} />
                      <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 11 }} domain={[0, 1]} tickFormatter={(v) => v === 1 ? 'Sí' : 'No'} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '1rem' }}
                        labelStyle={{ color: '#a1a1aa', fontWeight: 700, fontSize: 12 }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="puntaje"
                        name="Puntaje de Flujo"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#06b6d4' }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="falencias"
                        name="Falencias Detectadas"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#ef4444' }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Tabla Top 3 Falencias */}
          {topFalencias.length > 0 && (
            <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <h2 className="text-white font-black uppercase tracking-wider text-sm">Top Falencias del Período</h2>
              </div>
              <div className="divide-y divide-white/5">
                {topFalencias.map((f, i) => (
                  <div key={i} className="px-6 py-4 flex items-start gap-4">
                    <span className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{f.fecha}</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{f.texto}</p>
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
