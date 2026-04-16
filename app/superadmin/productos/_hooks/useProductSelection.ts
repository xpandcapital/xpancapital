"use client"

import { useState, useCallback } from 'react'
import type { Product } from '../_types'

interface UseProductSelectionReturn {
  selectedProducts: string[]
  setSelectedProducts: React.Dispatch<React.SetStateAction<string[]>>
  lastSelectedId: string | null
  isGlobalSelection: boolean
  setIsGlobalSelection: React.Dispatch<React.SetStateAction<boolean>>
  toggleProductSelection: (id: string, event?: React.MouseEvent) => void
  toggleAllSelection: (pageProducts: Product[]) => void
  handleSelectAllGlobal: (allFilteredProducts: Product[]) => void
  clearSelection: () => void
  selectedCount: number
}

export function useProductSelection(): UseProductSelectionReturn {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null)
  const [isGlobalSelection, setIsGlobalSelection] = useState(false)

  const toggleProductSelection = useCallback((id: string, event?: React.MouseEvent) => {
    if (event?.shiftKey && lastSelectedId !== null) {
      setSelectedProducts(prev => {
        return prev
      })
    }

    setSelectedProducts(prev => {
      const isSelecting = !prev.includes(id)
      if (isSelecting) {
        setLastSelectedId(id)
        return [...prev, id]
      }
      return prev.filter(pId => pId !== id)
    })
    setIsGlobalSelection(false)
  }, [lastSelectedId])

  const toggleAllSelection = useCallback((pageProducts: Product[]) => {
    const pageIds = pageProducts.map(p => p.id)
    const allPageSelected = pageIds.every(id => selectedProducts.includes(id))

    if (allPageSelected) {
      setSelectedProducts(prev => prev.filter(id => !pageIds.includes(id)))
      setIsGlobalSelection(false)
    } else {
      setSelectedProducts(prev => [...new Set([...prev, ...pageIds])])
    }
  }, [selectedProducts])

  const handleSelectAllGlobal = useCallback((allFilteredProducts: Product[]) => {
    setSelectedProducts(allFilteredProducts.map(p => p.id))
    setIsGlobalSelection(true)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedProducts([])
    setLastSelectedId(null)
    setIsGlobalSelection(false)
  }, [])

  return {
    selectedProducts,
    setSelectedProducts,
    lastSelectedId,
    isGlobalSelection,
    setIsGlobalSelection,
    toggleProductSelection,
    toggleAllSelection,
    handleSelectAllGlobal,
    clearSelection,
    selectedCount: selectedProducts.length
  }
}