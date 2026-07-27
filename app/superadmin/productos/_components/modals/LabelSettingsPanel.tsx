"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"
import { SearchableSelect } from "@/components/ui/SearchableSelect"

interface LabelSettingsPanelProps {
  labelSettings: {
    showName: boolean
    showSku: boolean
    showCategory: boolean
    showPrice: boolean
    titleLines: 1 | 2
    layout: 'vertical' | 'horizontal'
    defaultType: 'qr' | 'barcode' | 'web-qr'
    paperSize: 'A2' | 'A3' | 'A4' | 'A5'
    zoom: number
  }
  onUpdate: (settings: Partial<LabelSettingsPanelProps['labelSettings']>) => void
  items: Array<{ product: { name: string }; quantity: number }>
  onQuantityChange: (index: number, quantity: number) => void
  labelHeightCm: number
  onLabelHeightChange: (height: number) => void
}

export function LabelSettingsPanel({
  labelSettings,
  onUpdate,
  items,
  onQuantityChange,
  labelHeightCm,
  onLabelHeightChange
}: LabelSettingsPanelProps) {
  const paperSizes = { A2: 'A2', A3: 'A3', A4: 'A4', A5: 'A5' } as const
  const currentType = labelSettings.defaultType
  const isBarcode = currentType === 'barcode'

  const contentItems = [
    { id: 'showName', label: 'Producto', active: labelSettings.showName },
    { id: 'showSku', label: 'SKU', active: labelSettings.showSku },
    { id: 'showCategory', label: 'Categoría', active: labelSettings.showCategory },
    { id: 'showPrice', label: 'Precio', active: labelSettings.showPrice }
  ]

  return (
    <div className="w-full md:w-80 border-r border-white/5 p-6 space-y-8 overflow-y-auto">
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Formato de Código</h4>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          {(['qr', 'barcode', 'web-qr'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onUpdate({ defaultType: t })}
              className={`flex-1 py-2.5 text-[8px] font-black uppercase tracking-widest rounded-xl transition-all ${currentType === t ? 'bg-blis-red text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {t === 'qr' ? 'QR' : t === 'barcode' ? 'BARRAS' : 'WEB'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Contenido de Etiqueta</h4>
        <div className="grid grid-cols-2 gap-2">
          {contentItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onUpdate({ [item.id]: !labelSettings[item.id as keyof typeof labelSettings] })}
              className={`py-2 px-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all flex items-center justify-between ${labelSettings[item.id as keyof typeof labelSettings] ? 'bg-white/10 border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent border-white/5 text-gray-600 hover:text-gray-400'}`}
            >
              {item.label}
              {labelSettings[item.id as keyof typeof labelSettings] && <Check className="w-3 h-3 text-emerald-500" />}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest px-1">Título</h4>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
              <button
                onClick={() => onUpdate({ titleLines: 1 })}
                className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${labelSettings.titleLines === 1 ? 'bg-white/20 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                1 Línea
              </button>
              <button
                onClick={() => onUpdate({ titleLines: 2 })}
                className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${labelSettings.titleLines === 2 ? 'bg-white/20 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                2 Líneas
              </button>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest px-1">Distribución</h4>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-md">
              <button
                onClick={() => onUpdate({ layout: 'vertical' })}
                className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${labelSettings.layout === 'vertical' ? 'bg-white/20 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Vert.
              </button>
              <button
                onClick={() => onUpdate({ layout: 'horizontal' })}
                className={`flex-1 py-1.5 text-[8px] font-black rounded-lg transition-all ${labelSettings.layout === 'horizontal' ? 'bg-white/20 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
              >
                Horiz.
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Cola de Impresión ({items.length})</h4>
        <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-2">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-3 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-white font-bold truncate uppercase">{item.product.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded-xl p-1 border border-white/5">
                <button
                  onClick={() => onQuantityChange(idx, Math.max(1, item.quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-[10px]"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onQuantityChange(idx, Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-transparent text-[10px] font-black text-blis-red w-full text-center outline-none"
                />
                <button
                  onClick={() => onQuantityChange(idx, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-[10px]"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 space-y-2">
          <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest px-1">Hoja Impresión</h4>
          <SearchableSelect
            value={labelSettings.paperSize}
            onChange={(v) => onUpdate({ paperSize: v as typeof labelSettings.paperSize })}
            options={[
              { value: 'A2', label: 'A2' },
              { value: 'A3', label: 'A3' },
              { value: 'A4', label: 'A4' },
              { value: 'A5', label: 'A5' },
            ]}
            className="w-full"
          />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-[8px] font-black text-white/40 uppercase tracking-widest px-1">Altura</h4>
          <div className="w-full flex justify-center items-center px-0 py-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
            <span className="text-[10px] font-black text-white tracking-widest">{labelHeightCm.toFixed(1)} cm</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ajustar Altura</h4>
          <span className="text-[9px] font-black text-blis-red uppercase">{labelHeightCm.toFixed(1)} cm</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={labelHeightCm}
          onChange={(e) => onLabelHeightChange(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  )
}