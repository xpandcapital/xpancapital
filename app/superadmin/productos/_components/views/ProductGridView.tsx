"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { CheckSquare, Square, Edit2, Trash2, Barcode as BarcodeIcon, Link2, ExternalLink, Check, GraduationCap } from "lucide-react"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import Image from "next/image"
import type { Product, Category, Status } from '../../_types'

const SITE_DOMAIN = 'xpandcapital.org'

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
  isxpandCoinsEnabled: boolean
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
  isxpandCoinsEnabled
}: ProductGridViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyLink = (product: Product) => {
    if (!product.shortSlug) return
    navigator.clipboard.writeText(`https://${SITE_DOMAIN}/s/${product.shortSlug}`)
    setCopiedId(product.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusColor = (product: Product) => {
    const statusObj = statuses.find(s => s.name === product.status)
    return statusObj?.color || (product.status === 'Disponible' ? '#10b981' : '#ef4444')
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 p-3 md:p-6 bg-white/[0.01]">
      {products.map((product) => {
        const isSelected = selectedIds.includes(product.id)
        const statusColor = getStatusColor(product)

        return (
          <motion.div
            layout
            key={product.id}
            className={`group relative bg-zinc-950 border rounded-[2.5rem] overflow-hidden transition-all duration-500 flex flex-col h-full ${isSelected ? 'border-blis-red shadow-[0_0_30px_rgba(213,193,8,0.15)] bg-blis-red/[0.02]' : 'border-white/5 hover:border-white/10'}`}
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

            <div className="p-3 md:p-4 space-y-2.5 md:space-y-3 flex-1 flex flex-col">
              <div className="flex-1 min-w-0">
                {isBulkEditing ? (
                  <SearchableSelect
                    value={product.category}
                    onChange={(value) => onUpdateBulk(product.id, 'category', value)}
                    options={categories.map(c => ({ value: c.name, label: c.name }))}
                    placeholder="Cat."
                    className="w-full"
                  />
                ) : (
                  <p className="text-[9px] font-black text-blis-red uppercase tracking-widest truncate">{product.category}</p>
                )}

                {isBulkEditing ? (
                  <input
                    value={product.name}
                    onChange={(e) => onUpdateBulk(product.id, 'name', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm font-bold text-white w-full outline-none focus:border-blis-red mt-1"
                  />
                ) : (
                  <h3 className="text-white font-bold text-sm md:text-base leading-tight group-hover:text-blis-red transition-colors mt-0.5">
                    {product.name}
                  </h3>
                )}

                {!isBulkEditing && product.curso && (
                  <div className="mt-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 w-fit max-w-full">
                    <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="truncate">{product.curso.nombre}</span>
                  </div>
                )}

                {!isBulkEditing && (
                  <div className="flex items-center gap-2 mt-1.5">
                    {product.xpandCoins > 0 && isxpandCoinsEnabled ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-gray-500 font-bold text-xs line-through opacity-50">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-amber-500 font-black text-base tracking-tighter leading-none">
                          <span className="text-[9px]">B</span>{product.xpandCoins}
                        </span>
                      </div>
                    ) : (
                      <span className="text-emerald-500 font-black text-base tracking-tighter leading-none">
                        ${product.price.toFixed(2)}
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
                    <span className="text-[10px] text-gray-500 uppercase font-black">Xpand Coins</span>
                    <input
                      type="number"
                      value={product.xpandCoins}
                      onChange={(e) => onUpdateBulk(product.id, 'xpandCoins', parseInt(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-amber-500 w-full outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2.5 md:pt-3 border-t border-white/5 flex items-center justify-between gap-1">
                {isBulkEditing ? (
                  <div className="flex flex-col flex-1">
                    <span className="text-[9px] text-gray-500 uppercase font-black">Stock</span>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => onUpdateBulk(product.id, 'stock', parseInt(e.target.value))}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-black text-white w-full max-w-[70px] outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center flex-1 min-w-0">
                    {product.stock === -1 ? (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Ilimitado
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-white/5 text-gray-300 border border-white/10">
                        {product.stock} un.
                      </span>
                    )}
                  </div>
                )}

                {isBulkEditing ? (
                  <div className="flex flex-col flex-1 items-end">
                    <span className="text-[9px] text-gray-500 uppercase font-black">Estado</span>
                    <SearchableSelect
                      value={product.status}
                      onChange={(value) => onUpdateBulk(product.id, 'status', value)}
                      options={statuses.map(s => ({ value: s.name, label: s.name }))}
                      className="w-full max-w-[90px]" buttonClassName="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black text-white outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex gap-0.5 md:gap-1 items-center flex-shrink-0">
                    <button onClick={() => onPrintLabels(product)} className="p-1 md:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Etiquetas">
                      <BarcodeIcon className="w-3 h-3" />
                    </button>
                    {product.shortSlug && (
                      <button
                        onClick={() => handleCopyLink(product)}
                        className="p-1 md:p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-all"
                        title="Copiar enlace corto"
                      >
                        {copiedId === product.id ? <Check className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                      </button>
                    )}
                    {product.slug && (
                      <a
                        href={`/tienda/producto/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 md:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                        title="Ver producto público"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button onClick={() => onEdit(product)} className="p-1 md:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => onDelete(product.id)} className="p-1 md:p-1.5 rounded-lg bg-white/5 hover:bg-blis-red/20 text-gray-400 hover:text-blis-red transition-all">
                      <Trash2 className="w-3 h-3" />
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


