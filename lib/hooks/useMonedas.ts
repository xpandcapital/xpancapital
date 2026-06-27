import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa'
import type { MonedasConfig, TasaCambio, ExchangeRates } from '@/lib/types/contexts'

const INITIAL_RATES: ExchangeRates = {
  USD: 1,
  PEN: 3.75,
  MXN: 17.0,
  EUR: 0.92,
  COP: 3900,
  CLP: 950,
  ARS: 840
}

export function useMonedas() {
  const [config, setConfig] = useState<MonedasConfig | null>(null)
  const [tasas, setTasas] = useState<ExchangeRates>(INITIAL_RATES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data: configData, error: configError } = await supabase
        .from('monedas_config')
        .select('*')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .single()

      if (configError && configError.code !== 'PGRST116') {
        throw configError
      }

      const { data: tasasData, error: tasasError } = await supabase
        .from('tasas_cambio')
        .select('*')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)

      if (tasasError) throw tasasError

      const exchangeRates: ExchangeRates = { ...INITIAL_RATES }
      if (tasasData) {
        tasasData.forEach((t: TasaCambio) => {
          exchangeRates[t.moneda_destino] = t.tasa
        })
      }

      setConfig(configData)
      setTasas(exchangeRates)
      setError(null)
    } catch (e) {
      console.error('[useMonedas] Error:', e)
      setError(e instanceof Error ? e.message : 'Error al cargar configuración de monedas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const updateConfig = useCallback(async (updates: Partial<MonedasConfig>) => {
    try {
      // Check if config exists
      const { data: existingConfig } = await supabase
        .from('monedas_config')
        .select('id')
        .eq('empresa_id', DEFAULT_EMPRESA_ID)
        .maybeSingle()

      let result
      if (existingConfig) {
        // Update existing
        result = await supabase
          .from('monedas_config')
          .update({
            ...updates,
            ultima_actualizacion: new Date().toISOString()
          })
          .eq('empresa_id', DEFAULT_EMPRESA_ID)
          .select()
          .single()
      } else {
        // Insert new
        result = await supabase
          .from('monedas_config')
          .insert({
            empresa_id: DEFAULT_EMPRESA_ID,
            ...updates,
            ultima_actualizacion: new Date().toISOString()
          })
          .select()
          .single()
      }

      if (result.error) throw result.error
      setConfig(result.data)
      return { success: true, data: result.data }
    } catch (e) {
      console.error('[useMonedas] Error updating config:', e)
      return { success: false, error: e instanceof Error ? e.message : 'Error al actualizar' }
    }
  }, [])

  const updateTasa = useCallback(async (origen: string, destino: string, tasa: number, fuente: string = 'manual') => {
    try {
      const { error: upsertError } = await supabase
        .from('tasas_cambio')
        .upsert({
          empresa_id: DEFAULT_EMPRESA_ID,
          moneda_origen: origen,
          moneda_destino: destino,
          tasa,
          fuente,
          actualizado_en: new Date().toISOString()
        }, {
          onConflict: 'empresa_id,moneda_origen,moneda_destino'
        })

      if (upsertError) throw upsertError
      
      await fetchConfig()
      return { success: true }
    } catch (e) {
      console.error('[useMonedas] Error updating tasa:', e)
      return { success: false, error: e instanceof Error ? e.message : 'Error al actualizar tasa' }
    }
  }, [fetchConfig])

  const refreshRatesFromAPI = useCallback(async () => {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD')
      const data = await response.json()
      
      if (data && data.rates) {
        setTasas(prev => ({ ...prev, ...data.rates }))
        setConfig(prev => prev ? { ...prev, ultima_actualizacion: new Date().toISOString() } : null)
        return { success: true, rates: data.rates }
      }
      return { success: false, error: 'No se pudieron obtener las tasas' }
    } catch (e) {
      console.error('[useMonedas] Error refreshing rates:', e)
      return { success: false, error: 'Error al conectar con la API' }
    }
  }, [])

  return {
    config,
    tasas,
    loading,
    error,
    fetchConfig,
    updateConfig,
    updateTasa,
    refreshRatesFromAPI
  }
}