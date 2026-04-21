"use client"

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
import { PuestoTrabajo } from '../../_types'

interface PuestoComboboxProps {
  value: string | null | undefined
  puestoNombre?: string
  onChange: (id: string | null, nombre: string) => void
}

export function PuestoCombobox({ value, puestoNombre, onChange }: PuestoComboboxProps) {
  const [puestos, setPuestos] = useState<PuestoTrabajo[]>([])
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchPuestos = async () => {
      try {
        const res = await fetch('/api/postulantes/puestos')
        const data = await res.json()
        if (data.success) setPuestos(data.data)
      } catch {}
      finally { setLoading(false) }
    }
    fetchPuestos()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = puestos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const selected = puestos.find(p => p.id === value)
  const displayValue = selected?.nombre || puestoNombre || ''

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 flex items-center justify-between"
      >
        <span className={displayValue ? '' : 'text-gray-600'}>{displayValue || 'Seleccionar puesto...'}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar puesto..."
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50 placeholder:text-gray-600"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-gray-500 text-sm flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" />Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-sm">No se encontraron puestos</div>
            ) : (
              filtered.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(p.id, p.nombre); setOpen(false); setSearch('') }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 flex items-center justify-between ${p.id === value ? 'text-blis-red bg-blis-red/5' : 'text-white'}`}
                >
                  {p.nombre}
                  {p.id === value && <Check className="w-4 h-4" />}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-white/5 p-2">
            <button
              type="button"
              onClick={() => { onChange(null, ''); setOpen(false); setSearch('') }}
              className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
            >
              Sin puesto asignado
            </button>
          </div>
        </div>
      )}
    </div>
  )
}