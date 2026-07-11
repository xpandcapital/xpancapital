'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, Plus, Minus, Trophy, TrendingUp, History, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

interface RankingEntry {
  posicion: number
  user_id: string
  nombre: string
  apellido?: string
  avatar_url?: string
  puntos: number
  nivel: number
  nivelNombre?: string
  puntos_cursos: number
  puntos_comunidad: number
  puntos_blog: number
}

interface PuntoHistorial {
  id: string
  puntos: number
  tipo: string
  descripcion?: string
  creado_en: string
}

export function AjustesTab({ empresaId }: { empresaId: string }) {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const PAGE_SIZE = 15

  // Detalle de usuario seleccionado
  const [selectedUser, setSelectedUser] = useState<RankingEntry | null>(null)
  const [historial, setHistorial] = useState<PuntoHistorial[]>([])
  const [histLoading, setHistLoading] = useState(false)
  const [ajusteMonto, setAjusteMonto] = useState(100)
  const [ajusteDesc, setAjusteDesc] = useState('')
  const [ajusteLoading, setAjusteLoading] = useState(false)

  const fetchRanking = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ empresa_id: empresaId })
      const res = await fetch(`/api/gamificacion/ranking?${params}`)
      const json = await res.json()
      if (json.success) {
        const all = [...(json.data?.top10 || []), ...(json.data?.vecinos || [])]
        const unique = all.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.user_id === v.user_id) === i)
        setTotal(unique.length)
        setRanking(unique)
      }
    } catch {} finally { setLoading(false) }
  }, [empresaId])

  // Fetch full ranking from profiles directly for pagination
  const fetchFullRanking = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?empresa_id=${empresaId}&limit=200`)
      const json = await res.json()
      if (json.success && json.data) {
        const users = json.data
          .filter((u: any) => (u.puntos || 0) > 0)
          .sort((a: any, b: any) => (b.puntos_nivel || 0) - (a.puntos_nivel || 0) || (b.puntos || 0) - (a.puntos || 0))
          .map((u: any, i: number) => ({
            posicion: i + 1,
            user_id: u.id,
            nombre: u.nombre || u.email,
            apellido: u.apellido,
            avatar_url: u.avatar_url,
            puntos: u.puntos || 0,
            nivel: u.puntos_nivel || 1,
            puntos_cursos: u.puntos_cursos || 0,
            puntos_comunidad: u.puntos_comunidad || 0,
            puntos_blog: u.puntos_blog || 0,
          }))
        const q = search.toLowerCase()
        const filtered = q ? users.filter((u: any) => u.nombre?.toLowerCase().includes(q)) : users
        setTotal(filtered.length)
        setRanking(filtered.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE))
      }
    } catch {} finally { setLoading(false) }
  }, [empresaId, search])

  useEffect(() => { fetchFullRanking(0) }, [empresaId, search])

  const fetchHistorial = async (userId: string) => {
    setHistLoading(true)
    try {
      const res = await fetch(`/api/gamificacion/puntos?user_id=${userId}&limit=50`)
      const json = await res.json()
      if (json.success) setHistorial(json.data || [])
    } catch {} finally { setHistLoading(false) }
  }

  const handleSelectUser = (entry: RankingEntry) => {
    setSelectedUser(entry)
    setAjusteDesc('')
    setAjusteMonto(100)
    fetchHistorial(entry.user_id)
  }

  const handleAjuste = async (sumar: boolean) => {
    if (!selectedUser || !ajusteDesc.trim()) return
    setAjusteLoading(true)
    try {
      const monto = sumar ? ajusteMonto : -ajusteMonto
      const res = await fetch('/api/gamificacion/otorgar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.user_id,
          empresa_id: empresaId,
          tipo: 'admin_ajuste',
          descripcion: ajusteDesc,
          puntos_override: monto,
        }),
      })
      const json = await res.json()
      if (json.success) {
        fetchHistorial(selectedUser.user_id)
        fetchFullRanking(page)
        setAjusteDesc('')
      }
    } catch {} finally { setAjusteLoading(false) }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder="Buscar alumno por nombre..."
          className="bg-transparent text-white text-sm flex-1 focus:outline-none placeholder-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Ranking */}
        <div className="xl:col-span-2 bg-gray-900/40 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Ranking de Alumnos
            </h3>
            <span className="text-xs text-gray-500">{total} alumnos</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
          ) : ranking.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">Sin alumnos con puntos</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/60 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">#</th>
                      <th className="px-4 py-3 text-left">Alumno</th>
                      <th className="px-4 py-3 text-center">Nivel</th>
                      <th className="px-4 py-3 text-right">Pts Cursos</th>
                      <th className="px-4 py-3 text-right">Pts Comunidad</th>
                      <th className="px-4 py-3 text-right">Pts Blog</th>
                      <th className="px-4 py-3 text-right font-bold text-white">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {ranking.map(entry => (
                      <tr
                        key={entry.user_id}
                        onClick={() => handleSelectUser(entry)}
                        className={`cursor-pointer hover:bg-white/[0.02] transition-colors ${
                          selectedUser?.user_id === entry.user_id ? 'bg-[#f5e100]/5 border-l-2 border-l-[#f5e100]' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${entry.posicion <= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                            {entry.posicion}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                              {entry.nombre?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-white font-medium">{entry.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">Nv.{entry.nivel}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-400">{entry.puntos_cursos.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-400">{entry.puntos_comunidad.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-400">{entry.puntos_blog.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-white">{entry.puntos.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="p-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <span>Pág {page + 1} de {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 hover:bg-gray-800 rounded disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 hover:bg-gray-800 rounded disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detalle + Ajuste */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-lg">
          {!selectedUser ? (
            <div className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Selecciona un alumno del ranking para ver su historial y ajustar puntos</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {/* Header usuario */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">{selectedUser.nombre}</h4>
                  <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-800 rounded"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <p className="text-gray-500">Nivel</p>
                    <p className="text-white font-bold">{selectedUser.nivel}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                    <p className="text-gray-500">Total Pts</p>
                    <p className="text-white font-bold">{selectedUser.puntos.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Ajuste manual */}
              <div className="p-4 space-y-3">
                <h5 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                  <Plus className="w-3 h-3" /> Ajustar Puntos
                </h5>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ajusteMonto}
                    onChange={e => setAjusteMonto(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:border-[#f5e100] focus:outline-none"
                  />
                  <input
                    value={ajusteDesc}
                    onChange={e => setAjusteDesc(e.target.value)}
                    placeholder="Motivo del ajuste..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:border-[#f5e100] focus:outline-none placeholder-gray-600"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAjuste(true)}
                    disabled={ajusteLoading || !ajusteDesc.trim()}
                    className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {ajusteLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Sumar
                  </button>
                  <button
                    onClick={() => handleAjuste(false)}
                    disabled={ajusteLoading || !ajusteDesc.trim()}
                    className="flex-1 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {ajusteLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Minus className="w-3 h-3" />}
                    Restar
                  </button>
                </div>
              </div>

              {/* Historial */}
              <div className="p-4">
                <h5 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2 mb-3">
                  <History className="w-3 h-3" /> Historial de Puntos
                </h5>
                {histLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-600" /></div>
                ) : historial.length === 0 ? (
                  <p className="text-xs text-gray-600 py-4 text-center">Sin transacciones</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {historial.map(h => (
                      <div key={h.id} className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-white truncate">{h.descripcion || h.tipo}</p>
                          <p className="text-[10px] text-gray-500">{new Date(h.creado_en).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={`text-xs font-bold ml-2 ${h.puntos >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {h.puntos >= 0 ? '+' : ''}{h.puntos}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

