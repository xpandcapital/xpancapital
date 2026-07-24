"use client"

import { useState } from 'react'
import {
  Wrench, Shield, DollarSign, Activity, Trash2, Loader2,
  Save, History, ChevronDown, Calculator, CheckCircle2, AlertCircle,
  ScrollText, Brain, CheckSquare, AlertTriangle, ClipboardCheck,
} from 'lucide-react'
import { useRiskCalculator } from './_hooks/useRiskCalculator'
import { BitacoraTab } from './_components/BitacoraTab'
import { PsicologiaTab } from './_components/PsicologiaTab'
import { HabitosTab } from './_components/HabitosTab'
import { PanicModal } from './_components/PanicModal'
import { ChecklistTab } from './_components/ChecklistTab'

const INPUT_CLASSES = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors placeholder:text-gray-600"
const SELECT_CLASSES = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors appearance-none cursor-pointer"

const CURRENCY_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
  'AUD/USD', 'NZD/USD', 'USD/CAD', 'EUR/GBP',
  'EUR/JPY', 'GBP/JPY', 'EUR/CHF', 'GBP/CHF',
]

const ACCOUNT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'MXN', 'COP', 'PEN']

export default function HerramientasPage() {
  const {
    inputs, setInput, results, history, historyLoading,
    saving, lastSave, lastError, clearSaveStatus,
    loadFromHistory, saveCalculation, deleteCalculation,
  } = useRiskCalculator()

  const [tab, setTab] = useState('riesgo')
  const [showHistory, setShowHistory] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [panicOpen, setPanicOpen] = useState(false)

  const handleSave = async () => {
    const ok = await saveCalculation()
    if (ok) setShowHistory(true)
  }

  const tabs = [
    { id: 'riesgo', label: 'Gestión de Riesgo', icon: Shield },
    { id: 'bitacora', label: 'Bitácora', icon: ScrollText },
    { id: 'psicologia', label: 'Pronóstico y Psicología', icon: Brain },
    { id: 'habitos', label: 'Hábitos', icon: CheckSquare },
    { id: 'checklist', label: 'Lista de Procesos', icon: ClipboardCheck },
  ]

  return (
    <div className="space-y-6 px-4 md:px-8 pt-8 pb-20 w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Herramientas</h1>
            <p className="text-gray-500 text-sm">Calculadoras y utilidades para traders</p>
          </div>
        </div>
        <button
          onClick={() => setPanicOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Pánico</span>
        </button>
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
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dimensionamiento de lotes por pips</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Row 1: Par de divisas + Divisa cuenta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" /> Par de Divisas
                  </label>
                  <select
                    value={inputs.currencyPair}
                    onChange={e => setInput('currencyPair', e.target.value)}
                    className={SELECT_CLASSES}
                  >
                    {CURRENCY_PAIRS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" /> Divisa de la Cuenta
                  </label>
                  <select
                    value={inputs.accountCurrency}
                    onChange={e => setInput('accountCurrency', e.target.value)}
                    className={SELECT_CLASSES}
                  >
                    {ACCOUNT_CURRENCIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Tamaño cuenta + Ratio riesgo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" /> Tamaño de la Cuenta
                  </label>
                  <input
                    type="number" step="any" min="0"
                    value={inputs.accountSize}
                    onChange={e => setInput('accountSize', e.target.value)}
                    placeholder="10000"
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3 h-3" /> Ratio de Riesgo (%)
                  </label>
                  <input
                    type="number" step="any" min="0" max="100"
                    value={inputs.riskRatio}
                    onChange={e => setInput('riskRatio', e.target.value)}
                    placeholder="1"
                    className={INPUT_CLASSES}
                  />
                </div>
              </div>

              {/* Row 3: Stop Loss + Pips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Detención de Pérdida (pips)
                  </label>
                  <input
                    type="number" step="any" min="0"
                    value={inputs.stopLossPips}
                    onChange={e => setInput('stopLossPips', e.target.value)}
                    placeholder="50"
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Tamaño de la Transacción
                  </label>
                  <div className={`${INPUT_CLASSES} flex items-center justify-between bg-black/80`}>
                    <span className="text-amber-400 font-black">{results.lotes.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">lotes</span>
                  </div>
                </div>
              </div>

              {/* Nota */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nota (opcional)</label>
                <input
                  type="text"
                  value={inputs.nota}
                  onChange={e => setInput('nota', e.target.value)}
                  placeholder="Ej: EUR/USD largo, soporte en 1.0800..."
                  className={INPUT_CLASSES}
                />
              </div>

              {/* Results */}
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Resultados</p>

                <div className="flex items-center justify-between py-2.5 px-4 bg-white/[0.02] rounded-xl">
                  <span className="text-[11px] text-gray-400 font-medium">Dinero en riesgo</span>
                  <div className="text-right">
                    <span className="text-sm font-black text-red-400">${results.riesgoUsd.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-600 block">USD</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5 px-4 bg-white/[0.02] rounded-xl">
                  <span className="text-[11px] text-gray-400 font-medium">Dimensionamiento</span>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-400">{results.lotes.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-600 block">lotes</span>
                  </div>
                </div>
              </div>

              {/* Save feedback */}
              {lastSave === 'success' && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 text-xs font-bold">Cálculo guardado exitosamente</span>
                  <button onClick={clearSaveStatus} className="ml-auto text-emerald-400/60 hover:text-emerald-400 text-[10px]">✕</button>
                </div>
              )}
              {lastSave === 'error' && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-red-400 text-xs font-bold">{lastError || 'Error al guardar'}</span>
                  <button onClick={clearSaveStatus} className="ml-auto text-red-400/60 hover:text-red-400 text-[10px]">✕</button>
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
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
                              {entry.currency_pair || '?'} · {entry.nota || `$${Number(entry.capital || entry.account_size || 0).toLocaleString()}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[9px] text-red-400 font-bold">
                                SL: {entry.stop_loss_pips || entry.stop_loss}pips
                              </span>
                              <span className="text-[9px] text-gray-600">·</span>
                              <span className="text-[9px] text-amber-400 font-bold">
                                {Number(entry.lotes || 0).toFixed(2)} lotes
                              </span>
                              <span className="text-[9px] text-gray-600">·</span>
                              <span className="text-[9px] text-gray-500">
                                Riesgo {entry.risk_ratio || entry.riesgo_pct || 0}%
                              </span>
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

      {tab === 'bitacora' && <BitacoraTab />}

      {tab === 'psicologia' && <PsicologiaTab />}

      {tab === 'habitos' && <HabitosTab />}

      {tab === 'checklist' && <ChecklistTab />}

      <PanicModal open={panicOpen} onClose={() => setPanicOpen(false)} />
    </div>
  )
}
