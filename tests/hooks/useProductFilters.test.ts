import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProductFilters } from '../../app/superadmin/productos/_hooks/useProductFilters'
import type { Product } from '../../app/superadmin/productos/_types'

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'SKU-001',
    skuPrefix: 'SKU',
    isAutoSku: false,
    name: 'Producto A',
    category: 'Electrónicos',
    price: 100,
    originalPrice: 100,
    discountPercentage: 0,
    discountUntil: '',
    bliscoins: 0,
    isBlisCoinsOnly: false,
    stock: 10,
    lowStockThreshold: 5,
    status: 'Disponible',
    image: '',
    description: 'Descripción A',
    currencyCode: 'USD',
    isPerishable: false,
    purchaseDate: '',
    expirationDate: '',
    perishableHandling: 'discard',
    batchUid: '',
    precios_multimoneda: {},
    slug: 'producto-a',
    shortSlug: '',
    metaDescripcion: '',
    metaTitulo: '',
  },
  {
    id: '2',
    sku: 'SKU-002',
    skuPrefix: 'SKU',
    isAutoSku: false,
    name: 'Producto B',
    category: 'Ropa',
    price: 200,
    originalPrice: 200,
    discountPercentage: 0,
    discountUntil: '',
    bliscoins: 0,
    isBlisCoinsOnly: false,
    stock: 5,
    lowStockThreshold: 5,
    status: 'Bajo Stock',
    image: '',
    description: 'Descripción B',
    currencyCode: 'USD',
    isPerishable: false,
    purchaseDate: '',
    expirationDate: '',
    perishableHandling: 'discard',
    batchUid: '',
    precios_multimoneda: {},
    slug: 'producto-b',
    shortSlug: '',
    metaDescripcion: '',
    metaTitulo: '',
  },
  {
    id: '3',
    sku: 'SKU-003',
    skuPrefix: 'SKU',
    isAutoSku: false,
    name: 'Producto C',
    category: 'Electrónicos',
    price: 300,
    originalPrice: 300,
    discountPercentage: 0,
    discountUntil: '',
    bliscoins: 0,
    isBlisCoinsOnly: false,
    stock: 0,
    lowStockThreshold: 5,
    status: 'Agotado',
    image: '',
    description: 'Descripción C',
    currencyCode: 'USD',
    isPerishable: false,
    purchaseDate: '',
    expirationDate: '',
    perishableHandling: 'discard',
    batchUid: '',
    precios_multimoneda: {},
    slug: 'producto-c',
    shortSlug: '',
    metaDescripcion: '',
    metaTitulo: '',
  },
]

describe('useProductFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts))

    expect(result.current.searchTerm).toBe('')
    expect(result.current.categoryFilters).toEqual(['Todas'])
    expect(result.current.sortConfig.key).toBe('')
    expect(result.current.sortConfig.direction).toBe(null)
  })

  it('should filter products by search query', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts))

    act(() => {
      result.current.setSearchTerm('Producto A')
    })

    expect(result.current.filteredProducts.length).toBe(1)
    expect(result.current.filteredProducts[0].name).toBe('Producto A')
  })

  it('should filter products by category', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts))

    act(() => {
      result.current.setCategoryFilters(['Electrónicos'])
    })

    expect(result.current.filteredProducts.length).toBe(2)
    expect(result.current.filteredProducts.every(p => p.category === 'Electrónicos')).toBe(true)
  })

  it('should clear all filters', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts))

    act(() => {
      result.current.setSearchTerm('test')
      result.current.setCategoryFilters(['Electrónicos'])
    })

    expect(result.current.searchTerm).toBe('test')
    expect(result.current.categoryFilters).toEqual(['Electrónicos'])

    act(() => {
      result.current.setSearchTerm('')
      result.current.setCategoryFilters(['Todas'])
    })

    expect(result.current.searchTerm).toBe('')
    expect(result.current.categoryFilters).toEqual(['Todas'])
  })
})