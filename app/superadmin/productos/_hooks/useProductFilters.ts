"use client"

import { useState, useMemo, useCallback } from 'react'
import type { Product, ProductFilters, ProductSort } from '../_types'

interface UseProductFiltersReturn {
  filters: ProductFilters
  setFilters: React.Dispatch<React.SetStateAction<ProductFilters>>
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  categoryFilters: string[]
  setCategoryFilters: React.Dispatch<React.SetStateAction<string[]>>
  sortConfig: ProductSort
  setSortConfig: React.Dispatch<React.SetStateAction<ProductSort>>
  handleSort: (key: string) => void
  filteredProducts: Product[]
  sortedProducts: Product[]
  normalizeText: (text: string) => string
}

export function useProductFilters(products: Product[]): UseProductFiltersReturn {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilters, setCategoryFilters] = useState<string[]>(['Todas'])
  const [sortConfig, setSortConfig] = useState<ProductSort>({ key: '', direction: null })

  const normalizeText = useCallback((text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const search = normalizeText(searchTerm)
      const matchesSearch =
        normalizeText(p.name).includes(search) ||
        normalizeText(p.category).includes(search) ||
        normalizeText(p.sku).includes(search) ||
        normalizeText(p.currencyCode || 'USD').includes(search)

      const matchesCategory = categoryFilters.includes('Todas') || categoryFilters.includes(p.category)

      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilters, normalizeText])

  const sortedProducts = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredProducts
    }

    return [...filteredProducts].sort((a: Product, b: Product) => {
      let aValue = a[sortConfig.key as keyof Product]
      let bValue = b[sortConfig.key as keyof Product]

      if (sortConfig.key === 'currencyCode') {
        aValue = a.currencyCode || 'USD'
        bValue = b.currencyCode || 'USD'
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue
      }

      const aString = String(aValue || '').toLowerCase()
      const bString = String(bValue || '').toLowerCase()

      return sortConfig.direction === 'asc'
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString)
    })
  }, [filteredProducts, sortConfig])

  const handleSort = useCallback((key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' }
        return { key: '', direction: null }
      }
      return { key, direction: 'asc' }
    })
  }, [])

  const setFilters = useCallback((newFilters: React.SetStateAction<ProductFilters>) => {
    if (typeof newFilters === 'function') {
      const filters = newFilters({ searchTerm, categoryFilters } as ProductFilters)
      setSearchTerm(filters.searchTerm)
      setCategoryFilters(filters.categoryFilters)
    } else {
      setSearchTerm(newFilters.searchTerm)
      setCategoryFilters(newFilters.categoryFilters)
    }
  }, [searchTerm, categoryFilters])

  return {
    filters: { searchTerm, categoryFilters },
    setFilters,
    searchTerm,
    setSearchTerm,
    categoryFilters,
    setCategoryFilters,
    sortConfig,
    setSortConfig,
    handleSort,
    filteredProducts,
    sortedProducts,
    normalizeText
  }
}