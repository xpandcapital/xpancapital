"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wrench, Shield, DollarSign, TrendingUp, Activity, Target, Trash2,
  Loader2, Save, History, ChevronDown, Calculator, AlertTriangle, CheckCircle2
} from 'lucide-react'
import { useRiskCalculator } from './_hooks/useRiskCalculator'

const INPUT_CLASSES = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors placeholder:text-gray-600"

const SELECT_CLASSES = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors appearance-none cursor-pointer"

function ResultRow({ label, value, suffix, color = 'text-white', sub }: {
  label: string, value: string, suffix?: string, color?: string, sub?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-4 bg-white/[0.02] rounded-xl">
      <span className="text-[11px] text-gray-400 font-medium">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-black ${color}`}>{value}{suffix}</span>
        {sub && <span className="text-[10px] text-gray-600 block">{sub}</span>}
      </div>
    </div>
  )
}

function RiskBar({ pct }: { pct: number }) {
  const level = pct <= 1 ? 'low' : pct <= 3 ? 'med' : 'high'
  const config = {
    low: { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'Riesgo bajo', icon: CheckCircle2 },
    med: { color: 'bg-amber-500', text: 'text-amber-400', label: 'Riesgo moderado', icon: AlertTriangle },
    high: { color: 'bg-red-500', text: 'text-red-400', label: 'Riesgo alto', icon: AlertTriangle },
  }
  const c = config[level]
  const Icon = c.icon
  const width = Math.min(Math.abs(pct) * 20, 100)

  return (
    <div className="mt-3">
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${c.color}`}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3 h-3 ${c.text}`} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>{c.label}</span>
      </div>
    </div>
  )
}

export default function HerramientasPage() {
  const {
    inputs, setInput, results, history, historyLoading,
    saving, loadFromHistory, saveCalculation, deleteCalculation,
  } = useRiskCalculator()

  const [tab, setTab] = useState('riesgo')
  const [showHistory, setShowHistory] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const tabs = [
    { id: 'riesgo', label: 'Gestión de Riesgo', icon: Shield },
  ]

  return (
    <div className="space-y-6 px-4 md:px-8 pt-8 pb-20 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Herramientas</h1>
          <p className="text-gray-500 text-sm">Calculadoras y utilidades para traders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
              tab === t.id
                ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                : 'bg-white/[0.03] text-gray-400 border border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Calculator */}
      {tab === 'riesgo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Card */}
          <div className="lg:col-span-2 bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-black uppercase tracking-wider text-sm">Calculadora de Gestión de Riesgo</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Lotaje y porcentajes de capital</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Row 1: Capital + Riesgo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" /> Capital ($)
                  </label>
                  <input
                    type="number" step="any" min="0"
                    value={inputs.capital}
                    onChange={e => setInput('capital', e.target.value)}
                    placeholder="10000"
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> Riesgo (%)
                  </label>
                  <input
                    type="number" step="any" min="0" max="100"
                    value={inputs.riesgoPct}
                    onChange={e => setInput('riesgoPct', e.target.value)}
                    placeholder="1"
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Tipo de Lote
                  </label>
                  <select
                    value={inputs.lotType}
                    onChange={e => setInput('lotType', e.target.value)}
                    className={SELECT_CLASSES}
                  >
                    <option value="forex_std">Forex Standard (100k)</option>
                    <option value="forex_mini">Forex Mini (10k)</option>
                    <option value="forex_micro">Forex Micro (1k)</option>
                    <option value="crypto">Crypto (1 unidad)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Entry + SL + TP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Precio Entrada ($)
                  </label>
                  <input
                    type="number" step="any" min="0"
                    value={inputs.entryPrice}
                    onChange={e => setInput('entryPrice', e.target.value)}
                    placeholder="50.00"
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Stop Loss ($)
                  </label>
                  <input
                    type="number" step="any" min="0"
                    value={inputs.stopLoss}
                    onChange={e => setInput('stopLoss', e.target.value)}
                    placeholder="48.50"
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Take Profit ($)
                  </label>
                  <input
                    type="number" step="any" min="0"
                    value={inputs.takeProfit}
                    onChange={e => setInput('takeProfit', e.target.value)}
                    placeholder="Opcional"
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              {/* Nota */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nota (opcional)</label>
                <input
                  type="text"
                  value={inputs.nota}
                  onChange={e => setInput('nota', e.target.value)}
                  placeholder="Ej: EUR/USD largo, BTC spot..."
                  className={INPUT_CLASSES}
                />
              </div>

              {/* Results */}
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Resultados</p>
                <ResultRow
                  label="Riesgo en USD"
                  value={`$${results.riesgoUsd.toFixed(2)}`}
                  color="text-red-400"
                />
                <ResultRow
                  label="Distancia al SL"
                  value={`${results.distanciaSlPct.toFixed(2)}%`}
                  sub={`$${Math.abs(parseFloat(inputs.entryPrice) - parseFloat(inputs.stopLoss)).toFixed(6)} por unidad`}
                />
                <ResultRow
                  label="Tamaño de posición"
                  value={results.tamanoPosicion.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  sub="unidades"
                  color="text-blue-400"
                />
                <ResultRow
                  label="Lotes"
                  value={results.lotes.toFixed(4)}
                  color="text-amber-400"
                />
                <ResultRow
                  label="Valor de posición"
                  value={`$${results.valorPosicion.toFixed(2)}`}
                />
                <ResultRow
                  label="Apalancamiento"
                  value={`${results.apalancamiento.toFixed(2)}x`}
                  color={results.apalancamiento > 10 ? 'text-red-400' : 'text-emerald-400'}
                />
                {results.ratioRr !== null && (
                  <ResultRow
                    label="Ratio Riesgo/Beneficio"
                    value={`1:${results.ratioRr.toFixed(2)}`}
                    color={results.ratioRr >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}
                    sub={`TP: ${results.distanciaTpPct?.toFixed(2)}%`}
                  />
                )}
                {results.gananciaPotencial !== null && (
                  <ResultRow
                    label="Ganancia potencial"
                    value={`$${results.gananciaPotencial.toFixed(2)}`}
                    color="text-emerald-400"
                  />
                )}
                <RiskBar pct={parseFloat(inputs.riesgoPct) || 0} />
              </div>

              {/* Save button */}
              <button
                onClick={saveCalculation}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blis-red/10 border border-blis-red/20 text-blis-red rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blis-red/20 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar cálculo
              </button>
            </div>
          </div>

          {/* History Panel */}
          <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-white font-black uppercase tracking-wider text-sm">Historial</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{history.length} cálculo(s) guardados</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>

            {showHistory && (
              <div className="flex-1 overflow-y-auto max-h-[500px]">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-blis-red animate-spin" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <History className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Sin cálculos guardados</p>
                    <p className="text-gray-600 text-xs mt-1">Guarda tu primer cálculo para verlo aquí</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {history.map(entry => (
                      <div
                        key={entry.id}
                        className="px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                        onClick={() => loadFromHistory(entry)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-bold truncate">
                              {entry.nota || `$${Number(entry.capital).toLocaleString()} @ ${Number(entry.entry_price)}`
                              }
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[9px] text-red-400 font-bold">
                                SL: ${Number(entry.stop_loss)}
                              </span>
                              <span className="text-[9px] text-gray-600">·</span>
                              <span className="text-[9px] text-amber-400 font-bold">
                                {Number(entry.lotes).toFixed(2)} lotes
                              </span>
                              <span className="text-[9px] text-gray-600">·</span>
                              <span className="text-[9px] text-gray-500">
                                Riesgo {Number(entry.riesgo_pct)}%
                              </span>
                              {entry.ratio_rr && (
                                <>
                                  <span className="text-[9px] text-gray-600">·</span>
                                  <span className="text-[9px] text-emerald-400 font-bold">
                                    R/R {Number(entry.ratio_rr).toFixed(2)}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-[9px] text-gray-600 mt-1">
                              {new Date(entry.creado_en).toLocaleDateString('es-ES', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              setDeleting(entry.id)
                              deleteCalculation(entry.id).finally(() => setDeleting(null))
                            }}
                            disabled={deleting === entry.id}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 disabled:opacity-50"
                          >
                            {deleting === entry.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
