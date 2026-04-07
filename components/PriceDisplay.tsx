"use client"

import { useEffect, useState } from 'react'
import { useExchangeRates } from '@/lib/hooks/useExchangeRates'

interface PriceDisplayProps {
  amount: number
  currency: string // Moneda fiscal (la guardada en DB)
  showConverted?: boolean
  className?: string
}

export function PriceDisplay({ amount, currency, showConverted = true, className = '' }: PriceDisplayProps) {
  const { convertPrice, loading, rates } = useExchangeRates()
  const [userCurrency, setUserCurrency] = useState<string>(currency)
  
  useEffect(() => {
    // Detectar moneda del usuario por geolocalización o preferencia guardada
    const detectUserCurrency = () => {
      // 1. Verificar si hay preferencia guardada
      const savedCurrency = localStorage.getItem('userCurrency')
      if (savedCurrency) {
        setUserCurrency(savedCurrency)
        return
      }
      
      // 2. Detectar por timezone (simplificado)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
      // Mapa básico de timezone a moneda
      const timezoneMap: { [key: string]: string } = {
        'America/Lima': 'PEN',
        'America/Mexico_City': 'MXN',
        'America/Bogota': 'COP',
        'America/Santiago': 'CLP',
        'America/Argentina/Buenos_Aires': 'ARS',
        'America/New_York': 'USD',
        'America/Los_Angeles': 'USD',
        'Europe/Madrid': 'EUR',
        'Europe/London': 'GBP',
      }
      
      const detected = timezoneMap[timezone] || 'USD'
      setUserCurrency(detected)
      localStorage.setItem('userCurrency', detected)
    }
    
    detectUserCurrency()
  }, [])
  
  const convertedAmount = convertPrice(amount, currency, userCurrency)
  
  const formatPrice = (amt: number, curr: string) => {
    const symbols: { [key: string]: string } = {
      PEN: 'S/',
      USD: '$',
      EUR: '€',
      MXN: '$',
      COP: '$',
    }
    
    const symbol = symbols[curr] || curr
    return `${symbol} ${amt.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  
  if (!showConverted || currency === userCurrency || loading) {
    return <span className={className}>{formatPrice(amount, currency)}</span>
  }
  
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="font-bold">
        {formatPrice(convertedAmount, userCurrency)}
      </span>
      <span className="text-xs text-gray-500">
        {formatPrice(amount, currency)}
      </span>
    </div>
  )
}

// Selector de moneda para el usuario
export function CurrencySelector() {
  const [userCurrency, setUserCurrency] = useState('USD')
  const { rates } = useExchangeRates()
  
  useEffect(() => {
    const saved = localStorage.getItem('userCurrency')
    if (saved) setUserCurrency(saved)
  }, [])
  
  const handleChange = (currency: string) => {
    setUserCurrency(currency)
    localStorage.setItem('userCurrency', currency)
    window.location.reload() // Recargar para aplicar cambios
  }
  
  const availableCurrencies = ['PEN', 'USD', 'EUR', 'MXN', 'COP'].filter(c => c in rates || c === 'PEN')
  
  return (
    <select 
      value={userCurrency}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
    >
      {availableCurrencies.map(curr => (
        <option key={curr} value={curr}>{curr}</option>
      ))}
    </select>
  )
}
