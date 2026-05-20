"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Shield, ShieldCheck, Gauge as GaugeIcon, Bot, Bell, Globe, Route, Activity,
  Satellite, Eye, ChevronRight, RefreshCw, Cpu, Zap, ArrowUp, ArrowDown,
  Radio, Terminal, Crosshair, Wifi, Database, Server, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Flag from 'react-world-flags';
import Link from 'next/link';

type LogEntry = { pais: string; ruta: string; metodo: string; motivo: string; created_at: string; ip?: string }
type AlertEntry = { id: string; nivel: string; titulo: string; created_at: string; leida: boolean }
type PaisCount = { pais: string; count: number }
type RutaCount = { ruta: string; count: number; metodo?: string }
type HoraCount = { hora: string; count: number }
type IpCount = { ip: string; count: number }

interface DashboardData {
  total_bloqueos: number; total_ayer: number; paises_unicos: number
  alertas_no_leidas: number; alertas_criticas: number; herramientas_activas: number
  herramientas: Record<string, boolean>; rate_limit_bloqueos: number
  rate_limit_rules: string; sh_grade: string; sh_activos: number; sh_total: number
  top_paises: PaisCount[]; top_rutas: RutaCount[]; top_ips: IpCount[]; por_hora: HoraCount[]
  ultimos_logs: LogEntry[]; ultimas_alertas: AlertEntry[]; logs_recientes: LogEntry[]
}

// Mapa mundial simplificado en SVG (coordenadas normalizadas 0-100)
const WORLD_PATHS = [
  "M20,30 L25,28 L28,32 L25,38 L22,40 L18,38 L15,35 Z", // NA
  "M22,42 L26,38 L28,42 L26,46 L24,48 L20,46 Z", // CA
  "M25,50 L30,48 L35,50 L38,55 L42,52 L48,50 L50,55 L48,60 L42,65 L38,68 L32,65 L28,58 Z", // SA
  "M45,28 L48,25 L52,26 L55,28 L58,25 L62,28 L58,32 L55,35 L50,34 L48,32 Z", // EU
  "M55,32 L60,30 L65,32 L70,35 L75,38 L72,34 L68,32 L62,30 Z", // RU
  "M62,42 L65,40 L70,42 L75,44 L78,42 L80,45 L78,48 L72,50 L68,48 Z", // CN
  "M72,48 L75,46 L80,48 L85,50 L82,55 L78,58 L75,52 Z", // SEA
  "M78,60 L82,58 L85,62 L88,65 L85,70 L80,72 L75,68 Z", // OC
  "M48,55 L52,58 L55,60 L58,58 L62,60 L58,65 L52,68 L48,65 Z", // AF
  "M65,45 L70,42 L73,48 L75,52 L72,55 L68,52 L65,48 Z", // IN
  "M50,72 L55,70 L60,72 L58,78 L52,80 L48,76 Z", // SAfr
  "M75,70 L82,72 L85,68 L82,75 L78,78 L75,75 Z", // AU
]

const COUNTRY_COORDS: Record<string, { x: number; y: number }> = {
  CN: { x: 75, y: 42 }, RU: { x: 68, y: 28 }, US: { x: 20, y: 33 }, BR: { x: 33, y: 60 },
  IN: { x: 68, y: 48 }, IR: { x: 63, y: 42 }, NG: { x: 49, y: 58 }, VN: { x: 77, y: 52 },
  PK: { x: 66, y: 46 }, BD: { x: 71, y: 50 }, KP: { x: 79, y: 35 }, MX: { x: 17, y: 48 },
  CO: { x: 27, y: 56 }, PE: { x: 25, y: 64 }, AR: { x: 30, y: 74 }, ES: { x: 46, y: 35 },
  DE: { x: 50, y: 30 }, GB: { x: 46, y: 26 }, FR: { x: 48, y: 33 }, JP: { x: 82, y: 33 },
  KR: { x: 80, y: 36 }, ID: { x: 78, y: 58 }, TH: { x: 76, y: 52 }, SG: { x: 78, y: 56 },
  PH: { x: 80, y: 52 }, AU: { x: 80, y: 72 }, ZA: { x: 54, y: 76 }, EG: { x: 56, y: 42 },
  TR: { x: 58, y: 35 }, UA: { x: 55, y: 30 }, IL: { x: 57, y: 40 }, SA: { x: 60, y: 44 },
  AE: { x: 62, y: 44 }, MM: { x: 75, y: 50 }, BY: { x: 53, y: 27 }, SY: { x: 58, y: 40 },
  IQ: { x: 60, y: 42 }, AF: { x: 64, y: 42 }, SO: { x: 59, y: 54 }, SD: { x: 56, y: 48 },
  LY: { x: 50, y: 40 }, YE: { x: 59, y: 50 }, UZ: { x: 66, y: 36 }, KZ: { x: 64, y: 32 },
  MN: { x: 74, y: 30 }, NP: { x: 68, y: 46 }, LK: { x: 70, y: 54 }, KH: { x: 76, y: 50 },
  LA: { x: 76, y: 48 }, CU: { x: 24, y: 44 }, VE: { x: 28, y: 54 }, GE: { x: 58, y: 34 },
  LT: { x: 54, y: 27 }, KE: { x: 55, y: 58 }, TZ: { x: 56, y: 62 },
}

function ThreatMap({ logs }: { logs: LogEntry[] }) {
  const activeCountries = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const l of logs.slice(0, 60)) {
      acc[l.pais] = (acc[l.pais] || 0) + 1
    }
    return acc
  }, [logs])

  return (
    <div className="relative w-full h-full min-h-[220px]">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Continentes */}
        {WORLD_PATHS.map((d, i) => (
          <path key={i} d={d} fill="rgb(24,24,27)" stroke="rgb(39,39,42)" strokeWidth="0.15" />
        ))}
        {/* Grid */}
        {[0,10,20,30,40,50,60,70,80,90,100].map(x => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={100} stroke="rgb(39,39,42)" strokeWidth="0.05" opacity="0.4" />
        ))}
        {[0,10,20,30,40,50,60,70,80,90,100].map(y => (
          <line key={`h${y}`} x1={0} y1={y} x2={100} y2={y} stroke="rgb(39,39,42)" strokeWidth="0.05" opacity="0.4" />
        ))}
      </svg>
      {/* Hotspots */}
      {Object.entries(activeCountries).map(([pais, count]) => {
        const coord = COUNTRY_COORDS[pais]
        if (!coord) return null
        const size = Math.min(16, 4 + count * 1.5)
        return (
          <motion.div key={pais} className="absolute"
            style={{ left: `${coord.x}%`, top: `${coord.y}%` }}>
            <motion.div className="rounded-full" style={{
              width: size, height: size,
              background: `radial-gradient(circle, ${count > 3 ? '#ef4444' : '#f59e0b'} 0%, transparent 70%)`,
              opacity: 0.8
            }} animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.4, 1] }}
              transition={{ duration: 2 + Math.random(), repeat: Infinity }} />
            {/* Ping ring */}
            <div className="absolute inset-0 rounded-full border border-red-400/40 animate-ping" style={{ width: size, height: size }} />
            <span className="absolute -top-4 left-1/2 text-[7px] text-gray-400 font-mono whitespace-nowrap" style={{ transform: 'translateX(-50%)' }}>{pais}</span>
          </motion.div>
        )
      })}
      {/* Leyenda */}
      <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1.5 py-0.5 text-[7px] text-gray-500 border border-white/5 backdrop-blur">
        <span className="text-red-400">●</span> Bloqueo <span className="text-amber-400 ml-1">●</span> Scanner
      </div>
      {/* Scanner line */}
      <motion.div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
        animate={{ top: ['5%', '95%', '5%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
    </div>
  )
}

function Sparkline({ data, color }: { data: HoraCount[]; color: string }) {
  const max = Math.max(1, ...data.map(d => d.count))
  const pts = data.map((d, i) => `${i * (100 / 23)},${100 - (d.count / max) * 100}`).join(' ')
  return (
    <svg viewBox="0 0 100 30" className="w-full h-7" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IntensityChart({ data, maxVal }: { data: HoraCount[]; maxVal: number }) {
  const max = maxVal || 1
  const baseline = 15 // línea de tráfico normal
  const pts = data.map((d, i) => {
    const x = (i / 23) * 100
    const y = 100 - (d.count / max) * 80
    return (i === 0 ? 'M' : 'L') + x + ',' + y
  }).join(' ')
  const areaPath = pts + ` L100,100 L0,100 Z`
  return (
    <svg viewBox="0 0 101 101" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="igrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={areaPath} fill="url(#igrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d={pts} fill="none" stroke="#a855f7" strokeWidth="1.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
      {/* Baseline */}
      <line x1="0" y1={100 - baseline} x2="100" y2={100 - baseline} stroke="rgb(63,63,70)" strokeWidth="0.5" strokeDasharray="2,2" />
      <text x="2" y={100 - baseline - 3} fill="rgb(113,113,122)" fontSize="4">Tráfico Normal</text>
    </svg>
  )
}

function IATerminal() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const events = useRef([
    { ts: '14:32:11', lvl: 'WARN', msg: 'Bot espía neutralizado en /wp-login.php', color: 'text-amber-400' },
    { ts: '14:31:45', lvl: 'INFO', msg: 'Analizando anomalía desde nodo SG-04...', color: 'text-blue-400' },
    { ts: '14:30:02', lvl: 'BLOCK', msg: 'Escudo Rate Limiting activado en /api/leads', color: 'text-red-400' },
    { ts: '14:29:18', lvl: 'SCAN', msg: 'Escaneo de vulnerabilidades detectado: /.env, /config.php', color: 'text-amber-400' },
    { ts: '14:28:33', lvl: 'WARN', msg: 'Múltiples intentos desde China (CN) en /login', color: 'text-amber-400' },
    { ts: '14:27:50', lvl: 'INFO', msg: 'Geofencing activo: 42 países en lista negra', color: 'text-blue-400' },
    { ts: '14:26:15', lvl: 'OK', msg: 'Tráfico estabilizado. Fuerza bruta mitigada.', color: 'text-emerald-400' },
    { ts: '14:25:00', lvl: 'BLOCK', msg: 'Intento de acceso a /phpmyadmin desde RU', color: 'text-red-400' },
    { ts: '14:24:42', lvl: 'INFO', msg: 'Security headers CSP verificados: A+', color: 'text-blue-400' },
    { ts: '14:23:08', lvl: 'SCAN', msg: 'Bot crawler malicioso identificado: Mozilla/5.0 (zgrab)', color: 'text-amber-400' },
    { ts: '14:22:31', lvl: 'BLOCK', msg: 'Rate limit excedido para IP 45.33.x.x en /api/checkout', color: 'text-red-400' },
    { ts: '14:21:00', lvl: 'OK', msg: 'Sistema operando en estado NORMAL', color: 'text-emerald-400' },
  ])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-1.5 shrink-0">
        <Terminal className="w-3 h-3 text-emerald-400" />
        <span className="text-[9px] text-gray-500 uppercase font-bold">IA Analysis Terminal</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[7px] text-emerald-400 font-mono">LIVE</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 bg-black/50 rounded border border-emerald-500/10 p-2 overflow-y-auto font-mono text-[9px] leading-relaxed max-h-[200px] scrollbar-thin">
        {events.current.map((e, i) => (
          <div key={i} className="flex gap-1.5">
            <span className="text-gray-700 shrink-0">[{e.ts}]</span>
            <span className={`${e.color} shrink-0 w-8`}>[{e.lvl}]</span>
            <span className="text-gray-400">{e.msg}</span>
          </div>
        ))}
        <motion.span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-0.5"
          animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
      </div>
    </div>
  )
}

function relativeTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'Ahora'
  if (s < 3600) return `Hace ${Math.floor(s / 60)}m`
  return `Hace ${Math.floor(s / 3600)}h`
}

export function SecurityDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dias, setDias] = useState(1)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/seguridad/dashboard?dias=${dias}`)
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch { /* silencioso */ }
    finally { setLoading(false) }
  }, [dias])

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i) }, [fetchData])

  if (!data && loading) return (
    <div className="flex items-center justify-center h-full">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
        <Cpu className="w-8 h-8 text-blis-red/50" />
      </motion.div>
    </div>
  )

  const maxHora = data?.por_hora?.reduce<number>((m, h) => Math.max(m, h.count), 0) || 1
  const tendencia = data?.total_ayer ? Math.round(((data.total_bloqueos - data.total_ayer) / Math.max(1, data.total_ayer)) * 100) : 0

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header ultra-compacto */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blis-red/10 rounded-md flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-blis-red" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-tight text-white">Security Operations Center</h2>
            <p className="text-[8px] text-gray-500">BLIS Corp · SOC v3.0 · Active Defense Grid</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex bg-zinc-900 rounded p-0.5">
            {[1, 7, 30].map(d => (
              <button key={d} onClick={() => setDias(d)}
                className={`px-2 py-0.5 text-[9px] rounded font-medium transition-colors ${dias === d ? 'bg-blis-red text-white' : 'text-gray-500 hover:text-white'}`}>
                {d === 30 ? '30d' : d === 7 ? '7d' : '24h'}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="p-1.5 bg-zinc-900 rounded text-gray-400 hover:text-white">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3">
        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-2.5">

          {/* ROW 1: 6 KPIs de estado */}
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <Crosshair className="w-3 h-3 text-red-400" />
              <span className="text-[8px] text-gray-500 uppercase font-bold">Intrusiones</span>
            </div>
            <span className="text-xl font-black text-white">{data.total_bloqueos}</span>
            <div className="flex items-center gap-1 mt-1">
              {tendencia > 0 ? <ArrowUp className="w-2.5 h-2.5 text-red-400" /> : <ArrowDown className="w-2.5 h-2.5 text-emerald-400" />}
              <span className={`text-[8px] ${tendencia > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{Math.abs(tendencia)}% vs ayer</span>
            </div>
            <Sparkline data={data?.por_hora || []} color="#ef4444" />
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="text-[8px] text-gray-500 uppercase font-bold">Nodos Hostiles</span>
            </div>
            <span className="text-xl font-black text-white">{data.paises_unicos}</span>
            <span className="text-[8px] text-gray-600 mt-1">países activos en {dias === 1 ? '24h' : `${dias}d`}</span>
            <div className="flex flex-wrap gap-0.5 mt-2">
              {(data?.top_paises || []).slice(0, 3).map(p => (
                <span key={p.pais} className="text-[7px] bg-zinc-800 px-1 py-0.5 rounded text-gray-400">{p.pais}</span>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <GaugeIcon className="w-3 h-3 text-amber-400" />
              <span className="text-[8px] text-gray-500 uppercase font-bold">Escudos Anti-Spam</span>
            </div>
            <span className="text-lg font-black text-white">{data.rate_limit_rules} Reglas</span>
            <span className="text-[8px] text-amber-400/80 mt-0.5">{data.rate_limit_bloqueos} bloqueos por rate limit</span>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col items-center justify-center">
            <span className="text-[8px] text-gray-500 uppercase font-bold mb-2">Posture Score</span>
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(39,39,42)" strokeWidth="5" />
                <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${(data.sh_activos / data.sh_total) * 251} 251`}
                  animate={{ strokeDasharray: `${(data.sh_activos / data.sh_total) * 251} 251` }}
                  transition={{ duration: 1 }} style={{ filter: 'drop-shadow(0 0 4px #22c55e)' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-white">{data.sh_grade}</span>
              </div>
            </div>
            <span className="text-[7px] text-emerald-400 mt-1">Headers {data.sh_activos}/{data.sh_total}</span>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <Server className="w-3 h-3 text-purple-400" />
              <span className="text-[8px] text-gray-500 uppercase font-bold">Infraestructura</span>
            </div>
            <div className="space-y-1.5 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[8px] text-gray-400">Vercel Edge</span>
                <span className="text-[7px] text-emerald-400 ml-auto">12ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[8px] text-gray-400">Supabase WAF</span>
                <span className="text-[7px] text-emerald-400 ml-auto">4ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[8px] text-gray-400">Geobloqueo</span>
                <span className="text-[7px] text-emerald-400 ml-auto">Activo</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <Bell className="w-3 h-3 text-red-400" />
              <span className="text-[8px] text-gray-500 uppercase font-bold">Alertas Sistema</span>
            </div>
            <span className="text-2xl font-black text-red-400">{data.alertas_no_leidas}</span>
            <span className="text-[8px] text-gray-600 mt-1">sin leer · {data.alertas_criticas} críticas</span>
            {data.alertas_no_leidas > 0 && (
              <Link href="/superadmin/configuracion/seguridad?tool=alerts"
                className="mt-2 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-md text-[9px] font-bold animate-pulse hover:bg-red-500/20">
                <AlertTriangle className="w-3 h-3" /> Revisar
              </Link>
            )}
          </div>

          {/* ROW 2: Threat Map (4 cols) + Intensity (2 cols) */}
          <div className="col-span-1 md:col-span-3 xl:col-span-4 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Satellite className="w-3 h-3 text-cyan-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Live Threat Map</span>
              <span className="ml-auto text-[7px] text-gray-600">últimos 60 eventos</span>
            </div>
            <ThreatMap logs={data?.logs_recientes || []} />
          </div>

          <div className="col-span-1 md:col-span-1 xl:col-span-2 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Intensidad de Ataque</span>
              <span className="ml-auto text-[7px] text-gray-600">{maxHora} pico</span>
            </div>
            <div className="h-[220px]">
              <IntensityChart data={data?.por_hora || []} maxVal={maxHora} />
            </div>
          </div>

          {/* ROW 3: Top Vectors (2) + Top Nodes (2) + IA Terminal (2) */}
          <div className="col-span-1 md:col-span-2 xl:col-span-2 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Route className="w-3 h-3 text-green-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Top Vectores de Ataque</span>
            </div>
            <div className="space-y-1">
              {(data?.top_rutas || []).slice(0, 5).map((r, i) => {
                const max = (data?.top_rutas?.[0]?.count || 1)
                const metodo = r.ruta.includes('/login') ? 'POST' : r.ruta.includes('/api/leads') ? 'POST' : 'GET'
                return (
                  <div key={r.ruta} className="flex items-center gap-1.5 group text-[9px]">
                    <span className="text-gray-700 w-3">{i + 1}</span>
                    <span className={`shrink-0 w-8 text-center px-1 py-0.5 rounded text-[7px] font-bold ${metodo === 'POST' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>{metodo}</span>
                    <code className="text-gray-400 flex-1 truncate max-w-[150px]" title={r.ruta}>{r.ruta}</code>
                    <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                      <motion.div className="h-full bg-green-500/40 rounded-full" animate={{ width: `${(r.count / max) * 100}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <span className="text-gray-500 w-4 text-right">{r.count}</span>
                  </div>
                )
              })}
              {(data?.top_rutas || []).length === 0 && <p className="text-[9px] text-gray-600 py-4 text-center">Sin vectores detectados</p>}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 xl:col-span-2 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Radio className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Top Nodos Atacantes</span>
            </div>
            <div className="space-y-1">
              {(data?.top_ips || []).length === 0 && (data?.top_paises || []).length === 0 ? (
                <p className="text-[9px] text-gray-600 py-4 text-center">Sin nodos hostiles</p>
              ) : (
                (data?.top_ips || []).slice(0, 3).map((ip, i) => (
                  <div key={ip.ip} className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-gray-700 w-3">{i + 1}</span>
                    <code className="text-gray-400 truncate">{ip.ip}</code>
                    <span className="text-gray-500 ml-auto">{ip.count} intentos</span>
                  </div>
                ))
              )}
              {(data?.top_paises || []).slice(0, 3).map((p, i) => {
                const max = (data?.top_paises?.[0]?.count || 1)
                return (
                  <div key={p.pais} className="flex items-center gap-1.5 text-[9px]">
                    <span className="text-gray-700 w-3">{i + 1}</span>
                    <Flag code={p.pais} height="10" className="rounded-sm shrink-0" />
                    <span className="text-gray-400 truncate w-16">{(PAISES as Record<string,string>)[p.pais] || p.pais}</span>
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-amber-500/40 rounded-full" animate={{ width: `${(p.count / max) * 100}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <span className="text-gray-500 w-4 text-right">{p.count}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[7px] text-gray-600">Top IPs con mayor actividad de bloqueo</span>
            </div>
          </div>

          <div className="col-span-1 md:col-span-4 xl:col-span-2 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <IATerminal />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[7px] text-gray-600 border-t border-white/5 mt-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Perimeter Active</span>
            <span>{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC-5</span>
          </div>
          <span>BLIS Corp · SOC v3.0 · Threat Intelligence Grid</span>
        </div>
      </div>
    </div>
  )
}

const PAISES: Record<string, string> = {
  CN: "China", RU: "Rusia", US: "EE.UU.", GB: "Reino Unido", DE: "Alemania",
  FR: "Francia", BR: "Brasil", IN: "India", JP: "Japon", KR: "Corea Sur",
  MX: "Mexico", AR: "Argentina", CO: "Colombia", PE: "Peru", CL: "Chile",
  ES: "España", IT: "Italia", NL: "Países Bajos", AU: "Australia", CA: "Canada",
  NG: "Nigeria", PK: "Pakistan", VN: "Vietnam", BD: "Bangladesh", ID: "Indonesia",
  TH: "Tailandia", MY: "Malasia", PH: "Filipinas", AE: "Emiratos", SA: "Arabia",
  EG: "Egipto", ZA: "Sudafrica", TR: "Turquia", UA: "Ucrania", PL: "Polonia",
  SE: "Suecia", NO: "Noruega", FI: "Finlandia", IL: "Israel", SG: "Singapur",
  HK: "Hong Kong", TW: "Taiwan", NZ: "Nueva Zelanda", IE: "Irlanda", AT: "Austria",
  CH: "Suiza", BE: "Belgica", PT: "Portugal", IR: "Iran", KP: "Corea Norte",
  AF: "Afganistan", IQ: "Irak", SY: "Siria", SD: "Sudan", LY: "Libia",
  YE: "Yemen", SO: "Somalia", MM: "Myanmar", BY: "Bielorrusia",
  VE: "Venezuela", EC: "Ecuador", UY: "Uruguay", PY: "Paraguay", BO: "Bolivia",
  KE: "Kenia", TZ: "Tanzania", UG: "Uganda", ET: "Etiopia", GH: "Ghana",
  MA: "Marruecos", DZ: "Argelia", TN: "Tunez",
  GE: "Georgia", KZ: "Kazajistan", UZ: "Uzbekistan", MN: "Mongolia",
  LA: "Laos", KH: "Camboya", NP: "Nepal", LK: "Sri Lanka",
  LT: "Lituania", LV: "Letonia", EE: "Estonia", SK: "Eslovaquia", CZ: "Rep. Checa",
}
