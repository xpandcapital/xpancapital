"use client"

import { motion } from "framer-motion"
import { Loader2, Trophy } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRanking } from "@/lib/hooks/useGamificacion"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
}

export default function RankingPage() {
  const { user } = useAuth()
  const { top10, vecinos, ownEntry, loading } = useRanking(user?.empresa_id, user?.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ff1e56] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            Ranking
          </h1>
          <p className="text-gray-500 mt-1">Los mejores alumnos de la comunidad</p>
        </div>

        {/* Top 10 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Top 10</h2>
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden">
            {top10.map(entry => (
              <motion.div
                key={entry.user_id}
                variants={item}
                className={`flex items-center gap-4 px-4 py-3 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors ${
                  entry.user_id === user?.id ? 'bg-[#ff1e56]/5 border-l-2 border-l-[#ff1e56]' : ''
                }`}
              >
                <span className={`text-sm font-bold w-8 ${
                  entry.posicion === 1 ? 'text-yellow-400' :
                  entry.posicion === 2 ? 'text-gray-300' :
                  entry.posicion === 3 ? 'text-amber-600' :
                  'text-gray-500'
                }`}>
                  #{entry.posicion}
                </span>

                {entry.avatar_url ? (
                  <img src={entry.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                    {entry.nombre?.[0] || '?'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {entry.nombre} {entry.apellido || ''}
                    {entry.user_id === user?.id && <span className="text-[#ff1e56] ml-1 text-xs">(Tú)</span>}
                  </p>
                  <p className="text-gray-500 text-xs">Nivel {entry.nivel}</p>
                </div>

                <p className="text-[#ff1e56] font-semibold text-sm">{entry.puntos.toLocaleString()} pts</p>
              </motion.div>
            ))}
            {top10.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">Sin datos de ranking aún</p>
            )}
          </div>
        </section>

        {/* Cerca de ti */}
        {vecinos.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Cerca de ti</h2>
            <div className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden">
              {vecinos.map(entry => (
                <motion.div
                  key={entry.user_id}
                  variants={item}
                  className={`flex items-center gap-4 px-4 py-3 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors ${
                    entry.user_id === user?.id ? 'bg-[#ff1e56]/5 border-l-2 border-l-[#ff1e56]' : ''
                  }`}
                >
                  <span className="text-sm text-gray-500 font-bold w-8">#{entry.posicion}</span>
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                      {entry.nombre?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {entry.nombre} {entry.apellido || ''}
                      {entry.user_id === user?.id && <span className="text-[#ff1e56] ml-1 text-xs">(Tú)</span>}
                    </p>
                    <p className="text-gray-500 text-xs">Nivel {entry.nivel}</p>
                  </div>
                  <p className="text-[#ff1e56] font-semibold text-sm">{entry.puntos.toLocaleString()} pts</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  )
}
