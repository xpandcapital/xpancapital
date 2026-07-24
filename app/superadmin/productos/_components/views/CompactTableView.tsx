"use client"

import { useState } from "react"
import { CheckSquare, Square, ChevronUp, ChevronDown, Edit2, Trash2, Barcode as BarcodeIcon, Link2, ExternalLink, Check } from "lucide-react"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import type { Product, ProductSort, Category, Status, Currency } from '../../_types'

const SITE_DOMAIN = 'xpancapital.org'

interface CompactTableViewProps {
  products: Product[]
  selectedIds: string[]
  onToggleSelection: (id: string) => void
  onToggleAll: () => void
  sortConfig: ProductSort
  onSort: (key: string) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onPrintLabels: (product: Product) => void
  isBulkEditing: boolean
  onUpdateBulk: (id: string, field: string, value: string | number | boolean) => void
  categories: Category[]
  statuses: Status[]
  selectedCurrency: Currency
  isBlisCoinsEnabled: boolean
  filteredCount: number
}

export function CompactTableView({
  products,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onPrintLabels,
  isBulkEditing,
  onUpdateBulk,
  categories,
  statuses,
  selectedCurrency,
  isBlisCoinsEnabled,
  filteredCount
}: CompactTableViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyLink = (product: Product) => {
    if (!product.shortSlug) return
    navigator.clipboard.writeText(`https://${SITE_DOMAIN}/s/${product.shortSlug}`)
    setCopiedId(product.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const allSelected = selectedIds.length === filteredCount && filteredCount > 0

  const getCurrency = (code: string) => code || selectedCurrency.code

  const getStatusColor = (product: Product) => {
    const statusObj = statuses.find(s => s.name === product.status)
    return statusObj?.color || (product.status === 'Disponible' ? '#10b981' : product.status === 'Bajo Stock' ? '#f59e0b' : '#ef4444')
  }

  const SortIndicator = ({ column }: { column: string }) => (
    <div className={`transition-all ${sortConfig.key === column ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
      {sortConfig.key === column && sortConfig.direction === 'desc' 
        ? <ChevronDown className="w-2.5 h-2.5 text-blis-red" /> 
        : <ChevronUp className="w-2.5 h-2.5 text-blis-red" />}
    </div>
  )

  return (
    <table className="w-full" buttonClassName="text-left border-collapse min-w-[700px] lg:min-w-[1000px]">
      <thead>
        <tr className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
          <th className="px-4 py-3 w-10 text-center">
            <button onClick={onToggleAll} className={`p-1 rounded transition-all ${allSelected ? 'text-blis-red' : 'text-gray-700 hover:text-white'}`}>
              {allSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            </button>
          </th>
          <th className="px-4 py-3 w-20 cursor-pointer hover:bg-white/[0.02] transition- colors group/th" onClick={() => onSort('sku')}>
            <div className="flex items-center justify-center gap-2">
              SKU
              <SortIndicator column="sku" />
            </div>
          </th>
          <th className="px-4 py-3 min-w-[250px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('name')}>
            <div className="flex items-center justify-center gap-2">
              Nombre del Producto
              <SortIndicator column="name" />
            </div>
          </th>
          <th className="px-4 py-3 w-40 cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('category')}>
            <div className="flex items-center justify-center gap-2">
              Categoría
              <SortIndicator column="category" />
            </div>
          </th>
          <th className="px-4 py-3 w-16 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('currencyCode')}>Moneda</th>
          <th className="px-4 py-3 w-24 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('price')}>Precio</th>
          {isBlisCoinsEnabled && <th className="px-4 py-3 w-28 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('bliscoins')}>BlisCoins</th>}
          <th className="px-4 py-3 w-20 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('stock')}>Stock</th>
          <th className="px-4 py-3 w-32 text-center cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('status')}>
            <div className="flex items-center justify-center gap-2">
              Estado
              <SortIndicator column="status" />
            </div>
          </th>
          <th className="px-4 py-3 w-24 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/[0.03]">
        {products.map((product) => {
          const isSelected = selectedIds.includes(product.id)
          const statusColor = getStatusColor(product)

          return (
            <tr key={product.id} className={`group hover:bg-white/[0.04] transition-colors ${isSelected ? 'bg-blis-red/5' : ''}`}>
              <td className="px-4 py-2 text-center align-middle cursor-pointer" onClick={() => onToggleSelection(product.id)}>
                <div className={`p-1 rounded transition-all ${isSelected ? 'text-blis-red' : 'text-gray-700'}`}>
                  {isSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                </div>
              </td>
              <td className="px-4 py-2 align-middle">
                {isBulkEditing ? (
                  <input
                    value={product.sku}
                    onChange={(e) => onUpdateBulk(product.id, 'sku', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-gray-400 w-full outline-none focus:border-blis-red"
                  />
                ) : (
                  <span className="text-xs font-mono font-bold text-gray-500 group-hover:text-amber-500 transition-colors uppercase truncate block" title={product.sku}>{product.sku?.length > 16 ? product.sku.replace(/^(.{6}).+(.{4})$/, '$1…$2') : product.sku}</span>
                )}
              </td>
              <td className="px-4 py-2 align-middle truncate">
                {isBulkEditing ? (
                  <input
                    value={product.name}
                    onChange={(e) => onUpdateBulk(product.id, 'name', e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-white w-full outline-none focus:border-blis-red"
                  />
                ) : (
                  <span className="text-xs font-bold text-white group-hover:text-blis-red transition-colors whitespace-nowrap overflow-hidden text-ellipsis block">{product.name}</span>
                )}
              </td>
              <td className="px-4 py-2 align-middle">
                {isBulkEditing ? (
                  <SearchableSelect
                    value={product.category}
                    onChange={(value) => onUpdateBulk(product.id, 'category', value)}
                    options={categories.map(c => ({ value: c.name, label: c.name }))}
                    placeholder="Cat."
                    className="w-full"
                  />
                ) : (
                  <span className="text-xs font-black text-gray-400 uppercase tracking-tighter truncate block">{product.category}</span>
                )}
              </td>
              <td className="px-4 py-2 align-middle">
                <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter">{getCurrency(product.currencyCode)}</span>
              </td>
              <td className="px-4 py-2 align-middle">
                {isBulkEditing ? (
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => onUpdateBulk(product.id, 'price', parseFloat(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-emerald-500 w-full outline-none focus:border-emerald-500"
                  />
                ) : (
                  <span className="text-xs font-black text-emerald-500 whitespace-nowrap">
                    {product.price.toFixed(2)}
                  </span>
                )}
              </td>
              {isBlisCoinsEnabled && <td className="px-4 py-2 align-middle">
                {isBulkEditing ? (
                  <input
                    type="number"
                    value={product.bliscoins}
                    onChange={(e) => onUpdateBulk(product.id, 'bliscoins', parseInt(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-amber-500 w-full outline-none focus:border-amber-500"
                  />
                ) : (
                  <span className="text-xs font-black text-amber-500 uppercase tracking-tighter">{product.bliscoins || '-'}</span>
                )}
              </td>}
              <td className="px-4 py-2 align-middle">
                {isBulkEditing ? (
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => onUpdateBulk(product.id, 'stock', parseInt(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-gray-300 w-full outline-none focus:border-white/30"
                  />
                ) : (
                  <span className={`text-xs font-black whitespace-nowrap ${product.stock === 0 ? 'text-red-500' : 'text-gray-300'}`}>
                    {product.stock === -1 ? '∞' : product.stock}
                  </span>
                )}
              </td>
              <td className="px-4 py-2 align-middle text-left">
                {isBulkEditing ? (
                  <SearchableSelect
                    value={product.status}
                    onChange={(value) => onUpdateBulk(product.id, 'status', value)}
                    options={statuses.map(s => ({ value: s.name, label: s.name }))}
                    className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-sm text-gray-300 w-full outline-none focus:border-blis-red"
                  />
                ) : (
                  <div className="flex items-center justify-start gap-1.5 whitespace-nowrap">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_5px_currentColor]"
                      style={{ backgroundColor: statusColor, color: statusColor }}
                    />
                    <span className="text-xs font-black uppercase tracking-tighter whitespace-nowrap" style={{ color: statusColor }}>
                      {product.status}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-4 py-2 align-middle text-center bg-white/[0.01]">
                <div className="flex items-center justify-center gap-2 transition-opacity px-6">
                  <button onClick={() => onPrintLabels(product)} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Etiquetas">
                    <BarcodeIcon className="w-4 h-4" />
                  </button>
                  {product.shortSlug && (
                    <button
                      onClick={() => handleCopyLink(product)}
                      className="p-1.5 text-gray-500 hover:text-emerald-400 transition-colors"
                      title="Copiar enlace corto"
                    >
                      {copiedId === product.id ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {product.slug && (
                    <a
                      href={`/tienda/producto/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-white transition-colors"
                      title="Ver producto público"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={() => onEdit(product)} className="p-1.5 text-gray-500 hover:text-white transition-colors" title="Editar">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(product.id)} className="p-1.5 text-gray-500 hover:text-red-500 transition-all" title="Eliminar">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
