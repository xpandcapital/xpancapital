'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import type { TabGamificacion } from './_types'
import { useGamificacionAdmin } from './_hooks'
import { ConfigTab, NivelesTab, RankingTab, LogrosTab, CertificadoIntentosTab, AjustesTab, HistorialTab } from './_components'

const TABS: { key: TabGamificacion; label: string }[] = [
  { key: 'config', label: 'Config' },
  { key: 'niveles', label: 'Niveles' },
  { key: 'ranking', label: 'Ranking' },
  { key: 'ajustes', label: 'Ajustes' },
  { key: 'historial', label: 'Historial' },
  { key: 'logros', label: 'Logros' },
]

export default function GamificacionPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<TabGamificacion>('config')
  const empresaId = user?.empresa_id

  const {
    config, niveles, logros, intentos, loading,
    updateConfig, saveNivel, deleteNivel,
    saveLogro, deleteLogro,
    fetchIntentos, desbloquearIntentos,
  } = useGamificacionAdmin(empresaId)

  const [cierreLoading, setCierreLoading] = useState(false)
  const [cierreMsg, setCierreMsg] = useState('')

  const handleCierreMensual = async () => {
    if (!confirm('¿Ejecutar cierre mensual? Esto archivará y reseteará puntos de comunidad y blog.')) return
    setCierreLoading(true)
    try {
      const res = await fetch('/api/admin/gamificacion/cierre-mensual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: empresaId }),
      })
      const json = await res.json()
      setCierreMsg(json.success ? `Archivados ${json.data?.archivados} usuarios del período ${json.data?.periodo}` : 'Error')
    } catch { setCierreMsg('Error de conexión') }
    finally { setCierreLoading(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <p className="text-gray-400">Cargando sistema de gamificación...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gamificación</h1>
            <p className="text-gray-500 mt-1">Sistema de puntos, rangos y ranking de alumnos</p>
          </div>
          <button
            onClick={handleCierreMensual}
            disabled={cierreLoading}
            className="px-4 py-2 bg-amber-900/30 text-amber-400 rounded-lg text-sm hover:bg-amber-900/50 transition-colors disabled:opacity-50"
          >
            {cierreLoading ? 'Ejecutando...' : 'Cierre Mensual'}
          </button>
        </div>
        {cierreMsg && <p className="text-sm text-amber-400 mb-4">{cierreMsg}</p>}

        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-0">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
                tab === t.key
                  ? 'bg-gray-900 text-[#ff1e56] border-t border-l border-r border-gray-800'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6">
          {tab === 'config' && config && (
            <ConfigTab config={config} onSave={updateConfig} />
          )}
          {tab === 'niveles' && (
            <NivelesTab niveles={niveles} onSave={saveNivel} onDelete={deleteNivel} />
          )}
          {tab === 'ranking' && empresaId && (
            <RankingTab empresaId={empresaId} />
          )}
          {tab === 'ajustes' && empresaId && (
            <AjustesTab empresaId={empresaId} />
          )}
          {tab === 'historial' && empresaId && (
            <HistorialTab empresaId={empresaId} />
          )}
          {tab === 'logros' && (
            <LogrosTab logros={logros} onSave={saveLogro} onDelete={deleteLogro} />
          )}
          {tab === 'certificados' && (
            <CertificadoIntentosTab intentos={intentos} onFetch={fetchIntentos} onDesbloquear={desbloquearIntentos} />
          )}
        </div>
      </div>
    </div>
  )
}
