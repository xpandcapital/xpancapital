import { useState, useEffect, useCallback } from 'react'

export interface ExchangeRates {
  [key: string]: number
}

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRates = useCallback(async (baseCurrency: string = 'PEN') => {
    setLoading(true)
    setError(null)
    
    try {
      // Intentar usar la API de Perú primero
      const response = await fetch(`/api/peru-api?type=tipo_cambio`)
      
      if (response.ok) {
        const data = await response.json()
        // La API de Perú devuelve un formato específico
        if (data.success && data.data) {
          setRates({
            PEN: 1,
            USD: parseFloat(data.data.venta) || 0.27,
            EUR: parseFloat(data.data.venta) * 0.92 || 0.25,
          })
          setLastUpdated(new Date())
          setLoading(false)
          return
        }
      }
      
      // Fallback a exchangerate-api (gratis)
      const fallbackResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
      const fallbackData = await fallbackResponse.json()
      
      if (fallbackData.rates) {
        setRates(fallbackData.rates)
        setLastUpdated(new Date(fallbackData.time_last_updated * 1000))
      }
    } catch (err) {
      setError('Error al obtener tipos de cambio')
      // Valores por defecto si todo falla
      setRates({
        PEN: 1,
        USD: 0.27,
        EUR: 0.25,
        MXN: 4.5,
        COP: 1050,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const convertPrice = useCallback((amount: number, from: string, to: string): number => {
    if (from === to) return amount
    if (!rates[from] || !rates[to]) return amount
    
    // Convertir a moneda base y luego a destino
    const amountInBase = amount / rates[from]
    const converted = amountInBase * rates[to]
    
    return Math.round(converted * 100) / 100
  }, [rates])

  useEffect(() => {
    fetchRates()
    // Actualizar cada 1 hora
    const interval = setInterval(fetchRates, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchRates])

  return {
    rates,
    loading,
    error,
    lastUpdated,
    fetchRates,
    convertPrice,
  }
}

export default useExchangeRates
