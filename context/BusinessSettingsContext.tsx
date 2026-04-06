"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useBusinessConfig } from "@/lib/hooks/useBusinessConfig";
import type { BusinessType } from "@/lib/types/contexts";

interface BusinessSettingsContextType {
  settings: {
    enablePerishables: boolean;
    enableSerialization: boolean;
    enableShipping: boolean;
    businessType: BusinessType;
  };
  loading: boolean;
  error: string | null;
  updateSettings: (updates: {
    enablePerishables?: boolean;
    enableSerialization?: boolean;
    enableShipping?: boolean;
    businessType?: BusinessType;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshSettings: () => Promise<void>;
}

const BusinessSettingsContext = createContext<BusinessSettingsContextType | undefined>(undefined);

export const BusinessSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    config,
    loading,
    error,
    updateConfig,
    fetchConfig
  } = useBusinessConfig();

  const settings = {
    enablePerishables: config?.enable_perishables ?? true,
    enableSerialization: config?.enable_serialization ?? true,
    enableShipping: config?.enable_shipping ?? true,
    businessType: config?.business_type ?? 'physical' as BusinessType
  };

  const handleUpdateSettings = async (updates: {
    enablePerishables?: boolean;
    enableSerialization?: boolean;
    enableShipping?: boolean;
    businessType?: BusinessType;
  }) => {
    // Convert camelCase to snake_case for API
    const apiUpdates: {
      enable_perishables?: boolean;
      enable_serialization?: boolean;
      enable_shipping?: boolean;
      business_type?: BusinessType;
    } = {};
    
    if (updates.enablePerishables !== undefined) apiUpdates.enable_perishables = updates.enablePerishables;
    if (updates.enableSerialization !== undefined) apiUpdates.enable_serialization = updates.enableSerialization;
    if (updates.enableShipping !== undefined) apiUpdates.enable_shipping = updates.enableShipping;
    if (updates.businessType !== undefined) apiUpdates.business_type = updates.businessType;

    const result = await updateConfig(apiUpdates);
    if (result.success) {
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  return (
    <BusinessSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        updateSettings: handleUpdateSettings,
        refreshSettings: fetchConfig
      }}
    >
      {children}
    </BusinessSettingsContext.Provider>
  );
};

export const useBusinessSettings = () => {
  const context = useContext(BusinessSettingsContext);
  if (!context) {
    throw new Error("useBusinessSettings must be used within a BusinessSettingsProvider");
  }
  return context;
};

export type { BusinessType };