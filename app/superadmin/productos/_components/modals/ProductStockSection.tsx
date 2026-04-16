"use client"

interface ProductStockSectionProps {
  stock: number
  lowStockThreshold: number
  isUnlimited: boolean
  onStockChange: (stock: number) => void
  onThresholdChange: (threshold: number) => void
  onUnlimitedChange: (isUnlimited: boolean) => void
}

export function ProductStockSection({
  stock,
  lowStockThreshold,
  isUnlimited,
  onStockChange,
  onThresholdChange,
  onUnlimitedChange
}: ProductStockSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isUnlimited}
              onChange={(e) => onUnlimitedChange(e.target.checked)}
              className="w-3 h-3 accent-blis-red rounded"
            />
            <span className="text-[9px] font-bold text-blis-red uppercase">Ilimitado</span>
          </label>
        </div>
        <input
          type="number"
          disabled={isUnlimited}
          value={isUnlimited ? '' : stock}
          onChange={(e) => onStockChange(parseInt(e.target.value) || 0)}
          className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blis-red transition-all disabled:opacity-30"
          placeholder={isUnlimited ? "∞" : "Cantidad"}
        />
      </div>

      <div className="space-y-2">
        <label className={`text-[10px] font-black uppercase tracking-widest ${isUnlimited ? 'text-gray-600' : 'text-gray-400'}`}>
          Alerta Bajo Stock
        </label>
        <input
          type="number"
          value={lowStockThreshold}
          onChange={(e) => onThresholdChange(parseInt(e.target.value) || 15)}
          disabled={isUnlimited}
          className={`w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-amber-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
          placeholder="15"
        />
        {isUnlimited && <p className="text-[9px] text-gray-600">No aplica para stock ilimitado</p>}
      </div>
    </div>
  )
}