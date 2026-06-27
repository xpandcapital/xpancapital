"use client"

import { useState } from "react"
import { CheckSquare, Square, Edit2, Trash2, Barcode as BarcodeIcon, Link2, ExternalLink, Check } from "lucide-react"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import type { Product, Category, Status, Currency } from '../../_types'

const SITE_DOMAIN = 'blis-corp.com'

interface ProductTableRowProps {
  product: Product
  isSelected: boolean
  onToggleSelection: (id: string, e?: React.MouseEvent) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onPrintLabels: (product: Product) => void
  isBulkEditing: boolean
  onUpdateBulk: (id: string, field: string, value: string | number | boolean) => void
  categories: Category[]
  statuses: Status[]
  currencies: Currency[]
  selectedCurrency: Currency
  isMultiCurrencyEnabled: boolean
  isBlisCoinsEnabled: boolean
  skuPatterns: Array<{ id: string; prefix: string }>
}

export function ProductTableRow({
  product,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
  onPrintLabels,
  isBulkEditing,
  onUpdateBulk,
  categories,
  statuses,
  currencies,
  selectedCurrency,
  isMultiCurrencyEnabled,
  isBlisCoinsEnabled,
  skuPatterns
}: ProductTableRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    if (!product.shortSlug) return
    navigator.clipboard.writeText(`https://${SITE_DOMAIN}/s/${product.shortSlug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getCurrency = (code: string) => currencies.find(c => c.code === code) || selectedCurrency

  const getStatusColor = (product: Product) => {
    const statusObj = statuses.find(s => s.name === product.status)
    return statusObj?.color || (product.status === 'Disponible' ? '#10b981' : product.status === 'Bajo Stock' ? '#f59e0b' : '#ef4444')
  }

const currency = getCurrency(product.currencyCode || selectedCurrency.code)
const statusColor = getStatusColor(product)

return (
    <tr className={`group hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-white/[0.03]' : ''}`}>
      <td className="px-4 py-6 align-middle w-12 text-center cursor-pointer" onClick={(e) => onToggleSelection(product.id, e)}>
        <div className={`p-1.5 rounded-lg transition-all inline-flex ${isSelected ? 'bg-blis-red text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        </div>
      </td>

      <td className="px-4 py-3 align-middle min-w-[280px]">
        <div className="flex items-center gap-3">
          {!isBulkEditing && (
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative flex-shrink-0 group-hover:scale-110 transition-transform">
              <img
                src={product.image?.startsWith('http') ? product.image : `/images/${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/111111/FFFFFF?text=' + product.name.charAt(0)
                }}
              />
            </div>
          )}
          <div className="flex flex-col flex-1 gap-1">
            {isBulkEditing ? (
              <>
                <input
                  value={product.name}
                  onChange={(e) => onUpdateBulk(product.id, 'name', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-full focus:border-blis-red outline-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={product.isAutoSku}
                    onChange={(e) => onUpdateBulk(product.id, 'isAutoSku', e.target.checked)}
                    className="accent-blue-500 w-3 h-3 flex-shrink-0"
                    title="Auto SKU"
                  />
                  <SearchableSelect
                    value={product.skuPrefix || product.sku?.split('-')[0] || 'SKU'}
                    onChange={(value) => onUpdateBulk(product.id, 'skuPrefix', value)}
                    options={[
                      ...categories.map(c => ({ value: c.skuPrefix, label: c.skuPrefix })),
                      ...skuPatterns.map(p => ({ value: p.prefix, label: p.prefix }))
                    ]}
                    className="bg-zinc-900 border border-white/10 rounded px-1.5 py-1 text-sm font-black text-blue-400 outline-none w-[80px] text-center"
                  />
                  <input
                    value={product.sku}
                    disabled={product.isAutoSku}
                    onChange={(e) => onUpdateBulk(product.id, 'sku', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-gray-400 w-full disabled:opacity-50 outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <span className="text-xs text-white font-bold group-hover:text-blis-red transition-colors whitespace-nowrap overflow-hidden text-ellipsis block">{product.name}</span>
                <span className="text-[11px] text-blue-400 font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis block" title={product.sku}>{product.sku?.length > 16 ? product.sku.replace(/^(.{6}).+(.{4})$/, '$1…$2') : product.sku}</span>
              </>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3 align-middle w-32">
        {isBulkEditing ? (
          <SearchableSelect
            value={product.category}
            onChange={(value) => onUpdateBulk(product.id, 'category', value)}
            options={categories.map(c => ({ value: c.name, label: c.name }))}
            placeholder="Cat."
            className="w-full"
          />
        ) : (
          <span className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-[11px] text-gray-300 whitespace-nowrap inline-block">
            {product.category}
          </span>
        )}
      </td>

      <td className="px-2 py-3 align-middle w-[80px] text-[11px] font-black text-emerald-500 uppercase tracking-tighter text-left">
        <div className="flex justify-start">
          <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-1 rounded-lg">
            {product.currencyCode || selectedCurrency.code}
          </span>
        </div>
      </td>

      <td className="px-4 py-3 align-middle w-28">
        {isBulkEditing ? (
          <div className="flex flex-col gap-2 min-w-[120px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-emerald-500">{currency.symbol}</span>
              </div>
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => onUpdateBulk(product.id, 'price', parseFloat(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-black text-white outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="0.00"
                />
                {isMultiCurrencyEnabled && (
                    <SearchableSelect
                      value={product.currencyCode || selectedCurrency.code}
                      onChange={(value) => onUpdateBulk(product.id, 'currencyCode', value)}
                      options={currencies.map(c => ({ value: c.code, label: c.code }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-900 border border-white/10 rounded px-1 py-0.5 text-[7px] font-black text-emerald-400 outline-none cursor-pointer"
                    />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-white font-black text-[13px] whitespace-nowrap">
              {product.price.toFixed(2)}
            </span>
          </div>
        )}
      </td>

      <td className="px-4 py-3 align-middle w-20">
        {isBulkEditing ? (
          isBlisCoinsEnabled && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-amber-500">B</span>
              </div>
              <input
                type="number"
                value={product.bliscoins}
                onChange={(e) => onUpdateBulk(product.id, 'bliscoins', parseInt(e.target.value))}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-black text-white outline-none focus:border-amber-500/50 transition-all"
                placeholder="0"
              />
            </div>
          )
        ) : (
          product.bliscoins > 0 && isBlisCoinsEnabled ? (
            <span className="bg-amber-500/10 border border-emerald-500/0 px-2.5 py-1 rounded-lg text-[11px] font-black text-amber-500 whitespace-nowrap">
              {product.bliscoins}
            </span>
          ) : (
            <span className="text-gray-500 text-[9px] font-black uppercase tracking-tighter">-</span>
          )
        )}
      </td>

      <td className="px-4 py-3 align-middle w-28">
        {isBulkEditing ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-gray-500 w-8">STOCK</span>
              <input
                type="number"
                value={product.stock}
                onChange={(e) => onUpdateBulk(product.id, 'stock', parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-20 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-gray-500 w-8">ALERTA</span>
              <input
                type="number"
                value={product.lowStockThreshold}
                onChange={(e) => onUpdateBulk(product.id, 'lowStockThreshold', parseInt(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white w-20 outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 min-w-[100px]">
            {product.stock === -1 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-black text-cyan-400 uppercase whitespace-nowrap w-fit">
                ∞ Ilimitado
              </span>
            ) : (
              <>
                <div className="flex justify-between text-[11px] font-black uppercase text-gray-500">
                  <span className="whitespace-nowrap">{product.stock} un.</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${product.stock === 0 ? 'bg-red-500' : product.stock <= (product.lowStockThreshold || 15) ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </td>

      <td className="px-4 py-3 align-middle min-w-[120px]">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border border-white/5 whitespace-nowrap"
          style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
          {product.status}
        </span>
      </td>

      <td className="px-4 py-3 align-middle w-[140px] text-center">
        <div className="flex items-center justify-center gap-2 text-gray-400 transition-all opacity-100 flex-nowrap shrink-0">
          <button onClick={() => onPrintLabels(product)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all transform hover:scale-110 shrink-0" title="Generar Etiquetas (Barras)">
            <BarcodeIcon className="w-4 h-4" />
          </button>
          {product.shortSlug && (
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition-all transform hover:scale-110 shrink-0"
              title="Copiar enlace corto"
            >
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            </button>
          )}
          {product.slug && (
            <a
              href={`/tienda/producto/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all transform hover:scale-110 shrink-0"
              title="Ver producto público"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button onClick={() => onEdit(product)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all transform hover:scale-110 shrink-0">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(product.id)} className="p-2 rounded-xl bg-white/5 hover:bg-blis-red/20 text-gray-400 hover:text-blis-red transition-all transform hover:scale-110">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}