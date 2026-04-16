"use client"

import { useState, useMemo } from 'react'
import type { ApiApp, ApiCategory, ApiFilterState } from '../_types'

export function useApiFilters(categories: ApiCategory[], favorites: Set<string>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCost, setFilterCost] = useState<string | null>(null)
  const [filterAccess, setFilterAccess] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const filteredCategories = useMemo(() => {
    if (!searchQuery && !filterCost && !filterAccess && !showFavoritesOnly) {
      return categories
    }

    return categories.map(category => {
      const filteredApps = category.apps.filter(app => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const matchesName = app.name.toLowerCase().includes(query)
          const matchesDesc = app.description.toLowerCase().includes(query)
          const matchesFields = app.fields.some(f => 
            f.label.toLowerCase().includes(query) ||
            f.description.toLowerCase().includes(query)
          )
          if (!matchesName && !matchesDesc && !matchesFields) return false
        }

        // Cost filter
        if (filterCost && filterCost !== 'all') {
          const hasMatchingFields = app.fields.some(f => f.cost === filterCost)
          if (!hasMatchingFields) return false
        }

        // Access filter
        if (filterAccess && filterAccess !== 'all') {
          const hasMatchingFields = app.fields.some(f => f.accessType === filterAccess)
          if (!hasMatchingFields) return false
        }

        // Favorites filter
        if (showFavoritesOnly && !favorites.has(app.id)) {
          return false
        }

        return true
      })

      return { ...category, apps: filteredApps }
    }).filter(category => category.apps.length > 0)
  }, [categories, searchQuery, filterCost, filterAccess, showFavoritesOnly, favorites])

  const clearFilters = () => {
    setSearchQuery('')
    setFilterCost(null)
    setFilterAccess(null)
    setShowFavoritesOnly(false)
  }

  const hasActiveFilters = searchQuery || filterCost || filterAccess || showFavoritesOnly

  return {
    searchQuery,
    setSearchQuery,
    filterCost,
    setFilterCost,
    filterAccess,
    setFilterAccess,
    showFavoritesOnly,
    setShowFavoritesOnly,
    filteredCategories,
    clearFilters,
    hasActiveFilters
  }
}