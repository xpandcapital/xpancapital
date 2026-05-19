"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldCheck, Gauge, Bot, Bell, Globe, Route, Zap, Activity,
  Satellite, Eye, AlertTriangle, ChevronRight, RefreshCw, Crosshair, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';
import Flag from 'react-world-flags';
import Link from 'next/link';

const PAISES: Record<string, string> = {
  CN: "China", RU: "Rusia", KP: "Corea Norte", IR: "Irán", SY: "Siria",
  SD: "Sudán", LY: "Libia", IQ: "Irak", AF: "Afganistán", SO: "Somalia",
  YE: "Yemen", MM: "Myanmar", BY: "Bielorrusia", PK: "Pakistán", BD: "Bangladesh",
  NG: "Nigeria", CU: "Cuba", VN: "Vietnam", US: "EE.UU.", GB: "Reino Unido",
  DE: "Alemania", FR: "Francia", BR: "Brasil", IN: "India", JP: "Japón",
  KR: "Corea Sur", ID: "Indonesia", MX: "México", AR: "Argentina", CO: "Colombia",
  PE: "Perú", CL: "Chile", ES: "España", IT: "Italia", NL: "Países Bajos",
  AE: "Emiratos Árabes", SA: "Arabia Saudí", EG: "Egipto", ZA: "Sudáfrica",
  AU: "Australia", CA: "Canadá", TH: "Tailandia", MY: "Malasia", PH: "Filipinas",
  VN: "Vietnam", TR: "Turquía", UA: "Ucrania", PL: "Polonia", SE: "Suecia",
  NO: "Noruega", DK: "Dinamarca", FI: "Finlandia", IL: "Israel", SG: "Singapur",
  HK: "Hong Kong", TW: "Taiwán", NZ: "Nueva Zelanda", IE: "Irlanda",
  AT: "Austria", CH: "Suiza", BE: "Bélgica", PT: "Portugal", CZ: "Rep. Checa",
  RO: "Rumanía", HU: "Hungría", GR: "Grecia", BG: "Bulgaria", HR: "Croacia",
  SK: "Eslovaquia", SI: "Eslovenia", EE: "Estonia", LV: "Letonia", LT: "Lituania",
  LU: "Luxemburgo", MT: "Malta", CY: "Chipre", IS: "Islandia", RS: "Serbia",
  AL: "Albania", MK: "Macedonia", BA: "Bosnia", ME: "Montenegro", MD: "Moldavia",
  GE: "Georgia", AM: "Armenia", AZ: "Azerbaiyán", KZ: "Kazajistán", UZ: "Uzbekistán",
  TM: "Turkmenistán", KG: "Kirguistán", TJ: "Tayikistán", MN: "Mongolia",
  LA: "Laos", KH: "Camboya", NP: "Nepal", LK: "Sri Lanka", BD: "Bangladesh",
  VE: "Venezuela", EC: "Ecuador", UY: "Uruguay", PY: "Paraguay", BO: "Bolivia",
  CR: "Costa Rica", PA: "Panamá", GT: "Guatemala", HN: "Honduras", SV: "El Salvador",
  NI: "Nicaragua", DO: "Rep. Dominicana", PR: "Puerto Rico", CU: "Cuba",
  JM: "Jamaica", TT: "Trinidad", HT: "Haití", BS: "Bahamas", BB: "Barbados",
  ZW: "Zimbabue", ZM: "Zambia", MZ: "Mozambique", AO: "Angola", KE: "Kenia",
  TZ: "Tanzania", UG: "Uganda", ET: "Etiopía", GH: "Ghana", CI: "Costa Marfil",
  SN: "Senegal", CM: "Camerún", MA: "Marruecos", DZ: "Argelia", TN: "Túnez",
  LY: "Libia", SD: "Sudán", SS: "Sudán Sur", CD: "Congo", CG: "Congo",
  NA: "Namibia", BW: "Botsuana", MG: "Madagascar", MU: "Mauricio", SC: "Seychelles",
};

const KNOWN_BOT_PATTERNS = ['wp-includes','wp-admin','wp-login','xmlrpc.php','.env','.git','phpmyadmin','shell.php','config.php','admin.php'];

interface DashboardData {
  total_bloqueos: number
  paises_unicos: number
  alertas_no_leidas: number
  herramientas_activas: number
  herramientas: Record<string, boolean>
  top_paises: Array<{ pais: string; count: number }>
  top_rutas: Array<{ ruta: string; count: number }>
  por_hora: Array<{ hora: string; count: number }>
  ultimos_logs: Array<{ pais: string; ruta: string; metodo: string; motivo: string; created_at: string }>
  ultimas_alertas: Array<{ id: string; nivel: string; titulo: string; created_at: string; leida: boolean }>
  logs_recientes: Array<{ pais: string; ruta: string; metodo: string; motivo: string; created_at: string }>
}

function ThreatGauge({ pct, total }: { pct: number; total: number }) {
  const hue = 120 - (pct / 100) * 120
  const color = `hsl(${hue}, 70%, 50%)`
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(39,39,42)" strokeWidth="4" />
        <motion.circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 251} 251`}
          animate={{ strokeDasharray: `${(pct / 100) * 251} 251` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white">{total}</span>
        <span className="text-[8px] text-gray-500">bloqueos</span>
      </div>
    </div>
  )
}

function LiveRadar({ logs }: { logs: DashboardData['logs_recientes'] }) {
  const topPaises = logs.slice(0, 20).reduce<Record<string, { count: number; pais: string }>>((acc, l) => {
    acc[l.pais] = { count: (acc[l.pais]?.count || 0) + 1, pais: l.pais }
    return acc
  }, {})
  const entries = Object.values(topPaises).sort((a, b) => b.count - a.count).slice(0, 10)
  if (entries.length === 0) return null

  return (
    <div className="relative w-full h-44 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-20">
        {[2,4,6,8,10,12,14,16,18,20].map(n => (
          <circle key={n} cx="100" cy="100" r={n * 4.5} fill="none" stroke="rgb(6,182,212)" strokeWidth="0.3" opacity={0.5 - n * 0.02} />
        ))}
      </svg>
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
        <div className="absolute top-1/2 left-1/2 w-[1px] h-[45%] bg-gradient-to-t from-cyan-400/80 via-cyan-400/40 to-transparent -translate-y-full origin-bottom" />
      </motion.div>
      {entries.map((e, i) => {
        const angle = ((i * 36 + 15) % 360) * Math.PI / 180
        const dist = 25 + Math.random() * 35
        const x = 50 + Math.cos(angle) * dist
        const y = 50 + Math.sin(angle) * dist
        return (
          <motion.div key={e.pais} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity }}>
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] text-cyan-400/80 font-mono">{e.pais}</span>
            </div>
          </motion.div>
        )
      })}
      <Crosshair className="absolute w-3 h-3 text-cyan-400/30" />
      <div className="absolute bottom-2 text-[9px] text-gray-600 font-mono">
        {entries.length} orígenes activos
      </div>
    </div>
  )
}

function PulseChart({ data, maxVal }: { data: Array<{ hora: string; count: number }>; maxVal: number }) {
  const max = maxVal || 1
  const points = data.map((d, i) => {
    const x = (i / 23) * 100
    const y = 100 - (d.count / max) * 90
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')
  const area = `${points} L100,100 L0,100 Z`

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pls" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
        <filter id="gl">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <motion.path d={area} fill="url(#pls)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.path d={points} fill="none" stroke="#a855f7" strokeWidth="1" filter="url(#gl)"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
    </svg>
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

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 60000); return () => clearInterval(i) }, [fetchData])

  if (!data && loading) return (
    <div className="flex items-center justify-center h-full">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
        <Cpu className="w-8 h-8 text-blis-red/50" />
      </motion.div>
    </div>
  )

  const maxHora = data?.por_hora?.reduce((m, h) => Math.max(m, h.count), 0) || 1
  const pct = Math.min(100, Math.round(((data?.total_bloqueos || 0) / 100) * 100))
  const botLogs = (data?.ultimos_logs || []).filter(l => KNOWN_BOT_PATTERNS.some(p => l.ruta.toLowerCase().includes(p)))
  const realLogs = (data?.ultimos_logs || []).filter(l => !KNOWN_BOT_PATTERNS.some(p => l.ruta.toLowerCase().includes(p)))

  const toolCards = [
    { id: 'geobloqueo', icon: Shield, label: 'Geobloqueo', desc: 'Control de acceso por país' },
    { id: 'security_headers', icon: ShieldCheck, label: 'Security Headers', desc: 'Cabeceras HTTP de seguridad' },
    { id: 'rate_limiting', icon: Gauge, label: 'Rate Limiting', desc: 'Límite de peticiones por IP' },
    { id: 'bot_protection', icon: Bot, label: 'Bot Protection', desc: 'CAPTCHA invisible Turnstile' },
    { id: 'alerts', icon: Bell, label: 'Alertas', desc: 'Detección de amenazas' },
  ]

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <motion.div className="w-10 h-10 bg-blis-red/10 rounded-xl flex items-center justify-center"
            animate={{ boxShadow: ['0 0 0px #ef4444', '0 0 12px #ef4444', '0 0 0px #ef4444'] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <Cpu className="w-5 h-5 text-blis-red" />
          </motion.div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Security Command Center</h2>
            <p className="text-xs text-gray-500">Centro de monitoreo de seguridad en tiempo real</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex bg-zinc-900 rounded-lg p-0.5">
              {[1, 7, 30, 365].map(d => (
                <button key={d} onClick={() => setDias(d)}
                  className={`px-3 py-1 text-[10px] rounded-md font-medium transition-colors ${dias === d ? 'bg-blis-red text-white' : 'text-gray-500 hover:text-white'}`}>
                  {d === 365 ? 'Siempre' : `${d}d`}
                </button>
              ))}
            </div>
            <button onClick={fetchData} className="p-2 bg-zinc-900 rounded-lg text-gray-400 hover:text-white">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Row 1: Gauge + KPIs */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4 flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-3">
              <Activity className="w-3 h-3 text-red-400" />
              <span className="text-[10px] text-gray-500 uppercase font-bold">Amenaza</span>
            </div>
            <ThreatGauge pct={pct} total={data?.total_bloqueos || 0} />
          </div>
          {[
            { icon: Globe, color: 'text-blue-400', label: 'Países', value: data?.paises_unicos || 0, sub: 'orígenes únicos' },
            { icon: Bell, color: 'text-red-400', label: 'Alertas', value: data?.alertas_no_leidas || 0, sub: 'sin leer' },
            { icon: Shield, color: 'text-emerald-400', label: 'Herramientas', value: `${data?.herramientas_activas || 0}/5`, sub: 'activas' },
            { icon: Bot, color: 'text-amber-400', label: 'Bots', value: botLogs.length, sub: 'escaneos detectados' },
          ].map((kpi, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-3">
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                <span className="text-[10px] text-gray-500 uppercase font-bold">{kpi.label}</span>
              </div>
              <span className="text-2xl font-black text-white">{kpi.value}</span>
              <p className="text-[10px] text-gray-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Row 2: Radar + Pulse Chart */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Satellite className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] text-gray-500 uppercase font-bold">Live Radar</span>
              <span className="ml-auto text-[9px] text-gray-600">últimos 60 eventos</span>
            </div>
            <LiveRadar logs={data?.logs_recientes || []} />
          </div>
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] text-gray-500 uppercase font-bold">Bloqueos por hora</span>
              <span className="ml-auto text-[9px] text-gray-600">{maxHora} pico</span>
            </div>
            <div className="h-44">
              <PulseChart data={data?.por_hora || []} maxVal={maxHora} />
            </div>
          </div>
        </div>

        {/* Row 3: Top Paises + Top Rutas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] text-gray-500 uppercase font-bold">Top Países</span>
            </div>
            {(data?.top_paises || []).length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-6">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {(data?.top_paises || []).map((p, i) => {
                  const max = (data?.top_paises?.[0]?.count || 1)
                  return (
                    <div key={p.pais} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-600 w-4">{i + 1}</span>
                      <div className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800">
                        <Flag code={p.pais} height="12" />
                      </div>
                      <span className="text-[11px] text-white flex-1">{PAISES[p.pais] || p.pais}</span>
                      <span className="text-[11px] text-gray-400 font-bold">{p.count}</span>
                      <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-blue-500/60 rounded-full" animate={{ width: `${(p.count / max) * 100}%` }} transition={{ duration: 0.6 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Route className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-gray-500 uppercase font-bold">Top Rutas</span>
            </div>
            {(data?.top_rutas || []).length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-6">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {(data?.top_rutas || []).map((r, i) => {
                  const max = (data?.top_rutas?.[0]?.count || 1)
                  return (
                    <div key={r.ruta} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-600 w-4">{i + 1}</span>
                      <code className="text-[11px] text-gray-300 flex-1 truncate">{r.ruta}</code>
                      <span className="text-[11px] text-gray-400 font-bold">{r.count}</span>
                      <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-green-500/60 rounded-full" animate={{ width: `${(r.count / max) * 100}%` }} transition={{ duration: 0.6 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Herramientas */}
        <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-gray-500 uppercase font-bold">Estado de herramientas</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {toolCards.map(tc => {
              const active = data?.herramientas?.[tc.id] || false
              return (
                <Link key={tc.id} href={`/superadmin/configuracion/seguridad?tool=${tc.id}`}
                  className={`rounded-xl border p-3 transition-colors group ${active ? 'bg-emerald-500/3 border-emerald-500/10 hover:bg-emerald-500/8' : 'bg-zinc-800 border-white/5 hover:bg-zinc-700/50 opacity-60'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <tc.icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-gray-500'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-gray-600'}`} />
                  </div>
                  <p className="text-[11px] font-bold text-white">{tc.label}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{tc.desc}</p>
                  <div className="flex items-center gap-1 mt-2 text-[9px] text-blis-red/60 group-hover:text-blis-red transition-colors">
                    Configurar <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Row 5: Últimos logs + Alertas recientes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Eye className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] text-gray-500 uppercase font-bold">Últimas detecciones</span>
              <Link href="/superadmin/configuracion/seguridad?tool=access_logs"
                className="ml-auto text-[9px] text-blis-red/60 hover:text-blis-red flex items-center gap-0.5">
                Ver logs <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {realLogs.length === 0 && botLogs.length === 0 && <p className="text-xs text-gray-600 text-center py-6">Sin detecciones</p>}
              {realLogs.slice(0, 8).map((l, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.02]">
                  <div className="w-5 h-3.5 rounded-sm overflow-hidden shrink-0 flex items-center justify-center bg-zinc-800">
                    <Flag code={l.pais} height="12" />
                  </div>
                  <span className="text-[11px] text-white">{PAISES[l.pais] || l.pais}</span>
                  <code className="text-[10px] text-gray-500 truncate flex-1">{l.ruta}</code>
                  <span className={`text-[9px] font-bold ${l.motivo === 'geobloqueo' ? 'text-red-400' : 'text-blue-400'}`}>
                    {l.motivo === 'geobloqueo' ? 'BLK' : 'RTL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Bell className="w-3 h-3 text-red-400" />
              <span className="text-[10px] text-gray-500 uppercase font-bold">Alertas recientes</span>
              <Link href="/superadmin/configuracion/seguridad?tool=alerts"
                className="ml-auto text-[9px] text-blis-red/60 hover:text-blis-red flex items-center gap-0.5">
                Ver alertas <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {(data?.ultimas_alertas || []).length === 0 && <p className="text-xs text-gray-600 text-center py-6">Sin alertas</p>}
              {(data?.ultimas_alertas || []).map(a => (
                <div key={a.id} className={`flex items-center gap-2 px-2 py-1.5 rounded ${a.leida ? '' : 'bg-red-500/3 border border-red-500/10'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.nivel === 'critical' ? 'bg-red-400' : a.nivel === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <span className="text-[11px] text-white truncate flex-1">{a.titulo}</span>
                  <span className="text-[9px] text-gray-600">
                    {a.created_at ? new Date(a.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {!a.leida && <span className="text-[8px] text-red-400 font-bold">NEW</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer status */}
        <div className="flex items-center justify-between text-[9px] text-gray-600 border-t border-white/5 pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Sistema activo</div>
            <span>Actualizado {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <span>BLIS Corp Security Command Center v2.0</span>
        </div>
      </div>
    </div>
  )
}
