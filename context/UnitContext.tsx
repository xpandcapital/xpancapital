"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUnidades } from "@/lib/hooks/useUnidades";
import type { UnidadMedida, UnidadMedidaInput, TipoUnidad } from "@/lib/types/contexts";

interface Unit {
  id: string
  name: string
  abbreviation: string
  type: TipoUnidad
}

interface UnitContextType {
  units: Unit[]
  loading: boolean
  error: string | null
  fetchUnits: (includeInactive?: boolean, tipo?: TipoUnidad) => Promise<void>
  addUnit: (name: string, abbreviation: string, type: TipoUnidad) => Promise<{ success: boolean; data?: Unit; error?: string }>
  updateUnit: (id: string, name?: string, abbreviation?: string, type?: TipoUnidad) => Promise<{ success: boolean; error?: string }>
  deleteUnit: (id: string) => Promise<{ success: boolean; error?: string }>
  reorderUnits: (newOrder: Unit[]) => Promise<{ success: boolean; error?: string }>
  getUnitsByType: (tipo: TipoUnidad) => Unit[]
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {unidades, loading, error, fetchUnidades, addUnidad, updateUnidad, deleteUnidad, getUnidadesByTipo } = useUnidades();

  // Transform to legacy format
  const units = unidades.map(u => ({
    id: u.id,
    name: u.nombre,
    abbreviation: u.abreviatura,
    type: u.tipo
  }))

  const addUnit = async (name: string, abbreviation: string, type: TipoUnidad) => {
    const result = await addUnidad({ nombre: name, abreviatura: abbreviation, tipo: type })
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.nombre,
          abbreviation: result.data.abreviatura,
          type: result.data.tipo
        }
      }
    }
    return { success: false, error: result.error }
  }

  const updateUnit = async (id: string, name?: string, abbreviation?: string, type?: TipoUnidad) => {
    const updates: Partial<UnidadMedida> = {}
    if (name) updates.nombre = name
    if (abbreviation) updates.abreviatura = abbreviation
    if (type) updates.tipo = type
    const result = await updateUnidad(id, updates)
    return { success: result.success, error: result.error }
  }

  const reorderUnits = async (newOrder: Unit[]) => {
    const updates = newOrder.map((u, index) => ({ id: u.id, orden: index }))
    try {
      await Promise.all(updates.map(u => updateUnidad(u.id, { orden: u.orden })))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  const getUnitsByType = (tipo: TipoUnidad) => {
    return units.filter(u => u.type === tipo)
  }

  const handleDeleteUnit = async (id: string) => {
    const result = await deleteUnidad(id)
    return { success: result.success, error: result.error }
  }

  return (
    <UnitContext.Provider
      value={{
        units,
        loading,
        error,
        fetchUnits: fetchUnidades,
        addUnit,
        updateUnit,
        deleteUnit: handleDeleteUnit,
        reorderUnits,
        getUnitsByType
      }}
    >
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error("useUnits must be used within a UnitProvider");
  }
  return context;
};

export type { UnidadMedida, UnidadMedidaInput, TipoUnidad };