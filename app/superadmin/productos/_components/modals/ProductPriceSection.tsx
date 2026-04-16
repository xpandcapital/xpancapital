"use client"

interface ProductPriceSectionProps {
  price: number
  originalPrice: number
  bliscoins: number
  currencySymbol: string
  isBlisCoinsEnabled: boolean
  onPriceChange: (price: number) => void
  onOriginalPriceChange: (price: number) => void
  onBlisCoinsChange: (coins: number) => void
  isEditing?: boolean
}

export function ProductPriceSection({
  price,
  originalPrice,
  bliscoins,
  currencySymbol,
  isBlisCoinsEnabled,
  onPriceChange,
  onOriginalPriceChange,
  onBlisCoinsChange
}: ProductPriceSectionProps) {
  return (
    <div className="md:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <span className="text-emerald-500 font-black text-lg">{currencySymbol}</span>
        </div>
        <div>
          <h4 className="text-sm font-black text-white uppercase tracking-widest">Precios y Stock</h4>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Configuración de precios y disponibilidad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Final</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">{currencySymbol}</span>
            <input
              type="number"
              value={price}
              onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-white text-sm placeholder:text-gray-800 focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio Original (Comparación)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">{currencySymbol}</span>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => onOriginalPriceChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-white text-sm placeholder:text-gray-800 focus:outline-none focus:border-white/30 transition-all"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {isBlisCoinsEnabled && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest">BlisCoins</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 font-black">B</span>
            <input
              type="number"
              value={bliscoins}
              onChange={(e) => onBlisCoinsChange(parseInt(e.target.value) || 0)}
              className="w-full bg-amber-500/10 border border-amber-500/20 rounded-2xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-500 transition-all"
              placeholder="0"
            />
          </div>
        </div>
      )}
    </div>
  )
}