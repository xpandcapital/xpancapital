"use client";

import React, { createContext, useContext, ReactNode, useMemo, useEffect } from "react";
import { useCategorias } from "@/lib/hooks/useCategorias";
import type { ProductoCategoria, ProductoCategoriaInput } from "@/lib/types/contexts";

interface Category {
  id: string
  name: string
  skuPrefix: string
  order: number
  activo: boolean
}

interface CategoryContextType {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: (includeInactive?: boolean) => Promise<void>
  addCategory: (name: string, skuPrefix?: string) => Promise<{ success: boolean; data?: Category; error?: string }>
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>
  renameCategory: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>
  updateSkuPrefix: (id: string, newPrefix: string) => Promise<{ success: boolean; error?: string }>
  reorderCategories: (newOrder: Category[]) => Promise<{ success: boolean; error?: string }>
  toggleActive: (id: string, activo: boolean) => Promise<{ success: boolean; error?: string }>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {categorias, loading, error, fetchCategorias, addCategoria, updateCategoria, deleteCategoria, reorderCategorias } = useCategorias();

  useEffect(() => {
    fetchCategorias(true)
  }, [fetchCategorias])

  // Transform to legacy format with `name` property
  const categories = useMemo(() => {
    return categorias.map(c => ({
      id: c.id,
      name: c.nombre,
      skuPrefix: c.sku_prefix || '',
      order: c.orden,
      activo: c.activo ?? true
    }))
  }, [categorias])

  const addCategory = async (name: string, skuPrefix?: string) => {
    const result = await addCategoria({
      nombre: name,
      sku_prefix: skuPrefix || name.substring(0, 3).toUpperCase()
    })
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.nombre,
          skuPrefix: result.data.sku_prefix || '',
          order: result.data.orden
        }
      }
    }
    return { success: false, error: result.error }
  }

  const deleteCategory = async (id: string) => {
    const result = await deleteCategoria(id)
    return { success: result.success, error: result.error }
  }

  const renameCategory = async (id: string, newName: string) => {
    const result = await updateCategoria(id, { nombre: newName })
    return { success: result.success, error: result.error }
  }

  const updateSkuPrefix = async (id: string, newPrefix: string) => {
    const result = await updateCategoria(id, { sku_prefix: newPrefix.toUpperCase() })
    return { success: result.success, error: result.error }
  }

  const handleReorderCategories = async (newOrder: Category[]) => {
    const updates = newOrder.map((cat, index) => ({ id: cat.id, orden: index }))
    try {
      await Promise.all(
        updates.map(u => updateCategoria(u.id, { orden: u.orden }))
      )
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  const toggleActive = async (id: string, activo: boolean) => {
    const result = await updateCategoria(id, { activo })
    return { success: result.success, error: result.error }
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        fetchCategories: fetchCategorias,
        addCategory,
        deleteCategory,
        renameCategory,
        updateSkuPrefix,
        reorderCategories: handleReorderCategories,
        toggleActive
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
};

export type { ProductoCategoria, ProductoCategoriaInput };