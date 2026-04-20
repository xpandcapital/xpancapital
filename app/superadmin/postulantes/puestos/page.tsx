"use client"

import { useState } from 'react'
import { Plus, Briefcase } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { PuestoTrabajo, PuestoPregunta } from '../_types'
import { usePuestos } from './_hooks/usePuestos'
import { PuestoCard } from './_components/PuestoCard'
import { PuestoEditor } from './_components/PuestoEditor'
import { CreatePuestoModal } from './_components/CreatePuestoModal'

export default function PuestosPage() {
  const { showToast } = useToast()
  const {
    puestos, preguntas, puestoPreguntasMap, loading, saving,
    fetchPuestos, createPuesto, updatePuesto, deletePuesto,
    savePuestoPreguntas, togglePregunta, updatePuestoPregunta, copyPreguntasFrom,
    grupos,
  } = usePuestos()

  const [selectedPuestoId, setSelectedPuestoId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const selectedPuesto = puestos.find(p => p.id === selectedPuestoId) || null
  const selectedPP = selectedPuestoId ? (puestoPreguntasMap[selectedPuestoId] || []) : []

  const handleCreate = async (nombre: string, descripcion?: string) => {
    const result = await createPuesto(nombre, descripcion)
    if (result) {
      showToast('Puesto creado', 'success')
      return result
    } else {
      showToast('Error al crear', 'error')
      return null
    }
  }

  const handleUpdate = async (id: string, updates: Partial<PuestoTrabajo>) => {
    const ok = await updatePuesto(id, updates)
    if (ok) { showToast('Puesto actualizado', 'success'); return true }
    showToast('Error al actualizar', 'error'); return false
  }

  const handleDelete = async (id: string) => {
    const ok = await deletePuesto(id)
    if (ok) {
      showToast('Puesto eliminado', 'success')
      if (selectedPuestoId === id) setSelectedPuestoId(null)
    } else {
      showToast('Error al eliminar', 'error')
    }
  }

  const handleTogglePregunta = (puestoId: string, preguntaId: string, checked: boolean): PuestoPregunta[] => {
    return togglePregunta(puestoId, preguntaId, checked)
  }

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/formulario/postulante/${slug}`
    navigator.clipboard.writeText(url)
    showToast('Link copiado al portapapeles', 'success')
  }

  const handlePreview = (slug: string) => {
    window.open(`/formulario/postulante/${slug}`, '_blank')
  }

  const handleToggleActivo = async (id: string, activo: boolean) => {
    await updatePuesto(id, { activo })
    showToast(activo ? 'Puesto activado' : 'Puesto desactivado', 'success')
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
        <button onClick={() => setShowCreate(true)} className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Plus className="w-4 h-4" />Nuevo Puesto
        </button>
      </div>

      {selectedPuesto ? (
        <PuestoEditor
          puesto={selectedPuesto}
          selectedPP={selectedPP}
          preguntas={preguntas}
          grupos={grupos}
          puestos={puestos.map(p => ({ id: p.id, nombre: p.nombre }))}
          saving={saving}
          onUpdatePuesto={handleUpdate}
          onDelete={handleDelete}
          onTogglePregunta={handleTogglePregunta}
          onUpdatePregunta={updatePuestoPregunta}
          onSavePuestoPreguntas={async (puestoId, questions) => {
            const ok = await savePuestoPreguntas(puestoId, questions)
            if (ok) showToast('Preguntas guardadas', 'success')
            else showToast('Error al guardar', 'error')
            return ok
          }}
          onCopyPreguntasFrom={copyPreguntasFrom}
          onCopyLink={handleCopyLink}
          onPreview={handlePreview}
          onDeselect={() => setSelectedPuestoId(null)}
        />
      ) : (
        <>
          {puestos.length === 0 ? (
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-16 text-center">
              <Briefcase className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No hay puestos de trabajo</h3>
              <p className="text-gray-500 mb-6 text-sm">Creá el primer puesto para configurar el formulario de postulación.</p>
              <button onClick={() => setShowCreate(true)} className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
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
                  isSelected={selectedPuestoId === puesto.id}
                  onClick={() => setSelectedPuestoId(puesto.id)}
                  onToggleActivo={handleToggleActivo}
                  onDelete={(id) => {
                    if (window.confirm('¿Eliminar este puesto?')) handleDelete(id)
                  }}
                  onCopyLink={handleCopyLink}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          )}
        </>
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