'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, History, ChevronLeft, ChevronRight } from 'lucide-react'

interface PuntoTransaccion {
  id: string
  user_id: string
  puntos: number
  tipo: string
  descripcion?: string
  referencia_tipo?: string
  referencia_id?: string
  creado_en: string
  usuario?: { nombre: string; email: string }
}

export function HistorialTab({ empresaId }: { empresaId: string }) {
  const [transacciones, setTransacciones] = useState<PuntoTransaccion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const fetchTransacciones = useCallback(async () => {
    setLoading(true)
    try {
      // Obtener todos los usuarios con puntos
      const resUsers = await fetch(`/api/admin/users?empresa_id=${empresaId}&limit=200`)
      const usersJson = await resUsers.json()
      const userIds = (usersJson.data || []).map((u: any) => u.id)

      if (!userIds.length) { setTransacciones([]); setLoading(false); return }

      // Obtener historial para cada usuario (limitado)
      const allTx: PuntoTransaccion[] = []
      for (const uid of userIds.slice(0, 50)) {
        try {
          const res = await fetch(`/api/gamificacion/puntos?user_id=${uid}&limit=10`)
          const json = await res.json()
          if (json.success && json.data) {
            for (const tx of json.data) {
              const user = usersJson.data.find((u: any) => u.id === uid)
              allTx.push({ ...tx, usuario: user ? { nombre: user.nombre || user.email, email: user.email } : undefined })
            }
          }
        } catch {}
      }

      // Ordenar por fecha descendente
      allTx.sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())

      const q = search.toLowerCase()
      const filtered = q ? allTx.filter(tx =>
        tx.usuario?.nombre?.toLowerCase().includes(q) ||
        tx.descripcion?.toLowerCase().includes(q) ||
        tx.tipo?.toLowerCase().includes(q)
      ) : allTx

      setTransacciones(filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE))
    } catch {} finally { setLoading(false) }
  }, [empresaId, search, page])

  useEffect(() => { fetchTransacciones() }, [fetchTransacciones])

  const getTipoLabel = (tipo: string) => {
    const map: Record<string, string> = {
      leccion_completada: 'Lección',
      curso_completado: 'Curso',
      post_comunidad: 'Post',
      comentario_comunidad: 'Comentario',
      reaccion: 'Reacción',
      comentario_blog: 'Blog Cmt',
      lectura_blog: 'Lectura',
      dia_activo: 'Día activo',
      certificado: 'Certificado',
      logro_desbloqueado: 'Logro',
      admin_ajuste: 'Admin',
    }
    return map[tipo] || tipo
  }

  const getTipoColor = (tipo: string) => {
    if (tipo === 'admin_ajuste') return 'bg-purple-500/10 text-purple-400'
    if (tipo.includes('curso') || tipo.includes('leccion')) return 'bg-blue-500/10 text-blue-400'
    if (tipo.includes('comunidad')) return 'bg-emerald-500/10 text-emerald-400'
    if (tipo.includes('blog')) return 'bg-amber-500/10 text-amber-400'
    return 'bg-gray-500/10 text-gray-400'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder="Buscar por usuario, tipo o descripción..."
          className="bg-transparent text-white text-sm flex-1 focus:outline-none placeholder-gray-600"
        />
        <History className="w-4 h-4 text-gray-600" />
      </div>

      <div className="bg-gray-900/40 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : transacciones.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">Sin transacciones registradas</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/60 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Usuario</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Descripción</th>
                    <th className="px-4 py-3 text-right">Puntos</th>
                    <th className="px-4 py-3 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {transacciones.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{tx.usuario?.nombre || 'Usuario'}</span>
                        <p className="text-[10px] text-gray-600">{tx.usuario?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTipoColor(tx.tipo)}`}>
                          {getTipoLabel(tx.tipo)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">
                        {tx.descripcion || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-bold ${tx.puntos >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.puntos >= 0 ? '+' : ''}{tx.puntos}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500">
                        {new Date(tx.creado_en).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-gray-800 flex justify-end">
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 hover:bg-gray-800 rounded disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-3 py-1.5 text-xs text-gray-500">Pág {page + 1}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={transacciones.length < PAGE_SIZE} className="p-1.5 hover:bg-gray-800 rounded disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
