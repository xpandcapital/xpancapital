"use client"

import { useState, useEffect } from 'react'
import { X, BookOpen, Package, Plus, Trash2, Loader2, Search } from 'lucide-react'
import { useEquipoCursos, useEquipoProductos } from '../_hooks'
import type { Advisor } from '../_types'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'

interface AssignmentModalProps {
  advisor: Advisor
  onClose: () => void
}

export function AssignmentModal({ advisor, onClose }: AssignmentModalProps) {
  const [activeTab, setActiveTab] = useState<'cursos' | 'productos'>('cursos')
  const { cursos, loading: loadingCursos, assignCurso, removeCurso } = useEquipoCursos(advisor.id)
  const { productos, loading: loadingProductos, assignProducto, removeProducto } = useEquipoProductos(advisor.id)
  const [availableCursos, setAvailableCursos] = useState<any[]>([])
  const [availableProductos, setAvailableProductos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/cursos').then(r => r.json()).then(d => { if (d.data) setAvailableCursos(d.data) }).catch(() => {})
    fetch(`/api/productos?empresa_id=${DEFAULT_EMPRESA_ID}`).then(r => r.json()).then(d => { if (d.data) setAvailableProductos(d.data) }).catch(() => {})
  }, [])

  const handleAssignCurso = async (cursoId: string) => {
    setAssigning(cursoId)
    await assignCurso(cursoId)
    setAssigning(null)
  }

  const handleAssignProducto = async (productoId: string) => {
    setAssigning(productoId)
    await assignProducto(productoId)
    setAssigning(null)
  }

  const assignedCursoIds = new Set(cursos.map(c => c.curso_id))
  const assignedProductoIds = new Set(productos.map(p => p.producto_id))

  const filteredCursos = availableCursos.filter(c =>
    c.nombre?.toLowerCase().includes(search.toLowerCase()) || c.title?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredProductos = availableProductos.filter(p =>
    p.nombre?.toLowerCase().includes(search.toLowerCase())
  )

  const estadoLabels: Record<string, { label: string; color: string }> = {
    asignado: { label: 'Asignado', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    en_progreso: { label: 'En Progreso', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    completado: { label: 'Completado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    bloqueado: { label: 'Bloqueado', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    activo: { label: 'Activo', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelado: { label: 'Cancelado', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">Asignar a {advisor.name}</h2>
            <p className="text-white/40 text-sm mt-1">{advisor.email}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-[#111] border-b border-white/5">
          <button onClick={() => setActiveTab('cursos')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'cursos' ? 'text-blis-red border-b-2 border-blis-red bg-blis-red/5' : 'text-white/40 hover:text-white'}`}>
            <BookOpen className="w-4 h-4" /> Cursos
          </button>
          <button onClick={() => setActiveTab('productos')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'productos' ? 'text-blis-red border-b-2 border-blis-red bg-blis-red/5' : 'text-white/40 hover:text-white'}`}>
            <Package className="w-4 h-4" /> Productos
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 160px)' }}>
          {activeTab === 'cursos' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar curso..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blis-red" />
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Cursos Asignados ({cursos.length})</h3>
                {loadingCursos ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
                ) : cursos.length === 0 ? (
                  <p className="text-white/20 text-sm py-4 text-center">Sin cursos asignados</p>
                ) : (
                  <div className="space-y-2">
                    {cursos.map(curso => {
                      const estado = estadoLabels[curso.estado] || estadoLabels.asignado
                      const cursoData = curso.cursos as any
                      return (
                        <div key={curso.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{cursoData?.nombre || 'Curso'}</p>
                            {curso.nota_final !== null && (
                              <p className="text-[10px] text-white/30">Nota: {curso.nota_final}%</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${estado.color}`}>{estado.label}</span>
                            <button onClick={() => removeCurso(curso.id)}
                              className="p-1.5 text-white/20 hover:text-blis-red hover:bg-blis-red/10 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 pt-4">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Cursos Disponibles</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredCursos.filter(c => !assignedCursoIds.has(c.id)).map(curso => (
                    <div key={curso.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{curso.nombre || curso.title}</p>
                        {curso.para_equipo && (
                          <span className="text-[9px] font-bold text-blis-red bg-blis-red/10 px-2 py-0.5 rounded border border-blis-red/20">Solo Equipo</span>
                        )}
                      </div>
                      <button onClick={() => handleAssignCurso(curso.id)} disabled={assigning === curso.id}
                        className="p-1.5 bg-blis-red/10 text-blis-red hover:bg-blis-red/20 rounded-lg transition-colors disabled:opacity-50">
                        {assigning === curso.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                  {filteredCursos.filter(c => !assignedCursoIds.has(c.id)).length === 0 && (
                    <p className="text-white/20 text-sm text-center py-4">Todos los cursos ya están asignados</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'productos' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blis-red" />
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Productos Asignados ({productos.length})</h3>
                {loadingProductos ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
                ) : productos.length === 0 ? (
                  <p className="text-white/20 text-sm py-4 text-center">Sin productos asignados</p>
                ) : (
                  <div className="space-y-2">
                    {productos.map(prod => {
                      const estado = estadoLabels[prod.estado] || estadoLabels.activo
                      const prodData = prod.productos as any
                      return (
                        <div key={prod.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{prodData?.nombre || 'Producto'}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${estado.color}`}>{estado.label}</span>
                            <button onClick={() => removeProducto(prod.id)}
                              className="p-1.5 text-white/20 hover:text-blis-red hover:bg-blis-red/10 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 pt-4">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Productos Disponibles</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredProductos.filter(p => !assignedProductoIds.has(p.id)).map(prod => (
                    <div key={prod.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{prod.nombre}</p>
                        {prod.precio_usd > 0 && <p className="text-[10px] text-white/30">${prod.precio_usd}</p>}
                      </div>
                      <button onClick={() => handleAssignProducto(prod.id)} disabled={assigning === prod.id}
                        className="p-1.5 bg-blis-red/10 text-blis-red hover:bg-blis-red/20 rounded-lg transition-colors disabled:opacity-50">
                        {assigning === prod.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                  {filteredProductos.filter(p => !assignedProductoIds.has(p.id)).length === 0 && (
                    <p className="text-white/20 text-sm text-center py-4">Todos los productos ya están asignados</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}