"use client";

import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldCheck, Gauge as GaugeIcon, Globe, Bell, Bot, Route, ChevronRight, RefreshCw, Cpu, Eye, Satellite, Activity, Zap } from 'lucide-react';
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
  JM: "Jamaica", TT: "Trinidad", HT: "Haiti",
  KE: "Kenia", TZ: "Tanzania", UG: "Uganda", ET: "Etiopia", GH: "Ghana",
  MA: "Marruecos", DZ: "Argelia", TN: "Tunez",
  NA: "Namibia", BW: "Botsuana", MG: "Madagascar", MU: "Mauricio",
  AF: "Afganistan", IQ: "Irak", SY: "Siria", SD: "Sudan", LY: "Libia",
  YE: "Yemen", SO: "Somalia", MM: "Myanmar", BY: "Bielorrusia",
  AL: "Albania", MK: "Macedonia", BA: "Bosnia", ME: "Montenegro", RS: "Serbia",
  GE: "Georgia", AM: "Armenia", AZ: "Azerbaiyan", KZ: "Kazajistan", UZ: "Uzbekistan",
  TM: "Turkmenistan", KG: "Kirguistan", TJ: "Tayikistan", MN: "Mongolia",
  LA: "Laos", KH: "Camboya", NP: "Nepal", LK: "Sri Lanka",
};

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

  const maxHora = data?.por_hora?.reduce((m: number, h: { count: number }) => Math.max(m, h.count), 0) || 1
  const toolCards = [
    { id: 'geobloqueo', icon: Shield, label: 'Geobloqueo', desc: 'Control de acceso por pais' },
    { id: 'security_headers', icon: ShieldCheck, label: 'Security Headers', desc: 'Cabeceras HTTP de seguridad' },
    { id: 'rate_limiting', icon: GaugeIcon, label: 'Rate Limiting', desc: 'Limite de peticiones por IP' },
    { id: 'bot_protection', icon: Bot, label: 'Bot Protection', desc: 'CAPTCHA invisible Turnstile' },
    { id: 'alerts', icon: Bell, label: 'Alertas', desc: 'Deteccion de amenazas' },
  ]

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blis-red/10 rounded-xl flex items-center justify-center">
            <Cpu className="w-5 h-5 text-blis-red" />
          </div>
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
        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4 flex flex-col items-center">
            <Activity className="w-3 h-3 text-red-400 mb-2" />
            <span className="text-2xl font-black text-white">{data?.total_bloqueos || 0}</span>
            <span className="text-[9px] text-gray-500">bloqueos</span>
          </div>
          {[
            { icon: Globe, color: 'text-blue-400', label: 'Paises', value: data?.paises_unicos || 0, sub: 'origenes unicos' },
            { icon: Bell, color: 'text-red-400', label: 'Alertas', value: data?.alertas_no_leidas || 0, sub: 'sin leer' },
            { icon: Shield, color: 'text-emerald-400', label: 'Herramientas', value: `${data?.herramientas_activas || 0}/5`, sub: 'activas' },
            { icon: Bot, color: 'text-amber-400', label: 'Bots', value: 0, sub: 'escaneos detectados' },
          ].map((kpi, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl border border-white/5 p-4">
              <kpi.icon className={`w-3.5 h-3.5 ${kpi.color} mb-2`} />
              <span className="text-2xl font-black text-white">{kpi.value}</span>
              <p className="text-[9px] text-gray-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Top Paises + Top Rutas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Globe className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] text-gray-500 uppercase font-bold">Top Paises</span>
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

        {/* Herramientas */}
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
                  <tc.icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-gray-500'} mb-2`} />
                  <div className={`w-1.5 h-1.5 rounded-full mb-2 ${active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
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

        {/* Footer */}
        <div className="flex items-center justify-between text-[9px] text-gray-600 border-t border-white/5 pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Sistema activo</span>
            <span>Actualizado {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <span>BLIS Corp Security Command Center v2.0</span>
        </div>
      </div>
    </div>
  )
}
