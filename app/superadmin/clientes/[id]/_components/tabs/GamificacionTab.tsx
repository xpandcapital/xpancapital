"use client"

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, Award, Medal } from 'lucide-react'
import type { Client } from '../../../_types'
import type { GamificacionPuntos } from '@/lib/types/database'

interface Props {
  client: Client
}

export function GamificacionTab({ client }: Props) {
  const [stats, setStats] = useState<any>(null)
  const [puntos, setPuntos] = useState<GamificacionPuntos[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!client.id) { setLoading(false); return }
      try {
        const [statsRes, puntosRes] = await Promise.all([
          fetch(`/api/gamificacion/stats?user_id=${client.id}`),
          fetch(`/api/gamificacion/puntos?user_id=${client.id}&limit=30`),
        ])
        const statsJson = await statsRes.json()
        const puntosJson = await puntosRes.json()
        if (statsJson.success) setStats(statsJson.data)
        if (puntosJson.success) setPuntos(puntosJson.data || [])
      } catch (err) {
        console.error('[GamificacionTab] Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [client.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#ff1e56] animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <p className="text-gray-500 text-sm text-center py-8">
        Sin datos de gamificación. El alumno aún no ha acumulado puntos.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <TrendingUp className="w-5 h-5 text-[#ff1e56] mb-2" />
          <p className="text-2xl font-bold text-white">{stats.puntos.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Puntos totales</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <Award className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">{stats.nivelNombre}</p>
          <p className="text-xs text-gray-500">Nivel {stats.nivelActual}</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <TrendingUp className="w-5 h-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-white">{stats.rachaDias}</p>
          <p className="text-xs text-gray-500">Días de racha</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4">
          <Medal className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-white">{stats.rankingPosicion ? `#${stats.rankingPosicion}` : '—'}</p>
          <p className="text-xs text-gray-500">de {stats.rankingTotal} en ranking</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-zinc-900 border border-white/10 rounded-lg p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-400">Progreso al siguiente nivel</p>
          <p className="text-sm text-gray-500">
            {stats.puntosParaSiguienteNivel > 0
              ? `Faltan ${stats.puntosParaSiguienteNivel.toLocaleString()} pts`
              : 'Nivel máximo'}
          </p>
        </div>
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.progresoNivelPct}%`, backgroundColor: stats.nivelColor }}
          />
        </div>
      </div>

      {/* Logros */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Logros ({stats.logrosDesbloqueados.length})</h3>
        {stats.logrosDesbloqueados.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin logros desbloqueados</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {stats.logrosDesbloqueados.map((lu: any) => (
              <div key={lu.id} className="bg-zinc-900 border border-white/10 rounded-lg p-3">
                <p className="text-white text-sm font-medium">{lu.logro?.nombre || 'Logro'}</p>
                <p className="text-gray-500 text-xs">{lu.logro?.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Historial de puntos</h3>
        <div className="space-y-1">
          {puntos.map(p => (
            <div key={p.id} className="flex items-center justify-between bg-zinc-900/60 border border-white/5 rounded px-3 py-2">
              <div>
                <span className="text-gray-300 text-sm capitalize">{p.tipo.replace(/_/g, ' ')}</span>
                {p.descripcion && <span className="text-gray-600 text-xs ml-2">— {p.descripcion}</span>}
              </div>
              <div className="text-right">
                <span className="text-[#ff1e56] text-sm font-medium">+{p.puntos}</span>
                <p className="text-gray-600 text-xs">{new Date(p.creado_en).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {puntos.length === 0 && (
            <p className="text-gray-500 text-sm">Sin transacciones de puntos</p>
          )}
        </div>
      </div>
    </div>
  )
}
