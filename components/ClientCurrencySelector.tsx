"use client"

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const CURRENCIES = [
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano', flag: '🇵🇪' },
  { code: 'USD', symbol: '$', name: 'Dólar USD', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', flag: '🇲🇽' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', flag: '🇨🇴' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno', flag: '🇨🇱' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', flag: '🇦🇷' },
  { code: 'BOB', symbol: 'Bs', name: 'Boliviano', flag: '🇧🇴' },
]

export function ClientCurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState('PEN')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('clientCurrency')
    if (saved && CURRENCIES.find(c => c.code === saved)) {
      setSelectedCurrency(saved)
    }
  }, [])

  const handleSelect = (code: string) => {
    setSelectedCurrency(code)
    localStorage.setItem('clientCurrency', code)
    setIsOpen(false)
    window.dispatchEvent(new Event('currencyChange'))
  }

  const current = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/30 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
      >
        <span className="text-lg">{current.flag}</span>
        <span className="text-sm font-bold text-white">{current.code}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 py-2">
                Seleccionar Moneda
              </p>
              {CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    selectedCurrency === currency.code 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{currency.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold">{currency.code}</p>
                    <p className="text-[10px] text-gray-500">{currency.name}</p>
                  </div>
                  {selectedCurrency === currency.code && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Hook para usar la moneda seleccionada por el cliente
export function useClientCurrency() {
  const [currency, setCurrency] = useState('PEN')

  useEffect(() => {
    const saved = localStorage.getItem('clientCurrency')
    if (saved) setCurrency(saved)

    const handleChange = () => {
      const updated = localStorage.getItem('clientCurrency') || 'PEN'
      setCurrency(updated)
    }

    window.addEventListener('currencyChange', handleChange)
    return () => window.removeEventListener('currencyChange', handleChange)
  }, [])

  return currency
}
