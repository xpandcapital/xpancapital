"use client"

import { motion } from 'framer-motion'
import { Radio, Clock } from 'lucide-react'
import { useTransmisiones } from './_hooks'
import { TransmisionForm, TransmisionActiva, TransmisionHistorial } from './_components'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import type { TransmisionFormData } from './_types'

export default function TransmisionesPage() {
  const { showToast } = useToast()
  const { user } = useAuth()

  const {
    transmisionActiva,
    historial,
    loading,
    saving,
    iniciarTransmision,
    extenderTransmision,
    cancelarTransmision,
    eliminarTransmision,
  } = useTransmisiones(user?.empresa_id || '')

  const handleIniciar = async (form: TransmisionFormData) => {
    try {
      const result = await iniciarTransmision(form)
      showToast('Transmisión iniciada', 'success')
      return result
    } catch (e: any) {
      showToast(e.message || 'Error', 'error')
      throw e
    }
  }

  const handleExtender = async (id: string, minutos: number) => {
    try {
      await extenderTransmision(id, minutos)
      showToast(`Extendido +${minutos} min`, 'success')
    } catch (e: any) {
      showToast(e.message || 'Error', 'error')
    }
  }

  const handleCancelar = async (id: string) => {
    try {
      await cancelarTransmision(id)
      showToast('Transmisión finalizada', 'success')
    } catch (e: any) {
      showToast(e.message || 'Error', 'error')
    }
  }

  const handleEliminar = async (id: string) => {
    try {
      await eliminarTransmision(id)
      showToast('Eliminada del historial', 'success')
    } catch (e: any) {
      showToast(e.message || 'Error', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-2.5 rounded-xl bg-emerald-500/10">
          <Radio className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Transmisiones</h1>
          <p className="text-gray-500 text-xs">Gestiona banners de transmisión en vivo</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TransmisionForm
            activa={transmisionActiva}
            saving={saving}
            onIniciar={handleIniciar}
          />
          {transmisionActiva && (
            <TransmisionActiva
              transmision={transmisionActiva}
              onExtender={handleExtender}
              onCancelar={handleCancelar}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="text-white font-bold text-sm">Historial</h3>
          </div>
          <TransmisionHistorial
            historial={historial}
            loading={loading}
            onEliminar={handleEliminar}
          />
        </div>
      </div>
    </div>
  )
}
