'use client'

import { useState } from 'react'
import type { CertificadoIntento } from '@/lib/types/database'

interface Props {
  intentos: CertificadoIntento[]
  onFetch: (userId: string, cursoId: string) => Promise<any>
  onDesbloquear: (userId: string, cursoId: string) => Promise<any>
}

export function CertificadoIntentosTab({ intentos, onFetch, onDesbloquear }: Props) {
  const [userId, setUserId] = useState('')
  const [cursoId, setCursoId] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const handleBuscar = async () => {
    if (!userId) return
    setLoading(true)
    setMensaje('')
    await onFetch(userId, cursoId || undefined as any)
    setLoading(false)
  }

  const handleDesbloquear = async (uid: string, cid: string) => {
    const result = await onDesbloquear(uid, cid)
    setMensaje(result?.success ? 'Alumno desbloqueado para nuevo ciclo' : 'Error al desbloquear')
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Intentos de Certificado</h3>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">User ID</label>
          <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="UUID del alumno" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#f5e100] focus:outline-none" />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Curso ID (opcional)</label>
          <input value={cursoId} onChange={e => setCursoId(e.target.value)} placeholder="UUID del curso" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#f5e100] focus:outline-none" />
        </div>
        <button onClick={handleBuscar} disabled={loading} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
          Buscar
        </button>
      </div>

      {mensaje && (
        <p className="text-sm text-green-400">{mensaje}</p>
      )}

      {intentos.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Ciclo</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Intento</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Puntos</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Estado</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Fecha</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {intentos.map(intento => (
                <tr key={intento.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-white text-sm">{intento.ciclo}</td>
                  <td className="px-4 py-3 text-white text-sm">{intento.intento_en_ciclo}</td>
                  <td className="px-4 py-3 text-[#f5e100] text-sm font-medium">{intento.puntos_otorgados?.toLocaleString() || '-'}</td>
                  <td className="px-4 py-3">
                    {intento.bloqueado ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400">Bloqueado</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400">Activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(intento.creado_en).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {intento.bloqueado && (
                      <button
                        onClick={() => handleDesbloquear(intento.user_id, intento.curso_id!)}
                        className="px-3 py-1 text-xs bg-amber-900/30 text-amber-400 rounded hover:bg-amber-900/50 transition-colors"
                      >
                        Desbloquear
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

