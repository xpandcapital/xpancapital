"use client"

import { useMemo } from 'react'
import type { Product } from '../_types'

interface InventoryStatusData {
  disponible: number
  bajoStock: number
  agotado: number
}

interface PerishableStats {
  total: number
  critical: number
  expired: number
}

interface AnalyticsData {
  inventoryValue: number
  lowStockCount: number
  outOfStockCount: number
  totalPhysicalItems: number
  inventoryStatusData: InventoryStatusData
  topCategoriesByStock: Array<{
    name: string
    stock: number
  }>
  perishableStats: PerishableStats
  totalProducts: number
}

interface UseProductAnalyticsReturn {
  analytics: AnalyticsData
  categoryStats: Array<{
    name: string
    count: number
    value: number
  }>
}

export function useProductAnalytics(
  products: Product[],
  categories: string[]
): UseProductAnalyticsReturn {
  const analytics = useMemo((): AnalyticsData => {
    const inventoryValue = products.reduce(
      (sum, p) => sum + (p.price * (p.stock === -1 ? 0 : p.stock)),
      0
    )

    const lowStockCount = products.filter(
      p => p.stock !== -1 && p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)
    ).length

    const outOfStockCount = products.filter(p => p.stock === 0).length

    const totalPhysicalItems = products.reduce(
      (sum, p) => sum + (p.stock === -1 ? 0 : p.stock),
      0
    )

    const inventoryStatusData: InventoryStatusData = {
      disponible: products.filter(
        p => p.stock > (p.lowStockThreshold || 10) || p.stock === -1
      ).length,
      bajoStock: lowStockCount,
      agotado: outOfStockCount
    }

    const topCategoriesByStock = categories
      .filter(c => c !== 'Todas')
      .map(c => {
        const catProducts = products.filter(p => p.category === c)
        const stock = catProducts.reduce(
          (sum, p) => sum + (p.stock === -1 ? 0 : p.stock),
          0
        )
        return { name: c, stock }
      })
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5)

    const perishableProducts = products.filter(
      p => p.isPerishable && p.expirationDate
    )

    const today = new Date()
    const criticalExp = perishableProducts.filter(p => {
      const expStr = p.expirationDate as string
      if (!expStr) return false
      const exp = new Date(expStr)
      const diff = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24)
      return diff > 0 && diff <= 15
    }).length

    const expiredCount = perishableProducts.filter(p => {
      const expStr = p.expirationDate as string
      if (!expStr) return false
      const exp = new Date(expStr)
      return exp < today
    }).length

    const perishableStats: PerishableStats = {
      total: perishableProducts.length,
      critical: criticalExp,
      expired: expiredCount
    }

    return {
      inventoryValue,
      lowStockCount,
      outOfStockCount,
      totalPhysicalItems,
      inventoryStatusData,
      topCategoriesByStock,
      perishableStats,
      totalProducts: products.length
    }
  }, [products, categories])

  const categoryStats = useMemo(() => {
    return categories
      .filter(c => c !== 'Todas')
      .map(c => {
        const catProducts = products.filter(p => p.category === c)
        return {
          name: c,
          count: catProducts.length,
          value: catProducts.reduce((sum, p) => sum + p.price, 0)
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [products, categories])

  return {
    analytics,
    categoryStats
  }
}