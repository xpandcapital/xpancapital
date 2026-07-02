'use client'

import { useState, useEffect } from 'react'
import type { RankingEntry } from '@/lib/types/database'

interface Props {
  empresaId: string
}

type CatTab = 'global' | 'cursos' | 'comunidad' | 'blog'

const catLabels: Record<CatTab, string> = {
  global: 'Global', cursos: 'Cursos', comunidad: 'Comunidad', blog: 'Blog',
}

export function RankingTab({ empresaId }: Props) {
  const [cat, setCat] = useState<CatTab>('global')
  const [top10, setTop10] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/gamificacion/ranking?empresa_id=${empresaId}&categoria=${cat}`)
        const json = await res.json()
        if (json.success) setTop10(json.data.top10 || [])
      } catch (err) {
        console.error('[RankingTab] Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRanking()
  }, [empresaId, cat])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Ranking</h3>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {(Object.keys(catLabels) as CatTab[]).map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                cat === c ? 'bg-[#ff1e56] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {catLabels[c]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Pos</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Alumno</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Nivel</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium text-right">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {top10.map(entry => (
                <tr key={entry.user_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3"><RankBadge posicion={entry.posicion} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} className="w-7 h-7 rounded-full" alt="" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                          {entry.nombre?.[0]}
                        </div>
                      )}
                      <span className="text-white text-sm">{entry.nombre} {entry.apellido || ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      {entry.nivelNombre || `Nv ${entry.nivel}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#ff1e56] font-semibold text-sm">
                    {entry.puntos.toLocaleString()}
                  </td>
                </tr>
              ))}
              {top10.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">Sin datos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function RankBadge({ posicion }: { posicion: number }) {
  const colors: Record<number, string> = { 1: 'text-yellow-400', 2: 'text-gray-300', 3: 'text-amber-600' }
  return <span className={`text-sm font-bold ${colors[posicion] || 'text-gray-500'}`}>#{posicion}</span>
}
