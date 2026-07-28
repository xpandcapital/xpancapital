"use client"

import { CheckSquare, Square, ChevronUp, ChevronDown } from "lucide-react"
import type { ProductSort } from '../../_types'
import { useCurrency } from "@/context/CurrencyContext"

interface ProductTableHeaderProps {
  allSelected: boolean
  onToggleAll: () => void
  sortConfig: ProductSort
  onSort: (key: string) => void
}

export function ProductTableHeader({
  allSelected,
  onToggleAll,
  sortConfig,
  onSort
}: ProductTableHeaderProps) {
  const { isBlisCoinsEnabled } = useCurrency();
  const SortIndicator = ({ column }: { column: string }) => (
    <div className={`transition-all ${sortConfig.key === column ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-50'}`}>
      {sortConfig.key === column && sortConfig.direction === 'desc' 
        ? <ChevronDown className="w-3 h-3 text-blis-red" /> 
        : <ChevronUp className="w-3 h-3 text-blis-red" />}
    </div>
  )

  return (
    <thead>
      <tr className="text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 bg-white/[0.01]">
        <th className="px-4 py-6 w-[50px] text-center">
          <button onClick={onToggleAll} className={`p-1.5 rounded-lg transition-all ${allSelected ? 'bg-blis-red text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>
        </th>
        <th className="px-4 py-4 w-[320px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('name')}>
          <div className="flex items-center justify-center gap-2">
            Producto / SKU
            <SortIndicator column="name" />
          </div>
        </th>
        <th className="px-4 py-4 w-[130px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('category')}>
          <div className="flex items-center justify-center gap-2">
            Categoría
            <SortIndicator column="category" />
          </div>
        </th>
        <th className="px-2 py-4 w-[80px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('currencyCode')}>
          <div className="flex items-center gap-1 justify-center">
            Moneda
            <SortIndicator column="currencyCode" />
          </div>
        </th>
        <th className="px-4 py-4 w-[110px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('price')}>
          <div className="flex items-center justify-center gap-2">
            Precio
            <SortIndicator column="price" />
          </div>
        </th>
        {isBlisCoinsEnabled && (
        <th className="px-4 py-4 w-[100px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('bliscoins')}>
          <div className="flex items-center justify-center gap-2">
            Xpand Coins
            <SortIndicator column="bliscoins" />
          </div>
        </th>
        )}
        <th className="px-4 py-4 w-[110px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('stock')}>
          <div className="flex items-center justify-center gap-2">
            Stock
            <SortIndicator column="stock" />
          </div>
        </th>
        <th className="px-4 py-4 w-[130px] cursor-pointer hover:bg-white/[0.02] transition-colors group/th" onClick={() => onSort('status')}>
          <div className="flex items-center justify-center gap-2">
            Estado
            <SortIndicator column="status" />
          </div>
        </th>
        <th className="px-4 py-4 w-[140px] text-center">Acciones</th>
      </tr>
    </thead>
  )
}