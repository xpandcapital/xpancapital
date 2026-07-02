"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Award, Flame, Trophy, BookOpen, MessageCircle, FileText, Loader2, History } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useGamificacionStats, usePuntosHistorial } from "@/lib/hooks/useGamificacion"
import Link from "next/link"

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function MiGamificacion() {
  const { user } = useAuth()
  const { stats, loading } = useGamificacionStats(user?.id)
  const { puntos: historial } = usePuntosHistorial(user?.id)
  const [showHistorico, setShowHistorico] = useState(false)
  const [historico, setHistorico] = useState<any[]>([])

  const fetchHistorico = async () => {
    if (historico.length > 0) { setShowHistorico(!showHistorico); return }
    try {
      const res = await fetch(`/api/gamificacion/historico?user_id=${user?.id}`)
      const json = await res.json()
      if (json.success) setHistorico(json.data || [])
      setShowHistorico(!showHistorico)
    } catch {}
  }

  if (loading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#ff1e56] animate-spin" /></div>
  }

  if (!stats) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><p className="text-gray-400">Sin datos de gamificación</p></div>
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Mi Progreso</h1>
          <p className="text-gray-500 mt-1">Puntos, nivel y logros</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={item} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <TrendingUp className="w-5 h-5 text-[#ff1e56] mb-2" />
            <p className="text-2xl font-bold text-white">{stats.puntos.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total</p>
          </motion.div>
          <motion.div variants={item} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <Award className="w-5 h-5 mb-2" style={{ color: stats.nivelColor }} />
            <p className="text-2xl font-bold text-white">{stats.nivelNombre}</p>
            <p className="text-xs text-gray-500">por {stats.puntos_cursos.toLocaleString()} pts cursos</p>
          </motion.div>
          <motion.div variants={item} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <Flame className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.rachaDias}</p>
            <p className="text-xs text-gray-500">días de racha</p>
          </motion.div>
          <motion.div variants={item} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <Trophy className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.rankingPosicion ? `#${stats.rankingPosicion}` : '---'}</p>
            <p className="text-xs text-gray-500">de {stats.rankingTotal}</p>
          </motion.div>
        </div>

        {/* Breakdown por categoría */}
        <div className="space-y-4">
          <CategoriaBarra label="Cursos" icon={BookOpen} puntos={stats.puntos_cursos} total={stats.puntos} color="#ff1e56" permanente />
          <CategoriaBarra label="Comunidad" icon={MessageCircle} puntos={stats.puntos_comunidad} total={stats.puntos} color="#8b5cf6" />
          <CategoriaBarra label="Blog" icon={FileText} puntos={stats.puntos_blog} total={stats.puntos} color="#06b6d4" />
        </div>

        {/* Progreso de nivel (solo cursos) */}
        <motion.div variants={item} className="bg-gray-900/60 border border-gray-800 rounded-lg p-6">
          <p className="text-sm text-gray-400 mb-3">Progreso al siguiente nivel ({stats.nivelNombre} →)</p>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${stats.progresoNivelPct}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: stats.nivelColor }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.puntosParaSiguienteNivel > 0 ? `Faltan ${stats.puntosParaSiguienteNivel.toLocaleString()} pts en cursos` : 'Nivel máximo en cursos'}
          </p>
        </motion.div>

        {/* Logros */}
        <motion.div variants={item}>
          <h2 className="text-lg font-semibold text-white mb-4">Logros ({stats.logrosDesbloqueados.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.logrosDesbloqueados.length === 0 ? (
              <p className="text-gray-500 text-sm col-span-full">Aún no tienes logros</p>
            ) : stats.logrosDesbloqueados.map((lu: any) => (
              <div key={lu.id} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                <p className="text-white text-sm font-medium">{lu.logro?.nombre}</p>
                <p className="text-gray-500 text-xs">{lu.logro?.descripcion}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Historial */}
        <motion.div variants={item}>
          <div className="flex gap-4 mb-3">
            <button onClick={() => setShowHistorico(false)} className={`text-sm font-medium ${!showHistorico ? 'text-[#ff1e56]' : 'text-gray-500'}`}>Reciente</button>
            <button onClick={fetchHistorico} className={`text-sm font-medium flex items-center gap-1 ${showHistorico ? 'text-[#ff1e56]' : 'text-gray-500'}`}><History className="w-4 h-4" />Histórico</button>
          </div>

          {showHistorico ? (
            <div className="space-y-2">
              {historico.map((h: any) => (
                <div key={h.periodo} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 flex justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{h.periodo}</p>
                    <p className="text-gray-500 text-xs">#{h.ranking_global || '---'} en ranking</p>
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <p className="text-[#ff1e56]">Cursos: +{h.puntos_cursos}</p>
                    <p className="text-purple-400">Comunidad: +{h.puntos_comunidad}</p>
                    <p className="text-cyan-400">Blog: +{h.puntos_blog}</p>
                  </div>
                </div>
              ))}
              {historico.length === 0 && <p className="text-gray-500 text-sm">Sin histórico aún</p>}
            </div>
          ) : (
            <div className="space-y-1">
              {historial.slice(0, 15).map(p => (
                <div key={p.id} className="flex justify-between bg-gray-900/40 border border-gray-800/50 rounded-lg px-4 py-2">
                  <span className="text-gray-300 text-sm capitalize">{p.tipo.replace(/_/g, ' ')}</span>
                  <span className="text-[#ff1e56] text-sm font-medium">+{p.puntos}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="text-center">
          <Link href="/miembros/ranking" className="inline-block px-6 py-3 bg-[#ff1e56] text-white rounded-lg font-medium hover:bg-[#e01a4c] transition-colors">Ver Ranking</Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

function CategoriaBarra({ label, icon: Icon, puntos, total, color, permanente }: { label: string; icon: any; puntos: number; total: number; color: string; permanente?: boolean }) {
  const pct = total > 0 ? Math.round((puntos / total) * 100) : 0
  return (
    <motion.div variants={item} className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-sm text-gray-300">{label}</span>
          {permanente && <span className="text-[9px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">fijo</span>}
        </div>
        <span className="text-sm font-bold text-white">{puntos.toLocaleString()} pts</span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </motion.div>
  )
}
