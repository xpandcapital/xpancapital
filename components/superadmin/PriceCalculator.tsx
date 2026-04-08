"use client"

import { useState, useEffect } from 'react'

interface PriceCalculatorProps {
    editingProduct: any
    selectedCurrency: { symbol: string; code: string }
    isMultiCurrencyEnabled: boolean
    activeCurrencies: Array<{ code: string; symbol: string }>
}

export function PriceCalculator({ editingProduct, selectedCurrency, isMultiCurrencyEnabled, activeCurrencies }: PriceCalculatorProps) {
    const [basePrice, setBasePrice] = useState<number>(editingProduct?.originalPrice || 0)
    const [discountType, setDiscountType] = useState<'porcentaje' | 'monto_fijo'>(editingProduct?.tipoDescuento || 'porcentaje')
    const [discountValue, setDiscountValue] = useState<number>(editingProduct?.discountPercentage || 0)
    const [finalPrice, setFinalPrice] = useState<number>(editingProduct?.price || 0)
    const [discountUntil, setDiscountUntil] = useState<string>(editingProduct?.discountUntil || '')

    // Calcular precio final cuando cambian los valores
    useEffect(() => {
        let calculated = basePrice
        if (discountValue > 0 && basePrice > 0) {
            if (discountType === 'porcentaje') {
                calculated = basePrice - (basePrice * (discountValue / 100))
            } else {
                calculated = basePrice - discountValue
            }
        }
        // Asegurar que no sea negativo
        calculated = Math.max(0, calculated)
        setFinalPrice(Number(calculated.toFixed(2)))
    }, [basePrice, discountType, discountValue])

    return (
        <div className="space-y-4">
            {/* Fila 1: Precio Base y Tipo de Descuento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Precio Base */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Base</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{selectedCurrency.symbol}</span>
                        <input 
                            name="originalPrice" 
                            type="number" 
                            step="0.01"
                            value={basePrice || ''}
                            onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                            placeholder="0.00" 
                            className="w-full bg-black/30 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all" 
                        />
                    </div>
                </div>

                {/* Tipo de Descuento */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</label>
                    <div className="flex bg-black/30 border border-white/10 rounded-2xl p-1">
                        <button
                            type="button"
                            onClick={() => setDiscountType('porcentaje')}
                            className={`flex-1 py-3 rounded-xl text-lg font-black transition-all ${
                                discountType === 'porcentaje' 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'text-gray-500 hover:text-white'
                            }`}
                            title="Porcentaje"
                        >
                            %
                        </button>
                        <button
                            type="button"
                            onClick={() => setDiscountType('monto_fijo')}
                            className={`flex-1 py-3 rounded-xl text-lg font-black transition-all ${
                                discountType === 'monto_fijo' 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'text-gray-500 hover:text-white'
                            }`}
                            title="Monto Fijo"
                        >
                            {selectedCurrency.symbol}
                        </button>
                    </div>
                    <input type="hidden" name="tipoDescuento" value={discountType} />
                </div>

                {/* Valor del Descuento */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Descuento ({discountType === 'porcentaje' ? '%' : '$'})
                    </label>
                    <div className="relative">
                        <input 
                            name="discountPercentage" 
                            type="number" 
                            step={discountType === 'porcentaje' ? '1' : '0.01'}
                            value={discountValue || ''}
                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                            placeholder="0" 
                            className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all pr-10" 
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                            {discountType === 'porcentaje' ? '%' : selectedCurrency.symbol}
                        </span>
                    </div>
                </div>

                {/* Precio Final (Calculado) */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Precio Final (Calculado)</label>
                    <div className="relative">
                        {isMultiCurrencyEnabled ? (
                            <div className="flex gap-2">
                                <select 
                                    name="currencyCode" 
                                    defaultValue={editingProduct?.currencyCode || selectedCurrency.code} 
                                    className="bg-white/10 border border-white/10 rounded-xl px-3 py-3 text-[10px] font-black text-emerald-500 focus:outline-none focus:border-emerald-500 w-20"
                                >
                                    {activeCurrencies.map(c => (
                                        <option key={c.code} value={c.code}>{c.code}</option>
                                    ))}
                                </select>
                                <input 
                                    name="price" 
                                    type="number" 
                                    step="0.01"
                                    value={finalPrice}
                                    readOnly
                                    className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none cursor-default" 
                                />
                            </div>
                        ) : (
                            <>
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">{selectedCurrency.symbol}</span>
                                <input 
                                    name="price" 
                                    type="number" 
                                    step="0.01"
                                    value={finalPrice}
                                    readOnly
                                    className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none cursor-default" 
                                />
                            </>
                        )}
                    </div>
                    {discountValue > 0 && basePrice > 0 && (
                        <p className="text-[9px] text-emerald-500 font-bold">
                            Ahorro: {selectedCurrency.symbol}{discountType === 'porcentaje' 
                                ? ((basePrice * discountValue) / 100).toFixed(2) 
                                : discountValue.toFixed(2)
                            }
                        </p>
                    )}
                </div>
            </div>

            {/* Fecha de expiración del descuento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descuento Válido Hasta</label>
                    <input 
                        name="discountUntil" 
                        type="date" 
                        value={discountUntil}
                        onChange={(e) => setDiscountUntil(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all" 
                    />
                </div>
            </div>
        </div>
    )
}
