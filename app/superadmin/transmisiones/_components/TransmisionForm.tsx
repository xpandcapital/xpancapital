"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Radio, Globe, Clock, Users, Check, Search } from 'lucide-react'
import type { Transmision, TransmisionFormData } from '../_types'
import { PAGINAS_OPCIONES } from '../_types'

interface ProductoItem {
  id: string
  nombre: string
  imagen_principal?: string | null
}

interface TransmisionFormProps {
  activa: Transmision | null
  saving: boolean
  productos: ProductoItem[]
  onIniciar: (data: TransmisionFormData) => Promise<Transmision>
}

const TABS = [
  { value: 'publica' as const, icon: Radio, label: 'Pública', desc: 'Visible para todos en landing, tienda, blog, miembros' },
  { value: 'clase' as const, icon: Users, label: 'Clase Privada', desc: 'Solo miembros que compraron ciertos productos' },
]

export function TransmisionForm({ activa, saving, productos, onIniciar }: TransmisionFormProps) {
  const [tipo, setTipo] = useState<'publica' | 'clase'>('publica')
  const [titulo, setTitulo] = useState('Estamos en vivo')
  const [subtitulo, setSubtitulo] = useState('')
  const [link, setLink] = useState('')
  const [textoBoton, setTextoBoton] = useState('Ver Transmisión')
  const [duracion, setDuracion] = useState(60)
  const [paginas, setPaginas] = useState<string[]>(['landing', 'tienda', 'blog', 'miembros'])
  const [productosIds, setProductosIds] = useState<string[]>([])
  const [productoSearch, setProductoSearch] = useState('')
  const [error, setError] = useState('')

  const togglePagina = (value: string) => {
    setPaginas((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    )
  }

  const toggleProducto = (id: string) => {
    setProductosIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(productoSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!link.trim()) {
      setError('El link es obligatorio')
      return
    }

    if (tipo === 'clase' && productosIds.length === 0) {
      setError('Selecciona al menos un producto para la clase privada')
      return
    }

    try {
      await onIniciar({
        titulo: titulo.trim() || 'Estamos en vivo',
        subtitulo: subtitulo.trim() || '',
        link: link.trim(),
        texto_boton: textoBoton.trim() || 'Ver Transmisión',
        duracion_minutos: duracion,
        paginas: tipo === 'clase' ? ['miembros'] : paginas,
        tipo,
        color: tipo === 'publica' ? 'verde' : 'azul',
        productos_ids: tipo === 'clase' ? productosIds : [],
      })
    } catch (err: any) {
      setError(err.message || 'Error al iniciar la transmisión')
    }
  }

  if (activa) return null

  const accentColor = tipo === 'publica' ? 'emerald' : 'blue'
  const isClase = tipo === 'clase'

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-5"
    >
      {/* Tabs de tipo */}
      <div>
        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Tipo de transmisión</label>
        <div className="grid grid-cols-2 gap-2">
          {TABS.map((tab) => {
            const isActive = tipo === tab.value
            const activeAccent = tab.value === 'publica' ? 'emerald' : 'blue'
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setTipo(tab.value)
                  setProductosIds([])
                  setProductoSearch('')
                  if (tab.value === 'clase') {
                    setPaginas(['miembros'])
                    setSubtitulo('')
                    setTitulo('Clase en Vivo')
                    setTextoBoton('Ingresar a la Clase')
                  } else {
                    setPaginas(['landing', 'tienda', 'blog', 'miembros'])
                    setTitulo('Estamos en vivo')
                    setTextoBoton('Ver Transmisión')
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? `bg-${activeAccent}-500/10 border-${activeAccent}-500/30`
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className={`w-4 h-4 ${isActive ? `text-${activeAccent}-400` : 'text-gray-500'}`} />
                  <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                </div>
                <p className="text-[9px] text-gray-600 mt-1 leading-tight">{tab.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Campos comunes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Título *</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={`w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-${accentColor}-500/50 mt-1`}
            placeholder={isClase ? 'Clase en Vivo' : 'Estamos en vivo'}
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Subtítulo</label>
          <input
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            className={`w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-${accentColor}-500/50 mt-1`}
            placeholder={isClase ? 'Solo para alumnos' : 'Opcional'}
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          {isClase ? 'Link de la reunión (Zoom, Meet, etc.) *' : 'Link de la transmisión *'}
        </label>
        <div className="flex items-center gap-2 mt-1">
          <Globe className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className={`w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-${accentColor}-500/50`}
            placeholder={isClase ? 'https://zoom.us/j/...' : 'https://tiktok.com/@usuario/live'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Texto del botón *</label>
          <input
            value={textoBoton}
            onChange={(e) => setTextoBoton(e.target.value)}
            className={`w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-${accentColor}-500/50 mt-1`}
            placeholder={isClase ? 'Ingresar a la Clase' : 'Ver Transmisión'}
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
              className={`w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-${accentColor}-500/50`}
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Selector de páginas (solo pública) */}
      {!isClase && (
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
      )}

      {/* Selector de productos (solo clase) */}
      {isClase && (
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">
            Productos que dan acceso *
          </label>
          <p className="text-[10px] text-gray-600 mb-2">
            Solo los miembros que compraron estos productos verán la clase
          </p>

          {/* Search */}
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <input
              value={productoSearch}
              onChange={(e) => setProductoSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Productos seleccionados */}
          {productosIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {productosIds.map((pid) => {
                const prod = productos.find((p) => p.id === pid)
                return (
                  <span
                    key={pid}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold"
                  >
                    {prod?.nombre || pid.slice(0, 8)}
                    <button type="button" onClick={() => toggleProducto(pid)} className="hover:text-blue-200">
                      <Check className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {/* Lista de productos */}
          <div className="max-h-40 overflow-y-auto border border-white/5 rounded-lg divide-y divide-white/[0.03]">
            {productosFiltrados.length === 0 ? (
              <p className="text-center text-gray-600 text-[11px] py-6">No se encontraron productos</p>
            ) : (
              productosFiltrados.map((prod) => {
                const selected = productosIds.includes(prod.id)
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => toggleProducto(prod.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      selected ? 'bg-blue-500/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[7px] shrink-0 ${
                        selected
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-white/10 bg-transparent'
                      }`}
                    >
                      {selected ? '✓' : ''}
                    </div>
                    <span className={`text-[11px] font-bold truncate ${selected ? 'text-blue-400' : 'text-gray-400'}`}>
                      {prod.nombre}
                    </span>
                  </button>
                )
              })
            )}
          </div>
          <p className="text-[9px] text-gray-600 mt-1">
            {productosIds.length} producto{productosIds.length !== 1 ? 's' : ''} seleccionado{productosIds.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {isClase && (
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-[10px] text-blue-400 font-bold flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Banner azul visible solo en /miembros para compradores
          </p>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-[11px] bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
          isClase
            ? 'bg-blue-500 hover:bg-blue-400'
            : 'bg-emerald-500 hover:bg-emerald-400'
        }`}
      >
        {isClase ? <Users className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
        {saving ? 'Iniciando...' : isClase ? 'Iniciar Clase Privada' : 'Iniciar Transmisión en Vivo'}
      </button>
    </motion.form>
  )
}
