"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Bell, BellRing, Zap, Radio, Globe, Activity, Shield, Trash2, Check,
  Satellite, Cpu, Crosshair, Eye, Filter, RefreshCw, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { AlertsConfig, AlertRule, SecurityAlertEntry } from '../_types';
import { defaultAlertsConfig } from '../_types';

interface Props {
  config?: AlertsConfig
  saving?: boolean
  onSave?: () => void
  onUpdate?: (updates: Partial<AlertsConfig>) => void
}

// Mapa SVG simplificado con puntos calientes
function WorldMapDots({ alerts, total }: { alerts: SecurityAlertEntry[]; total: number }) {
  const paises = alerts.reduce<Record<string, number>>((acc, a) => {
    const meta = a.metadata as Record<string, unknown> | undefined
    const pais = (meta?.pais as string) || 'XX'
    acc[pais] = (acc[pais] || 0) + 1
    return acc
  }, {})

  return (
    <div className="relative w-full h-48 bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 400">
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={400} stroke="white" strokeWidth={0.3} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 40} x2={800} y2={i * 40} stroke="white" strokeWidth={0.3} />
        ))}
      </svg>

      {/* Dot clusters por país */}
      {Object.entries(paises).map(([pais, count]) => {
        const pos = countryPosition(pais)
        if (!pos) return null
        const size = Math.min(16, 6 + count * 2)
        const opacity = Math.min(1, 0.4 + count * 0.1)
        return (
          <motion.div
            key={pais}
            className="absolute z-10"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="rounded-full blur-[1px]"
              style={{
                width: size, height: size,
                backgroundColor: count > 5 ? '#ef4444' : '#f59e0b',
                opacity,
                boxShadow: `0 0 ${size * 2}px ${count > 5 ? '#ef4444' : '#f59e0b'}`
              }}
            />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[7px] text-gray-500 font-mono">{pais}</span>
          </motion.div>
        )
      })}

      {total === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs">
          Sin actividad — esperando señales
        </div>
      )}

      {/* Scanner line effect */}
      <motion.div
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent z-20"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

function countryPosition(code: string): { x: number; y: number } | null {
  const map: Record<string, { x: number; y: number }> = {
    CN: { x: 72, y: 35 }, RU: { x: 65, y: 22 }, US: { x: 18, y: 30 },
    BR: { x: 32, y: 65 }, IN: { x: 65, y: 50 }, IR: { x: 58, y: 40 },
    NG: { x: 48, y: 55 }, VN: { x: 74, y: 50 }, PK: { x: 63, y: 44 },
    BD: { x: 68, y: 48 }, KP: { x: 78, y: 32 }, MX: { x: 15, y: 45 },
    CO: { x: 25, y: 55 }, PE: { x: 23, y: 62 }, AR: { x: 28, y: 75 },
    ES: { x: 44, y: 32 }, DE: { x: 48, y: 28 }, GB: { x: 44, y: 25 },
    FR: { x: 46, y: 30 }, JP: { x: 80, y: 32 }, KR: { x: 79, y: 33 },
    ID: { x: 75, y: 58 }, TH: { x: 73, y: 50 }, MY: { x: 74, y: 55 },
    PH: { x: 78, y: 50 }, AU: { x: 78, y: 72 }, ZA: { x: 52, y: 78 },
    EG: { x: 54, y: 40 }, TR: { x: 55, y: 33 }, UA: { x: 52, y: 28 },
    IL: { x: 55, y: 38 }, SA: { x: 58, y: 42 }, AE: { x: 60, y: 42 },
    MM: { x: 73, y: 48 }, BY: { x: 52, y: 25 }, SY: { x: 56, y: 38 },
    IQ: { x: 58, y: 40 }, AF: { x: 62, y: 40 }, SO: { x: 57, y: 52 },
    SD: { x: 54, y: 46 }, LY: { x: 48, y: 38 }, YE: { x: 57, y: 48 },
    UZ: { x: 64, y: 34 }, KZ: { x: 62, y: 30 }, MN: { x: 72, y: 28 },
    NP: { x: 66, y: 44 }, LK: { x: 67, y: 52 }, KH: { x: 74, y: 48 },
    LA: { x: 74, y: 46 }, CU: { x: 22, y: 42 }, VE: { x: 26, y: 52 },
    GE: { x: 56, y: 32 }, AZ: { x: 58, y: 34 }, AM: { x: 56, y: 34 },
    TJ: { x: 64, y: 36 }, KG: { x: 64, y: 34 }, TM: { x: 62, y: 34 },
    MD: { x: 53, y: 28 },
  }
  return map[code] || null
}

function ThreatGauge({ level, total }: { level: string; total: number }) {
  const pct = Math.min(100, total * 5)
  const hue = 120 - (pct / 100) * 120
  const color = `hsl(${hue}, 70%, 50%)`

  return (
    <div className="relative w-20 h-20">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(39,39,42)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 251} 251`}
          animate={{ strokeDasharray: `${(pct / 100) * 251} 251` }}
          transition={{ duration: 0.8 }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-white">{total}</span>
        <span className="text-[8px] text-gray-500 uppercase">{level}</span>
      </div>
    </div>
  )
}

function RadarScanner({ total }: { total: number }) {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Circles */}
      <svg viewBox="0 0 200 200" className="absolute inset-0">
        {[40, 80, 120, 160].map(r => (
          <circle key={r} cx="100" cy="100" r={r / 2} fill="none" stroke="rgb(63,63,70)" strokeWidth="0.5" opacity="0.5" />
        ))}
        {/* Sweep line */}
        <motion.line
          x1="100" y1="100" x2="100" y2="20"
          stroke="url(#grd)" strokeWidth="1"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 100px' }}
        />
        <defs>
          <linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {/* Blips */}
      {Array.from({ length: Math.min(total, 8) }, (_, i) => {
        const angle = (i * 45 + (total * 7)) % 360
        const dist = 30 + (i * 10) % 70
        const rad = (angle * Math.PI) / 180
        const cx = 50 + Math.cos(rad) * dist
        const cy = 50 + Math.sin(rad) * dist
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full"
            style={{ left: `${cx}%`, top: `${cy}%`, boxShadow: '0 0 6px #06b6d4' }}
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }}
          />
        )
      })}
      <div className="absolute inset-0 flex items-center justify-center">
        <Crosshair className="w-3 h-3 text-cyan-400/40" />
      </div>
    </div>
  )
}

export function AlertsTool({ config, saving, onSave, onUpdate }: Props) {
  const al = config || defaultAlertsConfig
  const [alerts, setAlerts] = useState<SecurityAlertEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroNivel, setFiltroNivel] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/seguridad/alerts?limit=50${filtroNivel ? '' : ''}`)
      const data = await res.json()
      if (data.success) setAlerts(data.data || [])
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [filtroNivel])

  useEffect(() => {
    fetchAlerts()
    if (!autoRefresh) return
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [fetchAlerts, autoRefresh])

  const markRead = async (id: string) => {
    await fetch('/api/admin/seguridad/alerts', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, leida: true })
    })
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, leida: true } : a))
  }

  const markAllRead = async () => {
    await fetch('/api/admin/seguridad/alerts', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leida: true })
    })
    setAlerts(prev => prev.map(a => ({ ...a, leida: true })))
  }

  const clearAll = async () => {
    if (!window.confirm('¿Eliminar todas las alertas?')) return
    await fetch('/api/admin/seguridad/alerts', { method: 'DELETE' })
    setAlerts([])
  }

  const toggleRule = (idx: number) => {
    if (!onUpdate) return
    const nuevas = [...al.reglas]
    nuevas[idx] = { ...nuevas[idx], habilitado: !nuevas[idx].habilitado }
    onUpdate({ reglas: nuevas })
  }

  const reglasActivas = al.reglas.filter(r => r.habilitado).length
  const noLeidas = alerts.filter(a => !a.leida).length
  const nivelGlobal = alerts.length > 5 ? 'critical' : alerts.length > 2 ? 'warning' : 'normal'

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
            <BellRing className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Alertas</h2>
            <p className="text-xs text-gray-500">Detección de amenazas · Radar · Heat Map · Notificaciones</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {noLeidas > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full">
                {noLeidas} nuevas
              </span>
            )}
            <span className={`text-xs ${al.habilitado ? 'text-green-400' : 'text-gray-500'}`}>
              {al.habilitado ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={() => onUpdate?.({ habilitado: !al.habilitado })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                al.habilitado ? 'bg-green-500' : 'bg-zinc-700'
              }`}
            >
              <motion.div animate={{ x: al.habilitado ? 20 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {al.habilitado && (
        <div className="p-6 space-y-6">
          {/* Top row: Radar + Gauge + Map */}
          <div className="grid grid-cols-3 gap-4">
            {/* Radar */}
            <div className="bg-zinc-900 rounded-xl border border-white/5 p-4 flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-3">
                <Radio className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Radar</span>
              </div>
              <RadarScanner total={alerts.length} />
              <span className="text-[10px] text-gray-600 mt-2">{alerts.length} señales detectadas</span>
            </div>

            {/* Threat Gauge */}
            <div className="bg-zinc-900 rounded-xl border border-white/5 p-4 flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-3">
                <Gauge className="w-3 h-3 text-red-400" />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Amenaza</span>
              </div>
              <ThreatGauge level={nivelGlobal} total={alerts.length} />
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${nivelGlobal === 'critical' ? 'bg-red-500' : nivelGlobal === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`} />
                <span className={`text-[10px] font-bold ${nivelGlobal === 'critical' ? 'text-red-400' : nivelGlobal === 'warning' ? 'text-amber-400' : 'text-green-400'}`}>
                  {nivelGlobal.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Heat Map */}
            <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Globe className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Heat Map</span>
              </div>
              <WorldMapDots alerts={alerts} total={alerts.length} />
            </div>
          </div>

          {/* Pulse line (activity over time) */}
          {alerts.length > 0 && (
            <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Actividad</span>
                <span className="ml-auto text-[10px] text-gray-600">{alerts.length} alertas totales</span>
              </div>
              <div className="h-16 relative">
                <svg viewBox="0 0 600 60" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <motion.path
                    d={generatePulsePath(alerts)}
                    fill="url(#pulseGrad)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {/* Line */}
                  <motion.path
                    d={generatePulsePath(alerts)}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    filter="url(#glow)"
                  />
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>
          )}

          {/* Reglas */}
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-gray-300 uppercase">Reglas de detección ({reglasActivas}/{al.reglas.length})</span>
              {reglasActivas < al.reglas.length && (
                <button
                  onClick={() => onUpdate?.({ reglas: al.reglas.map(r => ({ ...r, habilitado: true })) })}
                  className="ml-auto text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Activar todas
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {al.reglas.map((regla, i) => (
                <div
                  key={regla.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                    regla.habilitado
                      ? regla.nivel === 'critical' ? 'bg-red-500/5 border-red-500/10' : 'bg-amber-500/3 border-amber-500/10'
                      : 'bg-zinc-800 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${regla.nivel === 'critical' ? 'bg-red-400' : 'bg-amber-400'}`} />
                      <span className="text-[11px] font-bold text-white truncate">{regla.nombre}</span>
                    </div>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      +{regla.umbral} en {regla.ventana_minutos}min
                    </p>
                  </div>
                  <button onClick={() => toggleRule(i)} className={`w-8 h-4 rounded-full relative shrink-0 ${regla.habilitado ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                    <motion.div animate={{ x: regla.habilitado ? 14 : 1 }} className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 shadow-md" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Alert history */}
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-bold text-gray-300 uppercase">Historial de alertas</span>
              <div className="ml-auto flex items-center gap-2">
                {noLeidas > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1">
                    <Check className="w-3 h-3" /> Marcar leídas
                  </button>
                )}
                <button onClick={clearAll} className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {alerts.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-600 text-xs">
                  Sin alertas — todo tranquilo
                </div>
              )}
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    alert.leida ? 'bg-transparent' : 'bg-red-500/5 border border-red-500/10'
                  } hover:bg-white/[0.02]`}
                  onClick={() => !alert.leida && markRead(alert.id)}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.nivel === 'critical' ? 'bg-red-400 shadow-[0_0_6px_#f87171]' :
                    alert.nivel === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-white truncate">{alert.titulo}</span>
                      {!alert.leida && <span className="text-[9px] text-red-400 font-bold">NUEVA</span>}
                    </div>
                    <span className="text-[9px] text-gray-500">
                      {alert.created_at ? new Date(alert.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <Eye className="w-3 h-3 text-gray-600 shrink-0" />
                </div>
              ))}
              {loading && (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Channels */}
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Satellite className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-gray-300 uppercase">Canales de notificación</span>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                value={al.email_destino}
                onChange={e => onUpdate?.({ email_destino: e.target.value })}
                placeholder="admin@bliscorp.com"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/5 focus:border-blue-500/30"
              />
              <input
                type="url"
                value={al.webhook_url}
                onChange={e => onUpdate?.({ webhook_url: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/5 focus:border-blue-500/30"
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2 border-t border-white/5">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blis-red text-white text-sm font-bold rounded-xl hover:bg-blis-red/80 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function generatePulsePath(alerts: SecurityAlertEntry[]): string {
  if (alerts.length === 0) return 'M0,30 L600,30'
  const max = Math.max(1, alerts.length)
  let path = ''
  const points = alerts.slice(0, 24).reverse()
  const stepX = 600 / Math.max(1, points.length - 1)
  for (let i = 0; i < points.length; i++) {
    const x = i * stepX
    const nivel = points[i].nivel === 'critical' ? 3 : points[i].nivel === 'warning' ? 2 : 1
    const y = 50 - ((nivel / max) * 45)
    path += `${i === 0 ? 'M' : 'L'}${x},${y} `
  }
  return path + `L${(points.length - 1) * stepX},60 L0,60 Z`
}
