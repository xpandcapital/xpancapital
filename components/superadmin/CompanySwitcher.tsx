"use client"

import { useState, useEffect, useRef } from 'react'
import { Building2, ChevronDown, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'

interface EmpresaOption {
  id: string
  nombre: string
  slug: string
  logo_url?: string | null
  color_primario?: string | null
}

export function CompanySwitcher() {
  const { user } = useAuth()
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const isSuperadmin = user?.role === 'superadmin'

  useEffect(() => {
    if (!isSuperadmin) return
    fetchEmpresas()
  }, [isSuperadmin])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchEmpresas = async () => {
    try {
      const res = await fetch('/api/admin/empresa?list=all')
      const data = await res.json()
      if (data.success && data.empresas) {
        setEmpresas(data.empresas)
        const stored = localStorage.getItem('blis_active_empresa')
        if (stored) {
          setSelectedId(stored)
        } else {
          setSelectedId(data.empresas[0]?.id || '')
        }
      }
    } catch {
      // Silently fail
    }
  }

  const handleSwitch = async (empresaId: string) => {
    if (empresaId === selectedId) {
      setOpen(false)
      return
    }
    setLoading(true)
    setSelectedId(empresaId)
    localStorage.setItem('blis_active_empresa', empresaId)

    try {
      await fetch('/api/admin/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ switchEmpresa: empresaId }),
      })
    } catch {
      // Silently fail
    }

    setOpen(false)
    setLoading(false)
    window.location.reload()
  }

  if (!isSuperadmin) return null

  const selected = empresas.find(e => e.id === selectedId) || empresas[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left"
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: selected?.color_primario || '#be0b3c' }}>
          {selected?.logo_url ? (
            <img src={selected.logo_url} alt="" className="w-4 h-4 rounded object-cover" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-white truncate">{selected?.nombre || 'Empresa'}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Super Admin</p>
        </div>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Cambiar empresa</p>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {empresas.map(empresa => (
                <button
                  key={empresa.id}
                  onClick={() => handleSwitch(empresa.id)}
                  disabled={loading}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: empresa.color_primario || '#6b7280' }}>
                    {empresa.logo_url ? (
                      <img src={empresa.logo_url} alt="" className="w-3 h-3 rounded object-cover" />
                    ) : (
                      <Building2 className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-white font-medium truncate flex-1">{empresa.nombre}</span>
                  {empresa.id === selectedId && <Check className="w-3.5 h-3.5 text-blis-red flex-shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}