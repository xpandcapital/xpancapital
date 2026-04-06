"use client";

import React, { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { useEnvioZonas } from "@/lib/hooks/useEnvioZonas";
import type { EnvioZona, EnvioZonaInput, CargoType } from "@/lib/types/contexts";

// Country-Currency mapping for shipping
export const COUNTRY_CURRENCY_MAP: Record<string, { currency: string; symbol: string }> = {
  PE: { currency: 'PEN', symbol: 'S/' },
  EC: { currency: 'USD', symbol: '$' },
  MX: { currency: 'MXN', symbol: '$' },
  CO: { currency: 'COP', symbol: '$' },
  AR: { currency: 'ARS', symbol: '$' },
  CL: { currency: 'CLP', symbol: '$' },
  US: { currency: 'USD', symbol: '$' },
}

export interface ShippingZone {
  id: string
  name: string
  regions?: string[]
  basePrice: number
  perGramPrice: number
  estimatedDays: string
  isActive: boolean
  order?: number
}

interface ShippingSettings {
  zones: ShippingZone[]
  volumetricFactor: number
  heavyChargeFactor: number
  documentFlatRate: number
  fragileSurcharge: number
  freeShippingThreshold: number | null
  activeCarrier: string
  selectedCountry: string
}

interface ShippingContextType {
  zones: ShippingZone[]
  shippingSettings: ShippingSettings
  loading: boolean
  error: string | null
  fetchZones: (includeInactive?: boolean) => Promise<void>
  addZone: (zona: EnvioZonaInput) => Promise<{ success: boolean; data?: ShippingZone; error?: string }>
  updateZone: (id: string, updates: Partial<ShippingZone>) => Promise<{ success: boolean; data?: ShippingZone; error?: string }>
  deleteZone: (id: string) => Promise<{ success: boolean; error?: string }>
  updateShippingSettings: (settings: Partial<ShippingSettings>) => void
  previewZoneCost: (weightInGrams: number, zoneId: string, cargoType?: CargoType) => number
  calculateShippingCost: (weightInGrams: number, zoneId: string, cargoType?: CargoType) => number
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const ShippingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    zonas,
    loading,
    error,
    fetchZonas,
    addZona,
    updateZona,
    deleteZona
  } = useEnvioZonas();

  const [settings, setSettings] = useState<Omit<ShippingSettings, 'zones'>>({
    volumetricFactor: 5000,
    heavyChargeFactor: 3000,
    documentFlatRate: 10,
    fragileSurcharge: 0.25,
    freeShippingThreshold: 250,
    activeCarrier: 'custom',
    selectedCountry: 'PE'
  })

  // Transform zonas to ShippingZone format
  const zones: ShippingZone[] = zonas.map(z => ({
    id: z.id,
    name: z.nombre,
    regions: z.regiones,
    basePrice: z.precio_base,
    perGramPrice: z.precio_por_gramo,
    estimatedDays: z.dias_estimados,
    isActive: z.activo,
    order: z.orden
  }))

  const shippingSettings: ShippingSettings = {
    zones,
    ...settings
  }

  const updateShippingSettings = (updates: Partial<ShippingSettings>) => {
    if (updates.zones) {
      // Handle zones separately - they are managed by the context/hook
      // This is for backward compatibility with the UI
    }
    const { zones: _, ...rest } = updates
    setSettings(prev => ({ ...prev, ...rest }))
  }

  const previewZoneCost = useCallback((
    weightInGrams: number,
    zoneId: string,
    cargoType: CargoType = 'parcel'
  ) => {
    const zone = zones.find(z => z.id === zoneId)
    if (!zone) return 0

    if (cargoType === 'document') {
      return settings.documentFlatRate
    }

    let cost = zone.basePrice
    if (weightInGrams > 1000) {
      cost += (weightInGrams - 1000) * zone.perGramPrice
    }

    if (cargoType === 'fragile') {
      cost *= (1 + settings.fragileSurcharge)
    }

    return cost
  }, [zones, settings.documentFlatRate, settings.fragileSurcharge])

  const calculateShippingCost = useCallback((
    weightInGrams: number,
    zoneId: string,
    cargoType: CargoType = 'parcel'
  ) => {
    return previewZoneCost(weightInGrams, zoneId, cargoType)
  }, [previewZoneCost])

  const addZone = async (zona: EnvioZonaInput) => {
    const result = await addZona(zona)
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.nombre,
          regions: result.data.regiones,
          basePrice: result.data.precio_base,
          perGramPrice: result.data.precio_por_gramo,
          estimatedDays: result.data.dias_estimados,
          isActive: result.data.activo,
          order: result.data.orden
        }
      }
    }
    return { success: false, error: result.error }
  }

  const updateZone = async (id: string, updates: Partial<ShippingZone>) => {
    const dbUpdates: Partial<EnvioZona> = {}
    if (updates.name) dbUpdates.nombre = updates.name
    if (updates.regions) dbUpdates.regiones = updates.regions
    if (updates.basePrice !== undefined) dbUpdates.precio_base = updates.basePrice
    if (updates.perGramPrice !== undefined) dbUpdates.precio_por_gramo = updates.perGramPrice
    if (updates.estimatedDays) dbUpdates.dias_estimados = updates.estimatedDays
    if (updates.isActive !== undefined) dbUpdates.activo = updates.isActive
    if (updates.order !== undefined) dbUpdates.orden = updates.order

    const result = await updateZona(id, dbUpdates)
    return { success: result.success, error: result.error }
  }

  return (
    <ShippingContext.Provider
      value={{
        zones,
        shippingSettings,
        loading,
        error,
        fetchZones: fetchZonas,
        addZone,
        updateZone,
        deleteZone: deleteZona,
        updateShippingSettings,
        previewZoneCost,
        calculateShippingCost
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = () => {
  const context = useContext(ShippingContext);
  if (!context) {
    throw new Error("useShipping must be used within a ShippingProvider");
  }
  return context;
};

export type { EnvioZona, EnvioZonaInput, CargoType };