"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Radio, Globe, Clock, Plus, X, Check, Users, Package } from 'lucide-react'
import type { Transmision } from '../_types'

interface ProductoItem {
  id: string
  nombre: string
}

interface TransmisionActivaProps {
  transmision: Transmision
  productos: ProductoItem[]
  onExtender: (id: string, minutos: number) => Promise<void>
  onCancelar: (id: string) => Promise<void>
}

function formatHora(iso: string | null | undefined): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function calcularRestante(finISO: string | null | undefined): number {
  if (!finISO) return 0
  const fin = new Date(finISO).getTime()
  const ahora = Date.now()
  return Math.max(0, Math.floor((fin - ahora) / 1000))
}

function formatearRestante(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TransmisionActiva({ transmision, productos, onExtender, onCancelar }: TransmisionActivaProps) {
  const [restante, setRestante] = useState(calcularRestante(transmision.fin))
  const [extenderCustom, setExtenderCustom] = useState('')
  const [extendiendo, setExtendiendo] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    setRestante(calcularRestante(transmision.fin))
    const interval = setInterval(() => {
      setRestante(calcularRestante(transmision.fin))
    }, 1000)
    return () => clearInterval(interval)
  }, [transmision.fin])

  const handleExtender = async (minutos: number) => {
    setExtendiendo(true)
    try {
      await onExtender(transmision.id, minutos)
    } finally {
      setExtendiendo(false)
    }
  }

  const handleCancelar = async () => {
    setCancelando(true)
    try {
      await onCancelar(transmision.id)
    } finally {
      setCancelando(false)
    }
  }

  if (restante <= 0 || !transmision.activo) return null

  const isClase = transmision.tipo === 'clase'
  const accentColor = isClase ? 'blue' : 'emerald'
  const productosAsociados = isClase
    ? (transmision.productos_ids || [])
        .map((pid) => productos.find((p) => p.id === pid)?.nombre)
        .filter(Boolean) as string[]
    : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-${accentColor}-500/[0.03] border border-${accentColor}-500/20 rounded-2xl p-6 space-y-5`}
      style={{
        backgroundColor: isClase ? 'rgba(59,130,246,0.03)' : 'rgba(16,185,129,0.03)',
        borderColor: isClase ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)',
      }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="p-2 rounded-xl"
          style={{ backgroundColor: isClase ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)' }}
        >
          {isClase ? (
            <Users className="w-5 h-5" style={{ color: '#60a5fa' }} />
          ) : (
            <Radio className="w-5 h-5" style={{ color: '#34d399' }} />
          )}
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-sm">
              {isClase ? 'Clase Privada Activa' : 'Transmisión Activa'}
            </h3>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase"
              style={{
                backgroundColor: isClase ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                color: isClase ? '#93c5fd' : '#6ee7b7',
              }}
            >
              {isClase ? 'Clase' : 'Pública'}
            </span>
          </div>
          <p className="text-[11px] font-bold" style={{ color: isClase ? '#60a5fa' : '#34d399' }}>
            EN VIVO · Inició {formatHora(transmision.inicio)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Título</p>
          <p className="text-white text-sm font-bold truncate">{transmision.titulo}</p>
          {transmision.subtitulo && (
            <p className="text-gray-400 text-[12px] truncate">{transmision.subtitulo}</p>
          )}
        </div>
        <div>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Link</p>
          <a
            href={transmision.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold hover:underline flex items-center gap-1 truncate"
            style={{ color: isClase ? '#60a5fa' : '#34d399' }}
          >
            <Globe className="w-3 h-3 shrink-0" />
            {transmision.link}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: isClase ? '#60a5fa' : '#34d399' }} />
            <span className="text-lg font-black font-mono" style={{ color: isClase ? '#60a5fa' : '#34d399' }}>
              {formatearRestante(restante)}
            </span>
          </div>
        </div>
      </div>

      {isClase && productosAsociados.length > 0 && (
        <div className="p-4 bg-black/30 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Productos con acceso</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {productosAsociados.map((nombre, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold"
              >
                {nombre}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Extender tiempo</p>
        <div className="flex flex-wrap gap-2">
          {[15, 30, 60].map((min) => (
            <button
              key={min}
              onClick={() => handleExtender(min)}
              disabled={extendiendo}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
              style={{
                backgroundColor: isClase ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                borderColor: isClase ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)',
                color: isClase ? '#60a5fa' : '#34d399',
                borderWidth: 1,
              }}
            >
              <Plus className="w-3 h-3" />+{min} min
            </button>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={extenderCustom}
              onChange={(e) => setExtenderCustom(e.target.value)}
              placeholder="N"
              className="w-12 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-white text-center focus:outline-none"
              min="1"
              style={{ outlineColor: isClase ? 'rgba(59,130,246,0.5)' : 'rgba(16,185,129,0.5)' }}
            />
            <button
              onClick={() => {
                const n = parseInt(extenderCustom)
                if (n > 0) {
                  handleExtender(n)
                  setExtenderCustom('')
                }
              }}
              disabled={extendiendo || !extenderCustom}
              className="px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              style={{
                backgroundColor: isClase ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                borderColor: isClase ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)',
                color: isClase ? '#60a5fa' : '#34d399',
                borderWidth: 1,
              }}
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleCancelar}
        disabled={cancelando}
        className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <X className="w-3.5 h-3.5" />
        {cancelando ? 'Finalizando...' : 'Finalizar Ahora'}
      </button>
    </motion.div>
  )
}
