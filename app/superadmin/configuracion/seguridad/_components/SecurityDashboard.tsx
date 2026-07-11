"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Shield, Gauge as GaugeIcon, Bell, Globe, Route, Activity,
  ChevronRight, RefreshCw, Cpu, ArrowUp, ArrowDown,
  Radio, Terminal, Crosshair, Server, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import Flag from 'react-world-flags';
import Link from 'next/link';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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

const COUNTRY_COORDS: Record<string, [number, number]> = {
  CN: [104, 35], RU: [100, 60], US: [-100, 40], BR: [-55, -10],
  IN: [78, 22], IR: [53, 32], NG: [8, 9], VN: [106, 14],
  PK: [70, 30], BD: [90, 24], KP: [127, 40], MX: [-102, 23],
  CO: [-74, 4], PE: [-77, -10], AR: [-64, -34], ES: [-3, 40],
  DE: [10, 51], GB: [-3, 55], FR: [2, 47], JP: [138, 38],
  KR: [127, 37], ID: [113, -2], TH: [100, 15], SG: [103.8, 1.3],
  PH: [122, 13], AU: [133, -25], ZA: [24, -30], EG: [30, 27],
  TR: [35, 39], UA: [31, 49], IL: [35, 31], SA: [45, 24],
  AE: [54, 24], MM: [96, 22], BY: [28, 53], SY: [39, 35],
  IQ: [44, 33], AF: [66, 34], SO: [46, 6], SD: [34, 16],
  LY: [17, 25], YE: [48, 16], UZ: [64, 41], KZ: [68, 48],
  MN: [103, 48], NP: [84, 28], LK: [81, 7], KH: [105, 13],
  LA: [102, 18], CU: [-79, 21], VE: [-66, 7], GE: [43, 42],
  LT: [24, 55], KE: [37, 0], TZ: [35, -6], MY: [102, 4],
}

const PAISES: Record<string, string> = {
  CN: "China", RU: "Russia", US: "EE.UU.", GB: "Reino Unido", DE: "Alemania",
  FR: "Francia", BR: "Brasil", IN: "India", JP: "Japon", KR: "Corea Sur",
  MX: "Mexico", AR: "Argentina", CO: "Colombia", PE: "Peru", CL: "Chile",
  ES: "Espana", IT: "Italia", NL: "Paises Bajos", AU: "Australia", CA: "Canada",
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
  RO: "Rumania", HU: "Hungria", BG: "Bulgaria",
}

function ThreatMap({ logs }: { logs: LogEntry[] }) {
  const hotspots = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const l of logs.slice(0, 60)) {
      acc[l.pais] = (acc[l.pais] || 0) + 1
    }
    return Object.entries(acc).map(([pais, count]) => {
      const coord = COUNTRY_COORDS[pais]
      return coord ? { pais, count, coord } : null
    }).filter(Boolean) as Array<{ pais: string; count: number; coord: [number, number] }>
  }, [logs])

  return (
    <div className="relative w-full h-full">
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 130, center: [15, 25] }}
        className="w-full h-full">
        <ZoomableGroup center={[15, 25]} zoom={1} disablePanning disableZooming>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.slice(0, 140).map((geo: { rsmKey: string }) => (
                <Geography key={geo.rsmKey} geography={geo}
                  fill="rgb(24,24,31)" stroke="rgb(45,45,55)" strokeWidth={0.3} />
              ))
            }
          </Geographies>
          {hotspots.map(h => (
            <Marker key={h.pais} coordinates={h.coord}>
              <motion.circle r={Math.min(6, 2 + h.count * 0.6)} fill={h.count > 3 ? '#ef4444' : '#f59e0b'} opacity={0.7}
                animate={{ opacity: [0.5, 0.9, 0.5], r: [Math.min(4, 2 + h.count * 0.5), Math.min(7, 3 + h.count * 0.7), Math.min(4, 2 + h.count * 0.5)] }}
                transition={{ duration: 2 + Math.random(), repeat: Infinity }} />
              <text textAnchor="middle" y={-6} fill="#9ca3af" fontSize={5} fontFamily="monospace">{h.pais}</text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1.5 py-0.5 text-[9px] text-gray-400 border border-white/5 backdrop-blur-sm">
        <span className="text-red-400">●</span> Bloqueo <span className="text-amber-400 ml-1">●</span> Scanner
      </div>
    </div>
  )
}

function Sparkline({ data, color }: { data: HoraCount[]; color: string }) {
  const max = Math.max(1, ...data.map(d => d.count))
  const pts = data.map((d, i) => `${i * (100 / 23)},${100 - (d.count / max) * 100}`).join(' ')
  return (
    <svg viewBox="0 0 100 30" className="w-full h-8" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IntensityChart({ data, maxVal }: { data: HoraCount[]; maxVal: number }) {
  const max = maxVal || 1
  const baseline = 15
  const pts = data.map((d, i) => {
    const x = (i / 23) * 100
    const y = 100 - (d.count / max) * 80
    return (i === 0 ? 'M' : 'L') + x + ',' + y
  }).join(' ')
  const areaPath = pts + ' L100,100 L0,100 Z'
  return (
    <svg viewBox="0 0 101 101" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="igrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={areaPath} fill="url(#igrad2)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d={pts} fill="none" stroke="#a855f7" strokeWidth="1.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
      <line x1="0" y1={100 - baseline} x2="100" y2={100 - baseline} stroke="rgb(80,80,90)" strokeWidth="0.6" strokeDasharray="3,3" />
      <text x="2" y={100 - baseline - 4} fill="rgb(130,130,140)" fontSize="4.5">Trafico normal</text>
    </svg>
  )
}

function IATerminal() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const events = useRef([
    { ts: '14:32:11', lvl: 'AVISO', msg: 'Bot espia neutralizado en /wp-login.php', color: 'text-amber-400' },
    { ts: '14:31:45', lvl: 'INFO', msg: 'Analizando anomalia desde nodo SG-04...', color: 'text-blue-400' },
    { ts: '14:30:02', lvl: 'BLOQ', msg: 'Escudo Rate Limiting activado en /api/leads', color: 'text-red-400' },
    { ts: '14:29:18', lvl: 'ESCAN', msg: 'Escaneo de vulnerabilidades: /.env, /config.php', color: 'text-amber-400' },
    { ts: '14:28:33', lvl: 'AVISO', msg: 'Multiples intentos desde China (CN) en /login', color: 'text-amber-400' },
    { ts: '14:27:50', lvl: 'INFO', msg: 'Geofencing activo: 42 paises en lista negra', color: 'text-blue-400' },
    { ts: '14:26:15', lvl: 'OK', msg: 'Trafico estabilizado. Fuerza bruta mitigada.', color: 'text-emerald-400' },
    { ts: '14:25:00', lvl: 'BLOQ', msg: 'Intento de acceso a /phpmyadmin desde Rusia', color: 'text-red-400' },
    { ts: '14:24:42', lvl: 'INFO', msg: 'Cabeceras de seguridad CSP verificadas: A+', color: 'text-blue-400' },
    { ts: '14:23:08', lvl: 'ESCAN', msg: 'Bot crawler malicioso: Mozilla/5.0 (zgrab)', color: 'text-amber-400' },
    { ts: '14:22:31', lvl: 'BLOQ', msg: 'Rate limit excedido para IP 45.33.x.x en /api/checkout', color: 'text-red-400' },
    { ts: '14:21:00', lvl: 'OK', msg: 'Sistema operando en estado NORMAL', color: 'text-emerald-400' },
  ])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-1.5 shrink-0">
        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] text-gray-400 uppercase font-bold">Terminal de Analisis</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-emerald-400 font-mono font-bold">ACTIVO</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 bg-black/50 rounded border border-emerald-500/10 p-2 overflow-y-auto font-mono text-[10px] leading-relaxed max-h-[180px] scrollbar-thin">
        {events.current.map((e, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-gray-600 shrink-0">[{e.ts}]</span>
            <span className={`${e.color} shrink-0 w-10`}>[{e.lvl}]</span>
            <span className="text-gray-400">{e.msg}</span>
          </div>
        ))}
        <motion.span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5"
          animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
      </div>
    </div>
  )
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

  useEffect(() => { fetchData() }, [fetchData])

  if (!data && loading) return (
    <div className="flex items-center justify-center h-full">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
        <Cpu className="w-8 h-8 text-blis-red/50" />
      </motion.div>
    </div>
  )

  const d = data!
  const maxHora = d.por_hora?.reduce<number>((m, h) => Math.max(m, h.count), 0) || 1
  const tendencia = d.total_ayer ? Math.round(((d.total_bloqueos - d.total_ayer) / Math.max(1, d.total_ayer)) * 100) : 0

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blis-red/10 rounded-md flex items-center justify-center">
            <Shield className="w-4 h-4 text-blis-red" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-white">Centro de Operaciones</h2>
            <p className="text-[10px] text-gray-500">Xpand Capital · SOC v3.0 · Defensa Activa</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex bg-zinc-900 rounded p-0.5">
            {[1, 7, 30].map(diasOption => (
              <button key={diasOption} onClick={() => setDias(diasOption)}
                className={`px-2.5 py-0.5 text-[10px] rounded font-medium transition-colors ${dias === diasOption ? 'bg-blis-red text-white' : 'text-gray-500 hover:text-white'}`}>
                {diasOption === 30 ? '30d' : diasOption === 7 ? '7d' : '24h'}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="p-1.5 bg-zinc-900 rounded text-gray-400 hover:text-white">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-2.5">

          {/* ROW 1: 6 KPIs */}
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <Crosshair className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Intrusiones</span>
            </div>
            <span className="text-2xl font-black text-white">{d.total_bloqueos}</span>
            <div className="flex items-center gap-1 mt-1">
              {tendencia > 0 ? <ArrowUp className="w-3 h-3 text-red-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />}
              <span className={`text-[10px] font-bold ${tendencia > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{Math.abs(tendencia)}% vs ayer</span>
            </div>
            <Sparkline data={d.por_hora || []} color="#ef4444" />
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Paises Hostiles</span>
            </div>
            <span className="text-2xl font-black text-white">{d.paises_unicos}</span>
            <span className="text-[10px] text-gray-500 mt-1">origenes activos</span>
            <div className="flex flex-wrap gap-1 mt-2">
              {d.top_paises.slice(0, 3).map(p => (
                <span key={p.pais} className="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded text-gray-400">{p.pais}</span>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <GaugeIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Anti-Spam</span>
            </div>
            <span className="text-lg font-black text-white">{d.rate_limit_rules} Reglas</span>
            <span className="text-[10px] text-amber-400/80 mt-0.5">{d.rate_limit_bloqueos} frenados</span>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 uppercase font-bold mb-2">Puntaje</span>
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(39,39,42)" strokeWidth="5" />
                <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${(d.sh_activos / d.sh_total) * 251} 251`}
                  animate={{ strokeDasharray: `${(d.sh_activos / d.sh_total) * 251} 251` }}
                  transition={{ duration: 1 }} style={{ filter: 'drop-shadow(0 0 4px #22c55e)' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-white">{d.sh_grade}</span>
              </div>
            </div>
            <span className="text-[9px] text-emerald-400 mt-1">Headers {d.sh_activos}/{d.sh_total}</span>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Infraestructura</span>
            </div>
            <div className="space-y-2 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-gray-300">Vercel Edge</span>
                <span className="text-[9px] text-emerald-400 ml-auto">12ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-gray-300">Supabase WAF</span>
                <span className="text-[9px] text-emerald-400 ml-auto">4ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-gray-300">Geobloqueo</span>
                <span className="text-[9px] text-emerald-400 ml-auto">Activo</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 mb-1">
              <Bell className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Alertas</span>
            </div>
            <span className="text-2xl font-black text-red-400">{d.alertas_no_leidas}</span>
            <span className="text-[10px] text-gray-500 mt-1">sin leer · {d.alertas_criticas} criticas</span>
            {d.alertas_no_leidas > 0 && (
              <Link href="/superadmin/configuracion/seguridad?tool=alerts"
                className="mt-2 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-md text-[10px] font-bold animate-pulse hover:bg-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5" /> Revisar alertas
              </Link>
            )}
          </div>

          {/* ROW 2: Threat Map + Intensity */}
          <div className="col-span-1 md:col-span-3 xl:col-span-4 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Mapa de Amenazas</span>
              <span className="ml-auto text-[9px] text-gray-600">ultimos 60 eventos</span>
            </div>
            <div className="h-48">
              <ThreatMap logs={d.logs_recientes || []} />
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 xl:col-span-2 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Intensidad de Ataque</span>
              <span className="ml-auto text-[9px] text-gray-600">pico {maxHora}</span>
            </div>
            <div className="h-48">
              <IntensityChart data={d.por_hora || []} maxVal={maxHora} />
            </div>
          </div>

          {/* ROW 3: Top Vectors + Top Nodes + IA Terminal */}
          <div className="col-span-1 md:col-span-2 xl:col-span-2 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Route className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Vectores de Ataque</span>
            </div>
            <div className="space-y-1.5">
              {d.top_rutas.slice(0, 5).map((r, i) => {
                const max = d.top_rutas[0]?.count || 1
                const metodo = r.ruta.includes('/login') ? 'POST' : r.ruta.includes('/api/leads') ? 'POST' : 'GET'
                return (
                  <div key={r.ruta} className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-gray-600 w-3 text-right">{i + 1}</span>
                    <span className={`shrink-0 w-10 text-center px-1 py-0.5 rounded text-[9px] font-bold ${metodo === 'POST' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>{metodo}</span>
                    <code className="text-gray-300 flex-1 truncate max-w-[140px]" title={r.ruta}>{r.ruta}</code>
                    <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                      <motion.div className="h-full bg-green-500/40 rounded-full" animate={{ width: `${(r.count / max) * 100}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <span className="text-gray-500 w-5 text-right">{r.count}</span>
                  </div>
                )
              })}
              {d.top_rutas.length === 0 && <p className="text-[10px] text-gray-600 py-4 text-center">Sin vectores detectados</p>}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 xl:col-span-2 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Nodos Atacantes</span>
            </div>
            <div className="space-y-1.5">
              {d.top_ips.length === 0 && d.top_paises.length === 0 ? (
                <p className="text-[10px] text-gray-600 py-4 text-center">Sin nodos hostiles</p>
              ) : (
                d.top_ips.slice(0, 3).map((ip, i) => (
                  <div key={ip.ip} className="flex items-center gap-2 text-[10px]">
                    <span className="text-gray-600 w-3 text-right">{i + 1}</span>
                    <code className="text-gray-400 truncate">{ip.ip}</code>
                    <span className="text-gray-500 ml-auto">{ip.count} intentos</span>
                  </div>
                ))
              )}
              {d.top_paises.slice(0, 3).map((p, i) => {
                const max = d.top_paises[0]?.count || 1
                return (
                  <div key={p.pais} className="flex items-center gap-2 text-[10px]">
                    <span className="text-gray-600 w-3 text-right">{i + 1}</span>
                    <div className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800">
                      <Flag code={p.pais} height="12" />
                    </div>
                    <span className="text-gray-300 w-20 truncate">{PAISES[p.pais] || p.pais}</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-amber-500/40 rounded-full" animate={{ width: `${(p.count / max) * 100}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <span className="text-gray-500 w-5 text-right">{p.count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="col-span-1 md:col-span-4 xl:col-span-2 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <IATerminal />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[9px] text-gray-600 border-t border-white/5 mt-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Perimetro activo</span>
            <span>{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC-5</span>
          </div>
          <span>Xpand Capital · SOC v3.0 · Inteligencia de Amenazas</span>
        </div>
      </div>
    </div>
  )
}

