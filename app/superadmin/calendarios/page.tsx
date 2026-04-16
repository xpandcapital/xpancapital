"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Plus, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCalendars } from './_hooks/useCalendars'
import { defaultCalendar, type Calendario } from './_types'
import { CalendarCard, CalendarTypeModal } from './_components'
import { useToast } from '@/components/ui/Toast'

export default function CalendariosPage() {
  const router = useRouter()
  const { calendars, loading, error, create, remove } = useCalendars()
  const { showToast } = useToast()
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleSelectType = async (tipo: string) => {
    setShowTypeModal(false)
    setCreating(true)
    try {
      const newCalendar = {
        ...defaultCalendar,
        tipo: tipo as Calendario['tipo'],
        nombre: `Nuevo ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
        slug: `cal-${tipo}-${Date.now().toString().slice(-6)}`,
      }
      const result = await create(newCalendar)
      if (result.success && result.data) {
        showToast('Calendario creado', 'success')
        router.push(`/superadmin/calendarios/${result.data.id}`)
      }
    } catch (err) {
      showToast('Error al crear calendario', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (calendar: Calendario) => {
    router.push(`/superadmin/calendarios/${calendar.id}`)
  }

  const handlePublic = (calendar: Calendario) => {
    window.open(`/calendario/${calendar.slug}`, '_blank')
  }

  const handleDelete = async (calendar: Calendario) => {
    if (confirm(`¿Eliminar "${calendar.nombre}"?`)) {
      const result = await remove(calendar.id)
      if (result.success) {
        showToast('Calendario eliminado', 'success')
      } else {
        showToast('Error al eliminar', 'error')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-blis-red rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-[1800px] mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 font-medium">Administración</p>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Calendarios</span>
              </h1>
              <p className="text-white/40 text-sm max-w-xl">
                Configura calendarios de reservas, define horarios y gestiona la disponibilidad.
              </p>
            </div>
            <button
              onClick={() => setShowTypeModal(true)}
              disabled={creating}
              className="px-6 py-3 bg-blis-red rounded-2xl text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-blis-red/20 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
                {creating ? 'Creando...' : 'Nuevo Calendario'}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {calendars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {calendars.map((calendar) => (
              <motion.div
                key={calendar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CalendarCard
                  calendar={calendar}
                  onEdit={handleEdit}
                  onPublic={handlePublic}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
              <CalendarDays className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sin calendarios</h3>
            <p className="text-white/40 text-sm mb-6">Comienza creando tu primer calendario de reservas</p>
            <button
              onClick={() => setShowTypeModal(true)}
              className="px-6 py-3 bg-blis-red rounded-2xl text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-blis-red/20 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Nuevo Calendario</span>
            </button>
          </div>
        )}
      </div>

      <CalendarTypeModal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelect={handleSelectType}
      />
    </div>
  )
}