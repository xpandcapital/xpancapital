"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Store, DollarSign, Coins, Tag, ImageIcon, ChevronDown, ChevronUp, Link2, Unlink2, RefreshCw } from "lucide-react"
import type { Course } from "../_types"

interface Props {
  course: Course
  onUpdate: (c: Course) => void
}

export function TiendaSection({ course, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(course.venderEnTienda)
  const [mostrarSelector, setMostrarSelector] = useState(false)
  const [productosDisponibles, setProductosDisponibles] = useState<Array<{ id: string; nombre: string }>>([])

  useEffect(() => {
    setExpanded(course.venderEnTienda)
  }, [course.venderEnTienda])

  useEffect(() => {
    fetch('/api/productos?all=true&limit=500')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setProductosDisponibles(d.data.map((p: any) => ({ id: p.id, nombre: p.nombre })))
        }
      })
      .catch(() => {})
  }, [])

  const toggle = (v: boolean) => {
    setExpanded(v)
    onUpdate({ ...course, venderEnTienda: v, linkProductoId: v ? course.linkProductoId : null })
  }

  const vincularProductoExistente = (productoId: string) => {
    const producto = productosDisponibles.find(p => p.id === productoId)
    onUpdate({
      ...course,
      venderEnTienda: true,
      linkProductoId: productoId,
      productoId: productoId,
      productoNombre: producto?.nombre || null
    })
    setMostrarSelector(false)
  }

  const desvincularProducto = () => {
    onUpdate({
      ...course,
      venderEnTienda: false,
      linkProductoId: null,
      productoId: null,
      productoNombre: null
    })
  }

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
      {/* Header */}
      <button
        onClick={() => toggle(!course.venderEnTienda)}
        className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            course.venderEnTienda ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/10'
          }`}>
            <Store className={`w-5 h-5 ${course.venderEnTienda ? 'text-emerald-400' : 'text-gray-500'}`} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">Vender en Tienda</p>
            <p className="text-[11px] text-gray-500">
              {course.productoNombre
                ? `Vinculado a: "${course.productoNombre}"`
                : course.venderEnTienda
                  ? 'Se creará un producto automáticamente al guardar'
                  : 'Activar para crear un producto vinculado a este curso'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); toggle(!course.venderEnTienda) }}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              course.venderEnTienda ? 'bg-emerald-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
              animate={{ left: course.venderEnTienda ? '1.375rem' : '0.125rem' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          {course.venderEnTienda
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </div>
      </button>

      {/* Expandable fields */}
      {course.venderEnTienda && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-white/10 px-5 md:px-6 py-5 space-y-4"
        >
          <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">
            Información del producto en tienda
          </p>

          {/* Producto vinculado actual */}
          {course.productoId && course.productoNombre && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2 min-w-0">
                <Link2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-emerald-300 truncate">
                  {course.productoNombre}
                </span>
              </div>
              <button
                onClick={desvincularProducto}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                title="Desvincular producto"
              >
                <Unlink2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Selector de producto existente */}
          {productosDisponibles.length > 0 && (
            <div>
              {!mostrarSelector ? (
                <button
                  onClick={() => setMostrarSelector(true)}
                  className="w-full flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-xs text-gray-400 hover:text-purple-400"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {course.productoId
                    ? 'Vincular a otro producto existente...'
                    : 'Vincular a un producto existente en lugar de crear uno nuevo...'}
                </button>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">
                      Seleccionar producto existente
                    </span>
                    <button
                      onClick={() => setMostrarSelector(false)}
                      className="text-[10px] text-gray-500 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                  <select
                    value={course.linkProductoId || ''}
                    onChange={(e) => {
                      if (e.target.value) vincularProductoExistente(e.target.value)
                    }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
                  >
                    <option value="" className="bg-zinc-900">Seleccionar producto...</option>
                    {productosDisponibles
                      .filter(p => p.id !== course.productoId)
                      .map(p => (
                        <option key={p.id} value={p.id} className="bg-zinc-900">{p.nombre}</option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                <DollarSign className="w-3 h-3 inline mr-1" />
                Precio USD
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={course.price || ''}
                onChange={(e) => onUpdate({ ...course, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                <Coins className="w-3 h-3 inline mr-1" />
                BLISCOINS
              </label>
              <input
                type="number"
                min="0"
                value={course.bliscoins || ''}
                onChange={(e) => onUpdate({ ...course, bliscoins: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <ImageIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">
                La imagen de portada del curso se usará automáticamente en la tienda.
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                Podrás editarla después desde la sección de Productos.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
