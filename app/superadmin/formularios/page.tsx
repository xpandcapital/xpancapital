'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Eye, MousePointerClick, TrendingUp, CreditCard, FileText, Loader2 } from 'lucide-react'
import { useFormularios } from './_hooks/useFormularios'
import { FormCard } from './_components'
import { defaultFormulario } from './_types'
import type { Formulario } from './_types'
import { useToast } from '@/components/ui/Toast'

export default function FormulariosPage() {
  const router = useRouter()
  const { formularios, loading, create, remove } = useFormularios()
  const { showToast } = useToast()
  const [creating, setCreating] = useState(false)

  const totalVistas = formularios.reduce((sum, f) => sum + f.vistas, 0)
  const totalRespuestas = formularios.reduce((sum, f) => sum + f.respuestas, 0)
  const conversionGlobal = totalVistas > 0 ? ((totalRespuestas / totalVistas) * 100).toFixed(1) : '0.0'

  const stats = [
    { icon: Eye, label: 'Total Visitantes', value: totalVistas.toLocaleString(), color: 'text-blue-400' },
    { icon: MousePointerClick, label: 'Total Respuestas', value: totalRespuestas.toLocaleString(), color: 'text-emerald-400' },
    { icon: TrendingUp, label: 'Conversión', value: `${conversionGlobal}%`, color: 'text-amber-400' },
    { icon: CreditCard, label: 'Límite Mensual', value: '1,000', color: 'text-purple-400' },
  ]

  const handleCreate = async () => {
    setCreating(true)
    try {
      const result = await create({ ...defaultFormulario, nombre: `Formulario ${formularios.length + 1}`, slug: `form-${Date.now().toString().slice(-6)}` })
      if (result) {
        showToast('Formulario creado', 'success')
        router.push(`/superadmin/formularios/${result.id}`)
      } else {
        showToast('Error al crear formulario', 'error')
      }
    } catch {
      showToast('Error al crear formulario', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = (form: Formulario) => {
    router.push(`/superadmin/formularios/${form.id}`)
  }

  const handlePublic = (form: Formulario) => {
    window.open(`/f/${form.slug}`, '_blank')
  }

  const handleDelete = async (form: Formulario) => {
    if (confirm(`¿Eliminar "${form.nombre}"?`)) {
      await remove(form.id)
      showToast('Formulario eliminado', 'success')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Formularios</h1>
            <p className="text-xs text-gray-500 mt-1">Gestiona tus formularios de captación de leads</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 bg-blis-red hover:bg-blis-red/80 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Nuevo Formulario
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              className="bg-zinc-950 border border-white/5 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] text-gray-500 font-bold uppercase">{stat.label}</span>
              </div>
              <p className="text-lg font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {formularios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Sin formularios</h3>
            <p className="text-xs text-gray-500 mb-4 max-w-xs">Crea tu primer formulario para comenzar a captar leads</p>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blis-red hover:bg-blis-red/80 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Crear Formulario
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formularios.map((form, i) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <FormCard form={form} onEdit={handleEdit} onPublic={handlePublic} onDelete={handleDelete} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}