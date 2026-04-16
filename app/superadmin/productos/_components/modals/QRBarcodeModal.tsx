"use client"

import { useState } from "react"
import { Printer } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { Barcode as BarcodeIcon } from "lucide-react"
import { LabelSettingsPanel } from './LabelSettingsPanel'
import { LabelPreview } from './LabelPreview'
import type { Product, QRModalType, PaperSize, LabelSettings } from '../../_types'

interface QRBarcodeModalProps {
  isOpen: boolean
  items: Array<{ product: Product; quantity: number }>
  type: QRModalType
  onClose: () => void
  labelSettings: LabelSettings
  onLabelSettingsChange: (settings: Partial<LabelSettings>) => void
  selectedCurrency: { code: string; symbol: string }
}

export function QRBarcodeModal({
  isOpen,
  items,
  type,
  onClose,
  labelSettings,
  onLabelSettingsChange,
  selectedCurrency
}: QRBarcodeModalProps) {
  const [paperSize, setPaperSize] = useState<PaperSize>(labelSettings.paperSize || 'A4')
  const [zoom, setZoom] = useState(labelSettings.zoom || 0.5)
  const [labelHeight, setLabelHeight] = useState(3)
  const [printItems, setPrintItems] = useState(items)

  if (!isOpen) return null

  const paperSizes: Record<PaperSize, { name: string; width: string; height: string; pxW: number; pxH: number }> = {
    A2: { name: 'A2', width: '420mm', height: '594mm', pxW: 1587, pxH: 2245 },
    A3: { name: 'A3', width: '297mm', height: '420mm', pxW: 1122, pxH: 1587 },
    A4: { name: 'A4', width: '210mm', height: '297mm', pxW: 794, pxH: 1122 },
    A5: { name: 'A5', width: '148mm', height: '210mm', pxW: 559, pxH: 794 }
  }

  const selectedPaper = paperSizes[paperSize]
  const currentType = type === 'default' ? labelSettings.defaultType || 'qr' : type
  const hasInfo = currentType !== 'web-qr' && (labelSettings.showName || labelSettings.showPrice || labelSettings.showSku || labelSettings.showCategory)
  const infoElementsCount = [labelSettings.showName, labelSettings.showSku, labelSettings.showPrice, labelSettings.showCategory].filter(Boolean).length
  const isHorizontal = labelSettings.layout === 'horizontal'
  const isBarcode = currentType === 'barcode'

  const minHeight = isHorizontal ? (isBarcode ? 2.0 : 1.0) : (isBarcode ? 1.5 : 3.0)
  const labelHeightCm = Math.max(minHeight, labelHeight)
  const widthFactor = !hasInfo
    ? (isBarcode ? 1.8 : 1.0)
    : isHorizontal
      ? (infoElementsCount <= 1 ? 1.6 : infoElementsCount === 2 ? 2.0 : 2.8)
      : (isBarcode ? (1.5 + (4 - infoElementsCount) * 0.15) : (0.80 + (4 - infoElementsCount) * 0.05))
  const labelWidth = labelHeightCm * 37.8 * widthFactor

  const handleQuantityChange = (idx: number, newQty: number) => {
    setPrintItems(prev => {
      const newItems = [...prev]
      newItems[idx] = { ...newItems[idx], quantity: Math.max(1, newQty) }
      return newItems
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSettingsChange = (newSettings: Partial<LabelSettings>) => {
    onLabelSettingsChange(newSettings)
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 print:!static print:!bg-transparent print:!p-0 print:!block print:!h-auto print:!w-auto"
      >
        <style>{`
          @media print {
            @page { size: ${selectedPaper.width} ${selectedPaper.height}; margin: 0 !important; }
            html, body { margin: 0 !important; padding: 0 !important; background: white !important; height: auto !important; overflow: visible !important; }
            body > *:not(#print-portal-overlay) { display: none !important; }
          }
        `}</style>

        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          className="bg-zinc-950 border border-white/10 w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden print:!static print:!w-full print:!h-auto print:!rounded-none print:!border-none print:!shadow-none print:!bg-transparent print:!block print:!overflow-visible"
        >
          <div className="p-8 border-b border-white/5 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blis-red flex items-center justify-center rounded-xl shadow-lg ring-1 ring-white/20">
                <BarcodeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-1">Centro de Impresión Blis</h3>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Configuración de etiquetas</p>
              </div>
            </div>
            <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 transition-all">
              ×
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col md:flex-row print:!block print:!overflow-visible">
            <LabelSettingsPanel
              labelSettings={{ ...labelSettings, paperSize }}
              onUpdate={(s) => {
                if (s.paperSize) setPaperSize(s.paperSize as PaperSize)
                handleSettingsChange(s)
              }}
              items={printItems}
              onQuantityChange={handleQuantityChange}
              labelHeightCm={labelHeightCm}
              onLabelHeightChange={setLabelHeight}
            />

            <div className="flex-1 bg-zinc-950 overflow-auto relative p-16 flex justify-start items-start print:p-0 print:bg-white print:!block print:!overflow-visible min-h-0">
              <div className="fixed bottom-12 right-12 z-[5000] bg-black/90 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 flex items-center gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] print:hidden">
                <div className="flex flex-col gap-1 pr-2 border-r border-white/10">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">Zoom</span>
                  <span className="text-sm font-black text-blis-red leading-none">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-48 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blis-red"
                />
              </div>

              <div className="relative inline-block print:!static print:!m-0 print:!p-0 print:!block print:!transform-none" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                <LabelPreview
                  products={printItems}
                  type={currentType}
                  labelSettings={labelSettings}
                  paperSize={selectedPaper}
                  labelHeightCm={labelHeightCm}
                  labelWidth={labelWidth}
                  selectedCurrency={selectedCurrency}
                  zoom={zoom}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 p-4 print:hidden">
            <button
              onClick={handlePrint}
              className="w-full py-4 bg-blis-red text-white rounded-2xl font-black uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-all shadow-[0_15px_35px_rgba(239,68,68,0.25)] active:scale-95 flex items-center justify-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" /> IMPRIMIR (PDF)
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}