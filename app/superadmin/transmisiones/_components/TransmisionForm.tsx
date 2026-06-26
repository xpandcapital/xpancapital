"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Radio, Globe, Clock, Hash } from 'lucide-react'
import type { Transmision, TransmisionFormData } from '../_types'
import { PAGINAS_OPCIONES } from '../_types'

interface TransmisionFormProps {
  activa: Transmision | null
  saving: boolean
  onIniciar: (data: TransmisionFormData) => Promise<Transmision>
}

export function TransmisionForm({ activa, saving, onIniciar }: TransmisionFormProps) {
  const [titulo, setTitulo] = useState('Estamos en vivo')
  const [subtitulo, setSubtitulo] = useState('')
  const [link, setLink] = useState('')
  const [textoBoton, setTextoBoton] = useState('Ver Transmisión')
  const [duracion, setDuracion] = useState(60)
  const [paginas, setPaginas] = useState<string[]>(['landing', 'tienda', 'blog', 'miembros'])
  const [error, setError] = useState('')

  const togglePagina = (value: string) => {
    setPaginas((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!link.trim()) {
      setError('El link es obligatorio')
      return
    }

    if (!duracion || duracion < 1) {
      setError('La duración debe ser al menos 1 minuto')
      return
    }

    if (paginas.length === 0) {
      setError('Selecciona al menos una página')
      return
    }

    try {
      await onIniciar({
        titulo: titulo.trim() || 'Estamos en vivo',
        subtitulo: subtitulo.trim() || '',
        link: link.trim(),
        texto_boton: textoBoton.trim() || 'Ver Transmisión',
        duracion_minutos: duracion,
        paginas,
      })
    } catch (err: any) {
      setError(err.message || 'Error al iniciar la transmisión')
    }
  }

  if (activa) return null

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-emerald-500/10">
          <Radio className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Iniciar Transmisión</h3>
          <p className="text-gray-500 text-[11px]">Configura los datos del banner en vivo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Título *</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 mt-1"
            placeholder="Estamos en vivo"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Subtítulo</label>
          <input
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 mt-1"
            placeholder="Opcional"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Link de la transmisión *</label>
        <div className="flex items-center gap-2 mt-1">
          <Globe className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            placeholder="https://tiktok.com/@usuario/live"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Texto del botón *</label>
          <input
            value={textoBoton}
            onChange={(e) => setTextoBoton(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 mt-1"
            placeholder="Ver Transmisión"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Duración (minutos) *</label>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              type="number"
              value={duracion}
              onChange={(e) => setDuracion(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              min="1"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Mostrar en</label>
        <div className="flex flex-wrap gap-2">
          {PAGINAS_OPCIONES.map((opcion) => (
            <button
              key={opcion.value}
              type="button"
              onClick={() => togglePagina(opcion.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                paginas.includes(opcion.value)
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-[11px] bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Radio className="w-4 h-4" />
        {saving ? 'Iniciando...' : 'Iniciar Transmisión en Vivo'}
      </button>
    </motion.form>
  )
}
