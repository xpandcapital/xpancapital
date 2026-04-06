"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useEstados } from "@/lib/hooks/useEstados";
import type { ProductoEstado, ProductoEstadoInput } from "@/lib/types/contexts";

interface Status {
  id: string
  name: string
  slug: string
  color: string
  order: number
}

interface StatusContextType {
  statuses: Status[]
  loading: boolean
  error: string | null
  fetchStatuses: (includeInactive?: boolean) => Promise<void>
  addStatus: (name: string, color: string) => Promise<{ success: boolean; data?: Status; error?: string }>
  renameStatus: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>
  updateStatusColor: (id: string, newColor: string) => Promise<{ success: boolean; error?: string }>
  deleteStatus: (id: string) => Promise<{ success: boolean; error?: string }>
  reorderStatuses: (newOrder: Status[]) => Promise<{ success: boolean; error?: string }>
  getDefaultStatus: () => Status | undefined
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {estados, loading, error, fetchEstados, addEstado, updateEstado, deleteEstado, getDefaultEstado } = useEstados();

  const statuses = useMemo(() => {
    return estados.map(e => ({
      id: e.id,
      name: e.nombre,
      slug: e.slug,
      color: e.color,
      order: e.orden
    }))
  }, [estados])

  const addStatus = async (name: string, color: string) => {
    const result = await addEstado({ nombre: name, color: color || '#71717a' })
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.nombre,
          slug: result.data.slug,
          color: result.data.color,
          order: result.data.orden
        }
      }
    }
    return { success: false, error: result.error }
  }

  const renameStatus = async (id: string, newName: string) => {
    const result = await updateEstado(id, { nombre: newName })
    return { success: result.success, error: result.error }
  }

  const updateStatusColor = async (id: string, newColor: string) => {
    const result = await updateEstado(id, { color: newColor })
    return { success: result.success, error: result.error }
  }

  const deleteStatus = async (id: string) => {
    const result = await deleteEstado(id)
    return { success: result.success, error: result.error }
  }

  const reorderStatuses = async (newOrder: Status[]) => {
    const updates = newOrder.map((s, index) => ({ id: s.id, orden: index }))
    try {
      await Promise.all(updates.map(u => updateEstado(u.id, { orden: u.orden })))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  const getDefaultStatus = () => {
    const found = getDefaultEstado()
    if (!found) return undefined
    return {
      id: found.id,
      name: found.nombre,
      slug: found.slug,
      color: found.color,
      order: found.orden
    }
  }

  return (
    <StatusContext.Provider
      value={{
        statuses,
        loading,
        error,
        fetchStatuses: fetchEstados,
        addStatus,
        renameStatus,
        updateStatusColor,
        deleteStatus,
        reorderStatuses,
        getDefaultStatus
      }}
    >
      {children}
    </StatusContext.Provider>
  );
};

export const useStatuses = () => {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error("useStatuses must be used within a StatusProvider");
  }
  return context;
};