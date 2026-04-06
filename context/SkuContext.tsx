"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useSkuPatrones } from "@/lib/hooks/useSkuPatrones";
import type { SkuPatron, SkuPatronInput } from "@/lib/types/contexts";

interface SkuPattern {
  id: string
  name: string
  prefix: string
}

interface SkuContextType {
  skuPatterns: SkuPattern[]
  loading: boolean
  error: string | null
  fetchPatterns: (includeInactive?: boolean) => Promise<void>
  addSkuPattern: (name: string, prefix: string) => Promise<{ success: boolean; data?: SkuPattern; error?: string }>
  deleteSkuPattern: (id: string) => Promise<{ success: boolean; error?: string }>
  updateSkuPattern: (id: string, newName: string, newPrefix: string) => Promise<{ success: boolean; error?: string }>
}

const SkuContext = createContext<SkuContextType | undefined>(undefined);

export const SkuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { patrones, loading, error, fetchPatrones, addPatron, updatePatron, deletePatron } = useSkuPatrones();

  // Transform to legacy format with `name` and `prefix` properties
  const skuPatterns = useMemo(() => {
    return patrones.map(p => ({
      id: p.id,
      name: p.nombre,
      prefix: p.prefijo
    }))
  }, [patrones])

  const addSkuPattern = async (name: string, prefix: string) => {
    const result = await addPatron({
      nombre: name,
      prefijo: prefix.toUpperCase()
    })
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.nombre,
          prefix: result.data.prefijo
        }
      }
    }
    return { success: false, error: result.error }
  }

  const deleteSkuPattern = async (id: string) => {
    const result = await deletePatron(id)
    return { success: result.success, error: result.error }
  }

  const updateSkuPattern = async (id: string, newName: string, newPrefix: string) => {
    const result = await updatePatron(id, {
      nombre: newName,
      prefijo: newPrefix.toUpperCase()
    })
    return { success: result.success, error: result.error }
  }

  return (
    <SkuContext.Provider
      value={{
        skuPatterns,
        loading,
        error,
        fetchPatterns: fetchPatrones,
        addSkuPattern,
        deleteSkuPattern,
        updateSkuPattern
      }}
    >
      {children}
    </SkuContext.Provider>
  );
};

export const useSku = () => {
  const context = useContext(SkuContext);
  if (context === undefined) {
    throw new Error("useSku must be used within a SkuProvider");
  }
  return context;
};

export type { SkuPatron, SkuPatronInput };