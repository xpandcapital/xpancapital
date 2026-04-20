"use client"

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { usePuestos } from '../_hooks/usePuestos'
import { PuestoEditor } from '../_components/PuestoEditor'
import { PuestoTrabajo, PuestoPregunta } from '../../_types'
import { useToast } from '@/components/ui/Toast'

export default function PuestoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const id = params.id as string

  const {
    puestos, preguntas, puestoPreguntasMap, loading, saving,
    fetchPuestos, createPuesto, updatePuesto, deletePuesto,
    savePuestoPreguntas, togglePregunta, updatePuestoPregunta, copyPreguntasFrom,
    grupos,
  } = usePuestos()

  const puesto = puestos.find(p => p.id === id) || null
  const selectedPP = id ? (puestoPreguntasMap[id] || []) : []

  const handleUpdate = async (puestoId: string, updates: Partial<PuestoTrabajo>) => {
    const ok = await updatePuesto(puestoId, updates)
    if (ok) { showToast('Puesto actualizado', 'success'); return true }
    showToast('Error al actualizar', 'error'); return false
  }

  const handleDelete = async (puestoId: string) => {
    const ok = await deletePuesto(puestoId)
    if (ok) {
      showToast('Puesto eliminado', 'success')
      router.push('/superadmin/postulantes/puestos')
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

  const handleCopyEmbed = (slug: string) => {
    const url = `${window.location.origin}/embed/postulante/${slug}`
    const code = `<iframe src="${url}" width="100%" height="800" frameborder="0" style="border:none;max-width:100%;"></iframe>`
    navigator.clipboard.writeText(code)
    showToast('Código de incrustación copiado', 'success')
  }

  const handlePreview = (slug: string) => {
    window.open(`/formulario/postulante/${slug}`, '_blank')
  }

  const handleToggleActivo = async (puestoId: string, activo: boolean) => {
    await updatePuesto(puestoId, { activo })
    showToast(activo ? 'Puesto activado' : 'Puesto desactivado', 'success')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!puesto) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-gray-400">Puesto no encontrado</p>
        <button onClick={() => router.push('/superadmin/postulantes/puestos')} className="px-6 py-3 bg-blis-red text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <ArrowLeft className="w-4 h-4 inline mr-2" />Volver a Puestos
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full mx-auto pb-20 px-4 md:px-8 pt-4 bg-black">
      <button
        onClick={() => router.push('/superadmin/postulantes/puestos')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Volver a Puestos</span>
      </button>

      <PuestoEditor
        puesto={puesto}
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
        onDeselect={() => router.push('/superadmin/postulantes/puestos')}
        onCopyEmbed={handleCopyEmbed}
      />
    </div>
  )
}