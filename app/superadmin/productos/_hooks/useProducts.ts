"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Product, ProductFormData } from '../_types'

interface UseProductsReturn {
  products: Product[]
  initialProducts: Product[]
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  createProduct: (data: ProductFormData) => Promise<Product | null>
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  deleteProducts: (ids: string[]) => Promise<void>
  updateProductBulk: (id: string, field: string, value: unknown) => Promise<void>
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  setInitialProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [initialProducts, setInitialProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapProductFromApi = (p: Record<string, unknown>): Product => ({
    id: p.id as string,
    sku: (p.sku as string) || `SKU-${(p.id as string).substring(0, 6).toUpperCase()}`,
    skuPrefix: (p.sku_prefix as string) || 'SKU',
    isAutoSku: (p.is_auto_sku as boolean) !== false,
    name: p.nombre as string,
    slug: (p.slug as string) || '',
    shortSlug: (p.shortSlug as string) || '',
    category: (p.categoria as Record<string, unknown>)?.nombre as string || 'Capacitaciones',
    price: (p.precio_usd as number) || 0,
    originalPrice: (p.precio_comparacion as number) || (p.precio_usd as number) || 0,
    discountPercentage: (p.descuento_porcentaje as number) || 0,
    discountUntil: (p.descuento_hasta as string) || '',
    xpandCoins: (p.precio_coins as number) || 0,
    isxpandCoinsOnly: (p.metodo_pago as string) === 'coins',
    stock: (p.stock_ilimitado as boolean) ? -1 : (p.stock as number) || 0,
    lowStockThreshold: (p.stock_bajo_nivel as number) || 10,
    status: (p.stock_ilimitado as boolean)
      ? 'Ilimitado'
      : (p.stock as number) === 0
        ? 'Agotado'
        : (p.stock as number) <= ((p.stock_bajo_nivel as number) || 10)
          ? 'Bajo Stock'
          : 'Disponible',
    image: (p.imagen_principal as string) || '/images/placeholder-product.jpg',
    description: (p.descripcion as string) || '',
    metaDescripcion: (p.meta_descripcion as string) || '',
    metaTitulo: (p.meta_titulo as string) || '',
    currencyCode: 'USD',
    precios_multimoneda: (p.precios_multimoneda as Record<string, number>) || {},
    isPerishable: (p.es_perecedero as boolean) || false,
    purchaseDate: (p.fecha_compra as string) || '',
    expirationDate: (p.fecha_vencimiento as string) || '',
    perishableHandling: (p.manejo_perecedero as 'discard' | 'reimburse') || 'discard',
    batchUid: (p.lote_uid as string) || '',
    categoria_id: (p.categoria_id as string) || undefined,
    curso_id: (p.curso_id as string) || null,
    curso: (p.curso as { id: string; nombre: string }) || null
  })

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/productos?all=true')
      const data = await res.json()
      if (data.success && data.data) {
        const shortLinksMap: Record<string, string> = data.shortLinksMap || {}
        const mapped = data.data.map((p: Record<string, unknown>) => {
          const product = mapProductFromApi(p)
          const slug = (p.slug as string) || ''
          if (slug && shortLinksMap[slug]) {
            product.shortSlug = shortLinksMap[slug]
          }
          return product
        })
        setProducts(mapped)
        setInitialProducts(mapped)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching products')
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createProduct = useCallback(async (data: ProductFormData): Promise<Product | null> => {
    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || 'Error creating product')
      }
      await fetchProducts()
      return mapProductFromApi(result.data)
    } catch (err) {
      console.error('Error creating product:', err)
      throw err
    }
  }, [fetchProducts])

  const updateProduct = useCallback(async (id: string, data: Partial<ProductFormData>): Promise<void> => {
    try {
      const res = await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || 'Error updating product')
      }
      await fetchProducts()
    } catch (err) {
      console.error('Error updating product:', err)
      throw err
    }
  }, [fetchProducts])

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/productos?id=${id}`, {
        method: 'DELETE'
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || 'Error deleting product')
      }
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting product:', err)
      throw err
    }
  }, [])

  const deleteProducts = useCallback(async (ids: string[]): Promise<void> => {
    try {
      await Promise.all(ids.map(id => deleteProduct(id)))
    } catch (err) {
      console.error('Error deleting products:', err)
      throw err
    }
  }, [deleteProduct])

  const updateProductBulk = useCallback(async (id: string, field: string, value: unknown): Promise<void> => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value }
        
        if ((field === 'category' || field === 'skuPrefix') && updated.isAutoSku) {
          const prefix = field === 'skuPrefix' 
            ? (value as string) 
            : (updated.skuPrefix || 'SKU')
          updated.skuPrefix = prefix
          updated.sku = `${prefix}-${id.substring(0, 4).toUpperCase()}`
        }
        
        if (field === 'isAutoSku' && value === true) {
          const prefix = updated.skuPrefix || 'SKU'
          updated.sku = `${prefix}-${id.substring(0, 4).toUpperCase()}`
        }
        
        if (field === 'stock' || field === 'lowStockThreshold') {
          const s = updated.stock
          const t = updated.lowStockThreshold
          updated.status = s === -1 
            ? 'Ilimitado' 
            : s === 0 
              ? 'Agotado' 
              : s <= t 
                ? 'Bajo Stock' 
                : 'Disponible'
        }
        
        return updated
      }
      return p
    }))

    const dbUpdate: Record<string, unknown> = {}
    if (field === 'name') dbUpdate.nombre = value
    if (field === 'price') dbUpdate.precio_usd = value
    if (field === 'stock') {
      dbUpdate.stock = value === -1 ? 0 : value
      dbUpdate.stock_ilimitado = value === -1
    }
    if (field === 'sku') dbUpdate.sku = value

    if (Object.keys(dbUpdate).length > 0) {
      try {
        await fetch('/api/productos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...dbUpdate })
        })
      } catch (err) {
        console.error('Error updating product:', err)
      }
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    initialProducts,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    updateProductBulk,
    setProducts,
    setInitialProducts
  }
}