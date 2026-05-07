"use client"

import React from "react"
import { motion } from "framer-motion"
import { CheckSquare, Square, Edit2, Trash2, Barcode as BarcodeIcon } from "lucide-react"
import Image from "next/image"
import type { Product, Category, Status } from '../../_types'

interface ProductGridViewProps {
  products: Product[]
  selectedIds: string[]
  onToggleSelection: (id: string) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onPrintLabels: (product: Product) => void
  isBulkEditing: boolean
  onUpdateBulk: (id: string, field: string, value: string | number | boolean) => void
  categories: Category[]
  statuses: Status[]
  isBlisCoinsEnabled: boolean
}

export const ProductGridView = React.memo(function ProductGridView({
  products,
  selectedIds,
  onToggleSelection,
  onEdit,
  onDelete,
  onPrintLabels,
  isBulkEditing,
  onUpdateBulk,
  categories,
  statuses,
  isBlisCoinsEnabled
}: ProductGridViewProps) {
  const getStatusColor = (product: Product) => {
    const statusObj = statuses.find(s => s.name === product.status)
    return statusObj?.color || (product.status === 'Disponible' ? '#10b981' : '#ef4444')
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 p-6 bg-white/[0.01]">
      {products.map((product) => {
        const isSelected = selectedIds.includes(product.id)
        const statusColor = getStatusColor(product)

        return (
          <motion.div
            layout
            key={product.id}
            className={`group relative bg-zinc-950 border rounded-[2.5rem] overflow-hidden transition-all duration-500 flex flex-col h-full ${isSelected ? 'border-blis-red shadow-[0_0_30px_rgba(190,11,60,0.15)] bg-blis-red/[0.02]' : 'border-white/5 hover:border-white/10'}`}
          >
            <button
              onClick={() => onToggleSelection(product.id)}
              className={`absolute top-4 left-4 z-10 p-2 rounded-xl transition-all ${isSelected ? 'bg-blis-red text-white' : 'bg-black/40 text-gray-500'}`}
            >
              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>

            <div className="aspect-square relative overflow-hidden">
              <Image
                src={product.image?.startsWith('http') ? product.image : `/images/${product.image}`}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                unoptimized
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/111111/FFFFFF?text=' + product.name
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent opacity-40" />
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    {isBulkEditing ? (
                      <select
                        value={product.category}
                        onChange={(e) => onUpdateBulk(product.id, 'category', e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black text-blis-red uppercase tracking-widest w-full outline-none"
                      >
                        {categories.map(c => <option key={c.id} value={c.name} className="bg-zinc-900">{c.name}</option>)}
                      </select>
                    ) : (
                      <p className="text-[10px] font-black text-blis-red uppercase tracking-widest">{product.category}</p>
                    )}

                    {isBulkEditing ? (
                      <input
                        value={product.name}
                        onChange={(e) => onUpdateBulk(product.id, 'name', e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-white w-full outline-none focus:border-blis-red"
                      />
                    ) : (
                      <h3 className="text-white font-bold text-base leading-tight group-hover:text-blis-red transition-colors">{product.name}</h3>
                    )}
                  </div>

                  {!isBulkEditing && (
                      <span
                        className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/5 shrink-0"
                        style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
                      >
                        {product.status}
                      </span>
                    )}
                </div>

                {!isBulkEditing && (
                  <div className="flex items-center gap-2">
                    {product.bliscoins > 0 && isBlisCoinsEnabled ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-500 font-bold text-xs uppercase tracking-tighter opacity-50 line-through">
                          {product.price.toFixed(2)}
                        </span>
                        <span className="text-amber-500 font-black text-lg tracking-tighter leading-none uppercase">
                          <span className="mr-0.5 text-[10px]">B</span>{product.bliscoins}
                        </span>
                      </div>
                    ) : (
                      <span className="text-emerald-500 font-black text-lg tracking-tighter leading-none">
                        {product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isBulkEditing && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase font-black">Precio</span>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => onUpdateBulk(product.id, 'price', parseFloat(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-emerald-500 w-full outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase font-black">BlisCoins</span>
                    <input
                      type="number"
                      value={product.bliscoins}
                      onChange={(e) => onUpdateBulk(product.id, 'bliscoins', parseInt(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-amber-500 w-full outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] text-gray-500 uppercase font-black">Stock Actual</span>
                  {isBulkEditing ? (
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => onUpdateBulk(product.id, 'stock', parseInt(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-black text-white w-full max-w-[80px] outline-none"
                    />
                  ) : (
                    <span className="text-white font-black tracking-tight text-xs">
                      {product.stock === -1 ? <span className="text-xl leading-none">∞</span> : `${product.stock} Un.`}
                    </span>
                  )}
                </div>

                {isBulkEditing ? (
                  <div className="flex flex-col flex-1 items-end">
                    <span className="text-[9px] text-gray-500 uppercase font-black">Estado</span>
                    <select
                      value={product.status}
                      onChange={(e) => onUpdateBulk(product.id, 'status', e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black text-white w-full max-w-[100px] outline-none"
                    >
                      {statuses.map(s => <option key={s.id} value={s.name} className="bg-zinc-900">{s.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center justify-end">
                    <button onClick={() => onPrintLabels(product)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all shadow-lg" title="Etiquetas">
                      <BarcodeIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(product)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all shadow-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(product.id)} className="p-2.5 rounded-xl bg-white/5 hover:bg-blis-red/20 text-gray-400 hover:text-blis-red transition-all shadow-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
})