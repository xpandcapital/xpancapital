"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Trash2, Loader2, X, ScrollText,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Info,
  TrendingUp, TrendingDown, DollarSign, BarChart3, Edit2, Settings,
} from 'lucide-react'
import {
  AreaChart, Area, ComposedChart, Bar as RechartsBar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { useAuth } from '@/hooks/useAuth'
import { useBitacora, type BitacoraEntry, type BitacoraAnalytics } from '../_hooks/useBitacora'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const INPUT_CLASSES = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors placeholder:text-gray-600 [color-scheme:dark]"
const SELECT_CLASSES = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors appearance-none cursor-pointer [color-scheme:dark]"

const ACCION_OPTIONS = [
  { value: 'compra', label: 'Compra (Buy)' },
  { value: 'venta', label: 'Venta (Sell)' },
]

const CIERRE_OPTIONS = [
  { value: 'take_profit', label: 'Take Profit' },
  { value: 'stop_loss', label: 'Stop Loss' },
  { value: 'manual', label: 'Cierre Manual' },
  { value: 'trailing_stop', label: 'Trailing Stop' },
  { value: 'otro', label: 'Otro' },
]

const PLAN_OPTIONS = [
  { value: 'true', label: 'Sí' },
  { value: 'false', label: 'No' },
]

const DIVISAS = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD',
  'XAU', 'BTC', 'ETH', 'USDT', 'MXN', 'CNH', 'SEK', 'NOK',
]

const PAGE_SIZE = 10

function FieldTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="inline-flex items-center cursor-help ml-1">
          <Info className="w-3 h-3 text-gray-600 hover:text-gray-400 transition-colors" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="bg-zinc-900 border border-white/10 text-gray-300 text-[11px] max-w-[220px] px-3 py-2 rounded-xl">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}

const emptyEntry = (userId: string): Partial<BitacoraEntry> & { user_id: string } => ({
  user_id: userId,
  accion: 'compra',
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: null,
  hora: null,
  divisa_1: null,
  divisa_2: null,
  riesgo_beneficio: null,
  lotaje: null,
  perdidas_pips: null,
  ganancias_pips: null,
  tipo_cierre: null,
  resultado_usd: null,
  emociones: null,
  plan_trading: null,
  observacion: null,
})

export function BitacoraTab() {
  const { user } = useAuth()
  const { entries, loading, saving, lastSave, lastError, clearSaveStatus, saveEntry, deleteEntry,
    saldoInicial, saldoLoading, actualizarSaldo, analytics } = useBitacora()
  const [showSaldoModal, setShowSaldoModal] = useState(false)
  const [editSaldo, setEditSaldo] = useState(saldoInicial)

  // Analytics (ya calculado en el hook)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<BitacoraEntry> & { user_id: string } | null>(null)
  const [modalSaved, setModalSaved] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Filtrado
  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(e =>
      (e.divisa_1 + '/' + e.divisa_2).toLowerCase().includes(q) ||
      e.accion?.toLowerCase().includes(q) ||
      e.emociones?.toLowerCase().includes(q) ||
      e.observacion?.toLowerCase().includes(q) ||
      e.riesgo_beneficio?.toLowerCase().includes(q)
    )
  }, [entries, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageEntries = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const openNew = () => {
    if (!user?.id) return
    setEditing(emptyEntry(user.id))
    setModalSaved(false)
    setModalOpen(true)
  }

  const openEdit = (entry: BitacoraEntry) => {
    setEditing({ ...entry })
    setModalSaved(false)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    clearSaveStatus()
  }

  const handleSave = async () => {
    if (!editing) return
    const ok = await saveEntry(editing as any)
    if (ok) {
      setModalSaved(true)
      setTimeout(() => closeModal(), 500)
    }
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  const formatTime = (t: string | null) => t ? t.slice(0, 5) : '—'

  return (
    <TooltipProvider delay={300}>
      <div className="space-y-4">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              placeholder="Buscar por divisa, acción, emociones..."
              className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blis-red/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-blis-red text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blis-red/80 transition-colors shadow-lg shadow-blis-red/20"
            >
              <Plus className="w-4 h-4" />
              Nuevo Registro
            </button>
          </div>
        </div>

        {/* ===== ANALYTICS DASHBOARD ===== */}
        {!loading && analytics && (
          <div className="space-y-4">
            {/* Saldo config bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-xl">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Saldo Inicial:</span>
                <span className="text-sm font-black text-white">${saldoInicial.toLocaleString()}</span>
                <button onClick={() => { setEditSaldo(saldoInicial); setShowSaldoModal(true) }}
                  className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2-col layout: Stats Left + Chart Right */}
            <div className="grid grid-cols-1 lg:grid-cols-[28%_1fr] gap-4">
              {/* ===== PANEL IZQUIERDO: ESTADÍSTICAS ===== */}
              <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-white font-black uppercase tracking-wider text-[11px]">Estadísticas</h3>
                </div>
                <div className="p-3 space-y-0.5">
                  {[
                    { label: 'Gain', value: `${analytics.gain >= 0 ? '+' : ''}$${analytics.gain.toLocaleString()}`, color: analytics.gain >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'Abs. Gain', value: `${analytics.absGainPct >= 0 ? '+' : ''}${analytics.absGainPct}%`, color: analytics.absGainPct >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'Daily', value: `${analytics.daily >= 0 ? '+' : ''}$${analytics.daily.toLocaleString()}`, color: 'text-white/60' },
                    { label: 'Monthly', value: `${analytics.monthly >= 0 ? '+' : ''}$${analytics.monthly.toLocaleString()}`, color: 'text-white/60' },
                    { label: 'Drawdown', value: `-${analytics.drawdownPct}%`, color: 'text-amber-400' },
                    { label: 'Balance', value: `$${analytics.balance.toLocaleString()}`, color: 'text-white/70' },
                    { label: 'Equity', value: `$${analytics.equity.toLocaleString()}`, color: 'text-white/70' },
                    { label: 'Highest', value: `$${analytics.highest.toLocaleString()}`, color: 'text-emerald-400' },
                    { label: 'Profit', value: `$${analytics.profit.toLocaleString()}`, color: analytics.profit >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'Deposits', value: `$${analytics.deposits.toLocaleString()}`, color: 'text-blue-400' },
                    { label: 'Withdrawals', value: '$0', color: 'text-white/30' },
                  ].map((s, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-white/[0.02]">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{s.label}</span>
                      <span className={`text-xs font-black tabular-nums ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-white/5 flex justify-between px-2">
                    <span className="text-[10px] text-gray-500">Win Rate</span>
                    <span className="text-xs font-black text-blue-400">{analytics.winRate}% ({analytics.totalTrades}T)</span>
                  </div>
                </div>
              </div>

              {/* ===== PANEL DERECHO: GRÁFICO DE CRECIMIENTO ===== */}
              <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <h3 className="text-white font-black uppercase tracking-wider text-[11px]">Curva de Equity + Daily P&L</h3>
                </div>
                <div className="p-3">
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={analytics.equityCurve} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                        <XAxis dataKey="fecha" stroke="#52525b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#52525b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', fontSize: '12px' }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Balance']} />
                        <Area type="monotone" dataKey="saldo" stroke="#10b981" strokeWidth={2} fill="url(#equityGrad)" dot={false} activeDot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Pare Operados Pie Chart */}
            {analytics.paresOperados.length > 0 && (
              <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-white font-black uppercase tracking-wider text-[11px]">Divisas Más Usadas</h3>
                </div>
                <div className="p-3 flex items-center justify-center">
                  <div className="h-[220px] w-full max-w-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analytics.paresOperados.slice(0, 6)} dataKey="count" nameKey="par" cx="50%" cy="50%" outerRadius={80} label={({ par, count }: any) => `${par} (${count})`}>
                          {analytics.paresOperados.slice(0, 6).map((_, i) => (
                            <Cell key={i} fill={['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4'][i % 6]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0.75rem', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state shown when entries exist but analytics is still loading */}

        {/* Table */}
        <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="p-3 whitespace-nowrap">Fecha</th>
                  <th className="p-3 whitespace-nowrap">Hora</th>
                  <th className="p-3 whitespace-nowrap">Acción</th>
                  <th className="p-3 whitespace-nowrap">Divisa</th>
                  <th className="p-3 whitespace-nowrap hidden md:table-cell">R:R</th>
                  <th className="p-3 whitespace-nowrap hidden md:table-cell">Lotaje</th>
                  <th className="p-3 whitespace-nowrap hidden md:table-cell">SL</th>
                  <th className="p-3 whitespace-nowrap hidden md:table-cell">TP</th>
                  <th className="p-3 whitespace-nowrap hidden lg:table-cell">Cierre</th>
                  <th className="p-3 whitespace-nowrap">Resultado</th>
                  <th className="p-3 whitespace-nowrap hidden lg:table-cell">Plan</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center">
                      <Loader2 className="w-6 h-6 text-blis-red animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : pageEntries.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center">
                      <ScrollText className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Sin registros en la bitácora</p>
                      <p className="text-gray-600 text-xs mt-1">Registra tu primera operación</p>
                    </td>
                  </tr>
                ) : (
                  pageEntries.map(entry => (
                    <tr
                      key={entry.id}
                      onClick={() => openEdit(entry)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="p-3 whitespace-nowrap">
                        <span className="text-white text-xs">{formatDate(entry.fecha_inicio)}</span>
                        {entry.fecha_fin && <span className="text-gray-600 text-[10px] block">{formatDate(entry.fecha_fin)}</span>}
                      </td>
                      <td className="p-3 whitespace-nowrap text-gray-400 text-xs">{formatTime(entry.hora)}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          entry.accion === 'compra'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {entry.accion === 'compra' ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-white text-xs font-bold">
                        {entry.divisa_1 && entry.divisa_2 ? `${entry.divisa_1}/${entry.divisa_2}` : (entry.divisa_1 || entry.divisa_2 || '—')}
                      </td>
                      <td className="p-3 whitespace-nowrap text-gray-400 text-xs hidden md:table-cell">{entry.riesgo_beneficio || '—'}</td>
                      <td className="p-3 whitespace-nowrap text-gray-400 text-xs hidden md:table-cell">{entry.lotaje ?? '—'}</td>
                      <td className="p-3 whitespace-nowrap text-red-400 text-xs font-bold hidden md:table-cell">{entry.perdidas_pips ?? '—'}</td>
                      <td className="p-3 whitespace-nowrap text-emerald-400 text-xs font-bold hidden md:table-cell">{entry.ganancias_pips ?? '—'}</td>
                      <td className="p-3 whitespace-nowrap text-gray-400 text-xs hidden lg:table-cell">
                        {entry.tipo_cierre ? CIERRE_OPTIONS.find(c => c.value === entry.tipo_cierre)?.label || entry.tipo_cierre : '—'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`text-xs font-black ${(entry.resultado_usd ?? 0) > 0 ? 'text-emerald-400' : (entry.resultado_usd ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {entry.resultado_usd != null ? `${entry.resultado_usd > 0 ? '+' : ''}$${entry.resultado_usd.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap hidden lg:table-cell">
                        {entry.plan_trading === true ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : entry.plan_trading === false ? (
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            if (confirm('¿Eliminar este registro?')) {
                              setDeleting(entry.id)
                              deleteEntry(entry.id).finally(() => setDeleting(null))
                            }
                          }}
                          disabled={deleting === entry.id}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        >
                          {deleting === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <span className="text-[10px] text-gray-500">
                Página {page + 1} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = totalPages <= 5 ? i : page < 2 ? i : page > totalPages - 3 ? totalPages - 5 + i : page - 2 + i
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-colors ${p === page ? 'bg-blis-red text-white' : 'text-gray-500 hover:bg-white/5'}`}
                    >
                      {p + 1}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save feedback */}
        {lastSave === 'success' && (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 text-xs font-bold">Registro guardado</span>
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
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-start justify-center py-[6vh] px-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center">
                    <ScrollText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-white font-black uppercase tracking-wider text-sm">
                      {editing.id ? 'Editar Registro' : 'Nuevo Registro'}
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Completa los datos de la operación</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-3.5 max-h-[50vh] overflow-y-auto">
                {/* Row 1: Fecha Inicio / Fecha Fin / Hora */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Fecha Inicio <FieldTooltip text="Fecha de apertura de la operación." />
                    </label>
                    <input
                      type="date" value={editing.fecha_inicio || ''}
                      onChange={e => setEditing({ ...editing, fecha_inicio: e.target.value })}
                      className={INPUT_CLASSES}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Fecha Fin <FieldTooltip text="Fecha de cierre de la operación." />
                    </label>
                    <input
                      type="date" value={editing.fecha_fin || ''}
                      onChange={e => setEditing({ ...editing, fecha_fin: e.target.value || null })}
                      className={INPUT_CLASSES}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Hora <FieldTooltip text="Hora de apertura (ideal para identificar tu sesión de mercado)." />
                    </label>
                    <input
                      type="time" value={editing.hora || ''}
                      onChange={e => setEditing({ ...editing, hora: e.target.value || null })}
                      className={INPUT_CLASSES}
                    />
                  </div>
                </div>

                {/* Row 2: Acción + Divisa agrupada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Acción <FieldTooltip text="Dirección de tu entrada: Compra (Buy) o Venta (Sell)." />
                    </label>
                    <select
                      value={editing.accion || 'compra'}
                      onChange={e => setEditing({ ...editing, accion: e.target.value })}
                      className={SELECT_CLASSES}
                    >
                      {ACCION_OPTIONS.map(o => (
                        <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Divisa <FieldTooltip text="Activos que componen el par operado." />
                    </label>
                    <div className="flex items-stretch bg-black/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-blis-red/50 transition-colors">
                      <select
                        value={editing.divisa_1 || ''}
                        onChange={e => setEditing({ ...editing, divisa_1: e.target.value || null })}
                        className="flex-1 bg-transparent px-3 py-3 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-zinc-900">—</option>
                        {DIVISAS.map(d => (
                          <option key={d} value={d} className="bg-zinc-900">{d}</option>
                        ))}
                      </select>
                      <span className="flex items-center text-gray-600 text-sm font-bold px-1 bg-black/30">/</span>
                      <select
                        value={editing.divisa_2 || ''}
                        onChange={e => setEditing({ ...editing, divisa_2: e.target.value || null })}
                        className="flex-1 bg-transparent px-3 py-3 text-white text-sm focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-zinc-900">—</option>
                        {DIVISAS.map(d => (
                          <option key={d} value={d} className="bg-zinc-900">{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 3: R:R + Lotaje */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Riesgo-Beneficio <FieldTooltip text="Relación riesgo vs. ganancia proyectada (Ej. 1:3)." />
                    </label>
                    <input
                      type="text" value={editing.riesgo_beneficio || ''}
                      onChange={e => setEditing({ ...editing, riesgo_beneficio: e.target.value || null })}
                      placeholder="1:3"
                      className={INPUT_CLASSES}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Lotaje <FieldTooltip text="Tamaño del lote utilizado en la posición." />
                    </label>
                    <input
                      type="number" step="any" value={editing.lotaje ?? ''}
                      onChange={e => setEditing({ ...editing, lotaje: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="0.10"
                      className={INPUT_CLASSES}
                    />
                  </div>
                </div>

                {/* Row 4: Pips SL + Pips TP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Pérdidas en Pips <FieldTooltip text="Distancia en pips dispuesta a arriesgar (Stop Loss)." />
                    </label>
                    <input
                      type="number" step="any" value={editing.perdidas_pips ?? ''}
                      onChange={e => setEditing({ ...editing, perdidas_pips: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="50"
                      className={INPUT_CLASSES}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Ganancias en Pips <FieldTooltip text="Pips proyectados u obtenidos (Take Profit)." />
                    </label>
                    <input
                      type="number" step="any" value={editing.ganancias_pips ?? ''}
                      onChange={e => setEditing({ ...editing, ganancias_pips: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="150"
                      className={INPUT_CLASSES}
                    />
                  </div>
                </div>

                {/* Row 5: Tipo Cierre + Resultado USD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Tipo Cierre <FieldTooltip text="Motivo por el que finalizó la operación (TP, SL, Manual, etc.)." />
                    </label>
                    <select
                      value={editing.tipo_cierre || ''}
                      onChange={e => setEditing({ ...editing, tipo_cierre: e.target.value || null })}
                      className={SELECT_CLASSES}
                    >
                      <option value="" className="bg-zinc-900">—</option>
                      {CIERRE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Resultados USD <FieldTooltip text="Ganancia o pérdida final monetaria en dólares." />
                    </label>
                    <input
                      type="number" step="any" value={editing.resultado_usd ?? ''}
                      onChange={e => setEditing({ ...editing, resultado_usd: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="+150.00"
                      className={INPUT_CLASSES}
                    />
                  </div>
                </div>

                {/* Row 6: Emociones + Plan Trading */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Emociones <FieldTooltip text="Emociones que influyeron (miedo, euforia, avaricia, etc.)." />
                    </label>
                    <input
                      type="text" value={editing.emociones || ''}
                      onChange={e => setEditing({ ...editing, emociones: e.target.value || null })}
                      placeholder="Disciplina, Euforia, Miedo..."
                      className={INPUT_CLASSES}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Plan de Trading <FieldTooltip text="¿La operación respetó todas las reglas de tu estrategia?" />
                    </label>
                    <select
                      value={editing.plan_trading === true ? 'true' : editing.plan_trading === false ? 'false' : ''}
                      onChange={e => {
                        const v = e.target.value
                        setEditing({ ...editing, plan_trading: v === 'true' ? true : v === 'false' ? false : null })
                      }}
                      className={SELECT_CLASSES}
                    >
                      <option value="" className="bg-zinc-900">—</option>
                      {PLAN_OPTIONS.map(o => (
                        <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 7: Observación */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Observación <FieldTooltip text="Notas del mercado, calidad de ejecución o lecciones aprendidas." />
                  </label>
                  <textarea
                    value={editing.observacion || ''}
                    onChange={e => setEditing({ ...editing, observacion: e.target.value || null })}
                    placeholder="Contexto del mercado, análisis, lecciones aprendidas..."
                    rows={4}
                    className={`${INPUT_CLASSES} resize-none`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-white/[0.01]">
                {modalSaved ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-bold">¡Guardado!</span>
                  </div>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeModal}
                    disabled={saving}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 font-bold hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || modalSaved}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blis-red text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blis-red/80 transition-colors disabled:opacity-50 shadow-lg shadow-blis-red/20"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : modalSaved ? <CheckCircle2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    {modalSaved ? 'Guardado' : editing?.id ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Saldo Inicial */}
      <AnimatePresence>
        {showSaldoModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSaldoModal(false)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blis-red" /> Saldo Inicial
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3">Define el capital de partida (Día 0)</p>
              <input type="number" step="any" min="0" value={editSaldo}
                onChange={e => setEditSaldo(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-blis-red/50 transition-colors mb-4" />
              <div className="flex gap-2">
                <button onClick={() => setShowSaldoModal(false)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-xs font-bold hover:text-white transition-colors">
                  Cancelar
                </button>
                <button onClick={async () => {
                  await actualizarSaldo(editSaldo)
                  setShowSaldoModal(false)
                }}
                  className="flex-1 py-2.5 bg-blis-red/15 border border-blis-red/30 text-blis-red rounded-xl font-bold text-xs hover:bg-blis-red/25 transition-colors">
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}
