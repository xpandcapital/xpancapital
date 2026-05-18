"use client"

import type { Product, ProductSort, Category, Status, Currency } from '../../_types'
import { ProductTableHeader } from './ProductTableHeader'
import { ProductTableRow } from './ProductTableRow'

interface ProductListViewProps {
  products: Product[]
  selectedIds: string[]
  onToggleSelection: (id: string, e?: React.MouseEvent) => void
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
  currencies: Currency[]
  selectedCurrency: Currency
  isMultiCurrencyEnabled: boolean
  activeCurrencyCodes: string[]
  isBlisCoinsEnabled: boolean
  skuPatterns: Array<{ id: string; prefix: string }>
  filteredCount: number
}

export function ProductListView({
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
  currencies,
  selectedCurrency,
  isMultiCurrencyEnabled,
  isBlisCoinsEnabled,
  skuPatterns,
  filteredCount
}: ProductListViewProps) {
  const allSelected = selectedIds.length === filteredCount && filteredCount > 0

  return (
    <table className="w-full text-left border-collapse min-w-[1100px]">
      <ProductTableHeader
        allSelected={allSelected}
        onToggleAll={onToggleAll}
        sortConfig={sortConfig}
        onSort={onSort}
      />
      <tbody className="divide-y divide-white/5">
        {products.map((product) => (
          <ProductTableRow
            key={product.id}
            product={product}
            isSelected={selectedIds.includes(product.id)}
            onToggleSelection={onToggleSelection}
            onEdit={onEdit}
            onDelete={onDelete}
            onPrintLabels={onPrintLabels}
            isBulkEditing={isBulkEditing}
            onUpdateBulk={onUpdateBulk}
            categories={categories}
            statuses={statuses}
            currencies={currencies}
            selectedCurrency={selectedCurrency}
            isMultiCurrencyEnabled={isMultiCurrencyEnabled}
            isBlisCoinsEnabled={isBlisCoinsEnabled}
            skuPatterns={skuPatterns}
          />
        ))}
      </tbody>
    </table>
  )
}