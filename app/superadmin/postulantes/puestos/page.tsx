"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Briefcase } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { usePuestos } from './_hooks/usePuestos'
import { PuestoCard } from './_components/PuestoCard'
import { CreatePuestoModal } from './_components/CreatePuestoModal'

export default function PuestosPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [showCreate, setShowCreate] = useState(false)
  const {
    puestos, puestoPreguntasMap, loading, saving,
    createPuesto, updatePuesto, deletePuesto,
  } = usePuestos()

  const handleCreate = async (nombre: string, descripcion?: string) => {
    const result = await createPuesto(nombre, descripcion)
    if (result) {
      showToast('Puesto creado', 'success')
      router.push(`/superadmin/postulantes/puestos/${result.id}`)
      return result
    }
    showToast('Error al crear', 'error')
    return null
  }

  const handleToggleActivo = async (id: string, activo: boolean) => {
    await updatePuesto(id, { activo })
    showToast(activo ? 'Puesto activado' : 'Puesto desactivado', 'success')
  }

  const handleDelete = async (id: string) => {
    const ok = await deletePuesto(id)
    if (ok) showToast('Puesto eliminado', 'success')
    else showToast('Error al eliminar', 'error')
  }

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/formulario/postulante/${slug}`
    navigator.clipboard.writeText(url)
    showToast('Link copiado al portapapeles', 'success')
  }

  const handleCopyEmbed = (slug: string) => {
    const url = `${window.location.origin}/embed/postulante/${slug}`
    const code = `<iframe src="${url}" width="100%" height="800" frameborder="0" style="border:none;max-width:100%;"></iframe>`
    navigator.clipboard.writeText(code)
    showToast('Código de incrustación copiado', 'success')
  }

  const handlePreview = (slug: string) => {
    window.open(`/formulario/postulante/${slug}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full mx-auto pb-20 px-4 md:px-8 pt-8 bg-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Puestos de Trabajo</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light">Gestiona los puestos y configura los formularios de postulación.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(213,193,8,0.3)]">
          <Plus className="w-4 h-4" />Nuevo Puesto
        </button>
      </div>

      {puestos.length === 0 ? (
        <div className="bg-zinc-950 border border-white/5 rounded-2xl p-16 text-center">
          <Briefcase className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No hay puestos de trabajo</h3>
          <p className="text-gray-500 mb-6 text-sm">Creá el primer puesto para configurar el formulario de postulación.</p>
          <button onClick={() => setShowCreate(true)} className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-[0_10px_20px_rgba(213,193,8,0.3)]">
            <Plus className="w-4 h-4 inline mr-2" />Crear Puesto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {puestos.map(puesto => (
            <PuestoCard
              key={puesto.id}
              puesto={puesto}
              preguntaCount={(puestoPreguntasMap[puesto.id] || []).length}
              isSelected={false}
              onClick={() => router.push(`/superadmin/postulantes/puestos/${puesto.id}`)}
              onToggleActivo={handleToggleActivo}
              onDelete={(id) => {
                if (window.confirm('¿Eliminar este puesto?')) handleDelete(id)
              }}
              onCopyLink={handleCopyLink}
              onPreview={handlePreview}
              onCopyEmbed={handleCopyEmbed}
            />
          ))}
        </div>
      )}

      <CreatePuestoModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreate}
        saving={saving}
      />
    </div>
  )
}
