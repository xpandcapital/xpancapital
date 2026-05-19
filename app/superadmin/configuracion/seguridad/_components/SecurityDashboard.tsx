"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield, ShieldCheck, Gauge as GaugeIcon, Bot, Bell, Globe, Route, Activity,
  Satellite, Eye, ChevronRight, RefreshCw, Crosshair, Cpu, Zap, ArrowUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import Flag from 'react-world-flags';
import Link from 'next/link';

const PAISES: Record<string, string> = {
  CN: "China", RU: "Rusia", KP: "Corea Norte", IR: "Iran", US: "EE.UU.",
  GB: "Reino Unido", DE: "Alemania", FR: "Francia", BR: "Brasil", IN: "India",
  JP: "Japon", KR: "Corea Sur", MX: "Mexico", AR: "Argentina", CO: "Colombia",
  PE: "Peru", CL: "Chile", ES: "España", IT: "Italia", NL: "Países Bajos",
  AU: "Australia", CA: "Canada", NG: "Nigeria", PK: "Pakistan", VN: "Vietnam",
  BD: "Bangladesh", ID: "Indonesia", TH: "Tailandia", MY: "Malasia", PH: "Filipinas",
  AE: "Emiratos", SA: "Arabia", EG: "Egipto", ZA: "Sudafrica", TR: "Turquia",
  UA: "Ucrania", PL: "Polonia", SE: "Suecia", NO: "Noruega", DK: "Dinamarca",
  FI: "Finlandia", IL: "Israel", SG: "Singapur", HK: "Hong Kong", TW: "Taiwan",
  NZ: "Nueva Zelanda", IE: "Irlanda", AT: "Austria", CH: "Suiza", BE: "Belgica",
  PT: "Portugal", CZ: "Rep. Checa", RO: "Rumania", HU: "Hungria", GR: "Grecia",
  VE: "Venezuela", EC: "Ecuador", UY: "Uruguay", PY: "Paraguay", BO: "Bolivia",
  CR: "Costa Rica", PA: "Panama", GT: "Guatemala", HN: "Honduras", SV: "El Salvador",
  NI: "Nicaragua", DO: "Rep. Dominicana", PR: "Puerto Rico", CU: "Cuba",
  KE: "Kenia", TZ: "Tanzania", UG: "Uganda", ET: "Etiopia", GH: "Ghana",
  MA: "Marruecos", DZ: "Argelia", TN: "Tunez",
  AF: "Afganistan", IQ: "Irak", SY: "Siria", SD: "Sudan", LY: "Libia",
  YE: "Yemen", SO: "Somalia", MM: "Myanmar", BY: "Bielorrusia",
  GE: "Georgia", KZ: "Kazajistan", UZ: "Uzbekistan", MN: "Mongolia",
  LA: "Laos", KH: "Camboya", NP: "Nepal", LK: "Sri Lanka",
};

type LogEntry = { pais: string; ruta: string; metodo: string; motivo: string; created_at: string }
type AlertEntry = { id: string; nivel: string; titulo: string; created_at: string; leida: boolean }
type PaisCount = { pais: string; count: number }
type RutaCount = { ruta: string; count: number }
type HoraCount = { hora: string; count: number }

interface DashboardData {
  total_bloqueos: number; paises_unicos: number; alertas_no_leidas: number
  herramientas_activas: number; herramientas: Record<string, boolean>
  top_paises: PaisCount[]; top_rutas: RutaCount[]; por_hora: HoraCount[]
  ultimos_logs: LogEntry[]; ultimas_alertas: AlertEntry[]; logs_recientes: LogEntry[]
}

function ThreatGauge({ pct, total }: { pct: number; total: number }) {
  const hue = 120 - (pct / 100) * 120
  const color = `hsl(${hue}, 70%, 50%)`
  const dashArray = (pct / 100) * 251
  return (
    <div className="relative w-16 h-16 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(39,39,42)" strokeWidth="6" />
        <motion.circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${dashArray} 251`}
          animate={{ strokeDasharray: `${dashArray} 251` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-white">{total}</span>
      </div>
    </div>
  )
}

function LiveRadar({ logs }: { logs: LogEntry[] }) {
  const entries = useMemo(() => {
    const acc: Record<string, PaisCount> = {}
    for (const l of logs.slice(0, 30)) {
      if (!acc[l.pais]) acc[l.pais] = { pais: l.pais, count: 0 }
      acc[l.pais].count++
    }
    return Object.values(acc).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [logs])
  if (entries.length === 0) return null
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="absolute inset-0 opacity-15">
        {[3,6,9,12,15,18,21,24].map(n => (
          <circle key={n} cx="100" cy="100" r={n * 4} fill="none" stroke="rgb(6,182,212)" strokeWidth="0.3" opacity={0.5 - n * 0.018} />
        ))}
      </svg>
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
        <div className="absolute top-1/2 left-1/2 w-px h-[45%] bg-gradient-to-t from-cyan-400/80 via-cyan-400/40 to-transparent" style={{ transform: 'translateY(-100%)', transformOrigin: 'bottom' }} />
      </motion.div>
      {entries.map((e, i) => {
        const angle = ((i * 45 + 15) % 360) * Math.PI / 180
        const dist = 28 + ((i * 7) % 35)
        return (
          <motion.div key={e.pais} className="absolute" style={{ left: `${50 + Math.cos(angle) * dist}%`, top: `${50 + Math.sin(angle) * dist}%` }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2 + i * 0.25, repeat: Infinity }}>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            <span className="absolute -top-3 left-1/2 text-[7px] text-cyan-400/80 font-mono whitespace-nowrap" style={{ transform: 'translateX(-50%)' }}>{e.pais}</span>
          </motion.div>
        )
      })}
      <Crosshair className="absolute w-3 h-3 text-cyan-400/20" />
    </div>
  )
}

function PulseChart({ data, maxVal }: { data: HoraCount[]; maxVal: number }) {
  const max = maxVal || 1
  const points = data.map((d, i) => {
    const x = (i / 23) * 100
    const y = 100 - (d.count / max) * 90
    return (i === 0 ? 'M' : 'L') + x + ',' + y
  }).join(' ')
  const areaPath = points + ' L100,100 L0,100 Z'
  return (
    <svg viewBox="0 0 101 101" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pdash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={areaPath} fill="url(#pdash)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} />
      <motion.path d={points} fill="none" stroke="#a855f7" strokeWidth="1.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
    </svg>
  )
}

function relativeTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'Ahora'
  if (s < 3600) return `Hace ${Math.floor(s / 60)}m`
  if (s < 86400) return `Hace ${Math.floor(s / 3600)}h`
  return `Hace ${Math.floor(s / 86400)}d`
}

const TOOLS = [
  { id: 'geobloqueo', icon: Shield, label: 'Geobloqueo' },
  { id: 'security_headers', icon: ShieldCheck, label: 'Headers' },
  { id: 'rate_limiting', icon: GaugeIcon, label: 'Rate' },
  { id: 'bot_protection', icon: Bot, label: 'Bot' },
  { id: 'alerts', icon: Bell, label: 'Alertas' },
] as const

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

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 60000); return () => clearInterval(i) }, [fetchData])

  if (!data && loading) return (
    <div className="flex items-center justify-center h-full">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
        <Cpu className="w-8 h-8 text-blis-red/50" />
      </motion.div>
    </div>
  )

  const maxHora = data?.por_hora?.reduce<number>((m, h) => Math.max(m, h.count), 0) || 1
  const pct = Math.min(100, Math.round(((data?.total_bloqueos || 0) / 100) * 100))

  const kpis = [
    { icon: Activity, color: 'text-red-400', bg: 'bg-red-500/5', label: 'Bloqueos', value: data?.total_bloqueos || 0, sub: 'total', isGauge: true },
    { icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/5', label: 'Origenes', value: data?.paises_unicos || 0, sub: 'paises unicos' },
    { icon: Bell, color: 'text-red-400', bg: 'bg-red-500/5', label: 'Sin leer', value: data?.alertas_no_leidas || 0, sub: 'alertas' },
    { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/5', label: 'Activas', value: `${data?.herramientas_activas || 0}/5`, sub: 'herramientas' },
    { icon: Bot, color: 'text-amber-400', bg: 'bg-amber-500/5', label: 'Escaneos', value: 0, sub: 'bots detectados' },
  ]

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header ultra-compacto */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blis-red/10 rounded-lg flex items-center justify-center">
            <Cpu className="w-4 h-4 text-blis-red" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-white">Command Center</h2>
            <p className="text-[10px] text-gray-500">Monitoreo de seguridad en tiempo real</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex bg-zinc-900 rounded-md p-0.5">
            {[1, 7, 30, 365].map(d => (
              <button key={d} onClick={() => setDias(d)}
                className={`px-2.5 py-0.5 text-[10px] rounded font-medium transition-colors ${dias === d ? 'bg-blis-red text-white' : 'text-gray-500 hover:text-white'}`}>
                {d === 365 ? 'Todo' : `${d}d`}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="p-1.5 bg-zinc-900 rounded-md text-gray-400 hover:text-white">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Row 1: KPIs con tool status integrados */}
        <div className="grid grid-cols-5 gap-3">
          {kpis.map((kpi, i) => {
            const tool = TOOLS[i]
            const active = tool ? data?.herramientas?.[tool.id] || false : false
            return (
              <Link key={i} href={tool ? `/superadmin/configuracion/seguridad?tool=${tool.id}` : '#'}
                className={`${kpi.bg} rounded-xl border border-white/5 p-3 relative group hover:border-white/10 transition-all`}>
                {/* Tool status dot */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-gray-600'}`} />
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <kpi.icon className={`w-3 h-3 ${kpi.color}`} />
                  <span className="text-[9px] text-gray-500 uppercase font-bold">{kpi.label}</span>
                </div>
                {kpi.isGauge ? (
                  <ThreatGauge pct={pct} total={kpi.value as number} />
                ) : (
                  <>
                    <span className={`text-xl font-black ${kpi.value === 0 ? 'text-gray-600' : 'text-white'}`}>{kpi.value}</span>
                    <p className="text-[9px] text-gray-600 mt-0.5">{kpi.sub}</p>
                  </>
                )}
                <div className="mt-1.5 flex items-center gap-1 text-[9px] text-gray-600 group-hover:text-blis-red/70 transition-colors">
                  <span className="truncate">{tool?.label}</span>
                  <ChevronRight className="w-2.5 h-2.5 shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Row 2: Radar 40% + Pulse 60% */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-5 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Satellite className="w-3 h-3 text-cyan-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Live Radar</span>
            </div>
            <div className="h-44">
              <LiveRadar logs={data?.logs_recientes || []} />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-7 bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Bloqueos por hora</span>
              <span className="ml-auto text-[8px] text-gray-600">{maxHora} pico</span>
            </div>
            <div className="h-44">
              <PulseChart data={data?.por_hora || []} maxVal={maxHora} />
            </div>
          </div>
        </div>

        {/* Row 3: Top Países + Top Rutas (compacto) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Top Países</span>
              <span className="ml-auto text-[8px] text-gray-600">{data?.top_paises?.length || 0} paises</span>
            </div>
            {(data?.top_paises || []).length === 0 ? (
              <p className="text-[10px] text-gray-600 text-center py-3">Sin datos</p>
            ) : (
              <div className="space-y-1">
                {(data?.top_paises || []).map((p, i) => {
                  const max = (data?.top_paises?.[0]?.count || 1)
                  return (
                    <div key={p.pais} className="flex items-center gap-2 group">
                      <span className="text-[9px] text-gray-600 w-3">{i + 1}</span>
                      <div className="w-4 h-3 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800">
                        <Flag code={p.pais} height="10" />
                      </div>
                      <span className="text-[10px] text-gray-300 w-16 truncate">{PAISES[p.pais] || p.pais}</span>
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-blue-500/60 rounded-full" animate={{ width: `${(p.count / max) * 100}%` }} transition={{ duration: 0.6 }} />
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold w-5 text-right">{p.count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Route className="w-3 h-3 text-green-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Top Rutas</span>
              <span className="ml-auto text-[8px] text-gray-600">{data?.top_rutas?.length || 0} rutas</span>
            </div>
            {(data?.top_rutas || []).length === 0 ? (
              <p className="text-[10px] text-gray-600 text-center py-3">Sin datos</p>
            ) : (
              <div className="space-y-1">
                {(data?.top_rutas || []).map((r, i) => {
                  const max = (data?.top_rutas?.[0]?.count || 1)
                  return (
                    <div key={r.ruta} className="flex items-center gap-2 group">
                      <span className="text-[9px] text-gray-600 w-3">{i + 1}</span>
                      <code className="text-[10px] text-gray-400 flex-1 truncate" title={r.ruta}>{r.ruta}</code>
                      <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                        <motion.div className="h-full bg-green-500/60 rounded-full" animate={{ width: `${(r.count / max) * 100}%` }} transition={{ duration: 0.6 }} />
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold w-5 text-right">{r.count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Ultimas detecciones + Alertas recientes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Eye className="w-3 h-3 text-purple-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Detecciones</span>
              <Link href="/superadmin/configuracion/seguridad?tool=access_logs"
                className="ml-auto text-[8px] text-blis-red/60 hover:text-blis-red flex items-center gap-0.5">
                Logs <ChevronRight className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              {(data?.ultimos_logs || []).length === 0 ? (
                <p className="text-[10px] text-gray-600 text-center py-4">Sin detecciones</p>
              ) : (
                (data?.ultimos_logs || []).slice(0, 8).map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-white/[0.03] text-[10px]">
                    <div className="w-4 h-2.5 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800">
                      <Flag code={l.pais} height="9" />
                    </div>
                    <code className="text-gray-400 truncate flex-1" title={l.ruta}>{l.ruta.split('/').pop() || l.ruta}</code>
                    <span className={`text-[8px] font-bold shrink-0 w-6 text-center ${l.motivo === 'geobloqueo' ? 'text-red-400' : 'text-blue-400'}`}>
                      {l.motivo === 'geobloqueo' ? 'BLK' : 'RTL'}
                    </span>
                    <span className="text-[8px] text-gray-600 w-14 text-right shrink-0">{relativeTime(l.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Bell className="w-3 h-3 text-red-400" />
              <span className="text-[9px] text-gray-500 uppercase font-bold">Alertas</span>
              <Link href="/superadmin/configuracion/seguridad?tool=alerts"
                className="ml-auto text-[8px] text-blis-red/60 hover:text-blis-red flex items-center gap-0.5">
                Ver <ChevronRight className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              {(data?.ultimas_alertas || []).length === 0 ? (
                <p className="text-[10px] text-gray-600 text-center py-4">Sin alertas</p>
              ) : (
                (data?.ultimas_alertas || []).map(a => (
                  <div key={a.id} className={`flex items-center gap-1.5 px-1.5 py-1 rounded text-[10px] ${a.leida ? '' : 'bg-red-500/3 border border-red-500/10'}`}>
                    <div className={`w-1 h-1 rounded-full shrink-0 ${a.nivel === 'critical' ? 'bg-red-400' : a.nivel === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                    <span className="text-gray-300 truncate flex-1">{a.titulo}</span>
                    <span className="text-[8px] text-gray-600 shrink-0">{relativeTime(a.created_at)}</span>
                    {!a.leida && <span className="text-[7px] text-red-400 font-bold shrink-0">NEW</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[8px] text-gray-600 border-t border-white/5 pt-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-400" /> Activo</span>
            <span>{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <span>BLIS Corp · v2.0</span>
        </div>
      </div>
    </div>
  )
}
