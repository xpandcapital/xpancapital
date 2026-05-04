"use client"

import { useState, useCallback } from 'react'

export function useApiState() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set())
  const [categoryOrder, setCategoryOrder] = useState<number[]>([])
  const [ideasModal, setIdeasModal] = useState<{ appId: string; appName: string } | null>(null)
  const [fallbackModal, setFallbackModal] = useState<{ groupId: string; apps: any[] } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }, [])

  const toggleApp = useCallback((appId: string) => {
    setExpandedApps(prev => {
      const next = new Set(prev)
      if (next.has(appId)) next.delete(appId)
      else next.add(appId)
      return next
    })
  }, [])

  const openIdeasModal = useCallback((appId: string, appName: string) => {
    setIdeasModal({ appId, appName })
  }, [])

  const closeIdeasModal = useCallback(() => {
    setIdeasModal(null)
  }, [])

  const openFallbackModal = useCallback((groupId: string, apps: any[]) => {
    setFallbackModal({ groupId, apps })
  }, [])

  const closeFallbackModal = useCallback(() => {
    setFallbackModal(null)
  }, [])

  const setCopied = useCallback((id: string | null) => {
    setCopiedId(id)
    if (id) {
      setTimeout(() => setCopiedId(null), 2000)
    }
  }, [])

  const moveCategory = useCallback((index: number, direction: 'up' | 'down', totalCategories: number) => {
    setCategoryOrder(prev => {
      const newOrder = [...prev]
      if (direction === 'up' && index > 0) {
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
      } else if (direction === 'down' && index < newOrder.length - 1) {
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      }
      localStorage.setItem('api_category_order', JSON.stringify(newOrder))
      return newOrder
    })
  }, [])

  const initCategoryOrder = useCallback((totalCategories: number) => {
    const saved = localStorage.getItem('api_category_order')
    if (saved) {
      const parsed = JSON.parse(saved) as number[]
      // Si hay categorías nuevas que no están en el orden guardado, agregarlas al final
      const existing = new Set(parsed)
      for (let i = 0; i < totalCategories; i++) {
        if (!existing.has(i)) parsed.push(i)
      }
      setCategoryOrder(parsed)
      localStorage.setItem('api_category_order', JSON.stringify(parsed))
    } else {
      setCategoryOrder(Array.from({ length: totalCategories }, (_, i) => i))
    }
  }, [])

  return {
    expandedCategories,
    expandedApps,
    categoryOrder,
    ideasModal,
    fallbackModal,
    copiedId,
    showFilters,
    toggleCategory,
    toggleApp,
    openIdeasModal,
    closeIdeasModal,
    openFallbackModal,
    closeFallbackModal,
    setCopied,
    moveCategory,
    initCategoryOrder,
    setShowFilters,
  }
}