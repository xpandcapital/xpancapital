"use client"

import { QRCodeSVG } from "qrcode.react"
import Barcode from "react-barcode"
import type { Product } from '../../_types'

interface LabelPreviewProps {
  products: Array<{ product: Product; quantity: number }>
  type: 'qr' | 'barcode' | 'web-qr'
  labelSettings: {
    showName: boolean
    showSku: boolean
    showCategory: boolean
    showPrice: boolean
    titleLines: 1 | 2
    layout: 'vertical' | 'horizontal'
  }
  paperSize: { width: string; height: string; pxW: number; pxH: number }
  labelHeightCm: number
  labelWidth: number
  selectedCurrency: { symbol: string }
  zoom: number
}

export function LabelPreview({
  products,
  type,
  labelSettings,
  paperSize,
  labelHeightCm,
  labelWidth,
  selectedCurrency,
  zoom
}: LabelPreviewProps) {
  const allLabelsInQueue = products.flatMap(item => Array(item.quantity).fill(item.product))
  const RENDER_SCALE = 4
  const isHorizontal = labelSettings.layout === 'horizontal'
  const isBarcode = type === 'barcode'
  const hasInfo = type !== 'web-qr' && (labelSettings.showName || labelSettings.showPrice || labelSettings.showSku || labelSettings.showCategory)

  const infoElementsCount = [labelSettings.showName, labelSettings.showSku, labelSettings.showPrice, labelSettings.showCategory].filter(Boolean).length
  const widthFactor = !hasInfo
    ? (isBarcode ? 1.8 : 1.0)
    : isHorizontal
      ? (infoElementsCount <= 1 ? 1.6 : infoElementsCount === 2 ? 2.0 : 2.8)
      : (isBarcode ? (1.5 + (4 - infoElementsCount) * 0.15) : (0.80 + (4 - infoElementsCount) * 0.05))

  const pxHeight = labelHeightCm * 37.8
  const pxHeightScaled = pxHeight
  const labelWidthScaled = labelWidth

  const codeFraction = !isHorizontal
    ? (isBarcode ? 0.50 : 0.75)
    : (isBarcode ? 0.40 : 0.50)

  const toPx = (cmVal: number) => `${(cmVal * 37.8).toFixed(2)}px`

  const totalWeight = 0.3 +
    (labelSettings.showCategory ? 0.5 : 0) +
    (labelSettings.showName ? (labelSettings.titleLines === 1 ? 0.9 : 1.6) : 0) +
    (labelSettings.showSku ? 0.5 : 0) +
    (labelSettings.showPrice ? 1.4 : 0)

  const textH_cm = isHorizontal ? labelHeightCm : labelHeightCm * (1 - codeFraction)
  const textW_cm = isHorizontal ? (labelWidth / 37.8) * (1 - codeFraction) : labelWidth / 37.8
  const useableH = textH_cm * 0.95
  const useableW = textW_cm * 0.95
  const fitFactorH = useableH / totalWeight
  const fitFactorW = useableW / (isHorizontal ? 9.2 : (isBarcode ? 12 : 10.5))
  const fitFactor = Math.min(fitFactorH, fitFactorW)

  const fStyles = {
    category: { fontSize: toPx(fitFactor * 0.7), lineHeight: 1.1, color: '#000' },
    name: { fontSize: toPx(fitFactor * (labelSettings.titleLines === 1 ? 0.98 : 0.82)), lineHeight: 1.1, color: '#000' },
    sku: { fontSize: toPx(fitFactor * 0.7), lineHeight: 1.1, color: '#000' },
    price: { fontSize: toPx(fitFactor * 1.5), lineHeight: 0.95, color: '#000' }
  }

  const barcodeWidthMultiplier = Math.max(0.5, isHorizontal ? (labelWidth / 37.78 * codeFraction * 37.8) / 115 : (labelWidth / 37.8 * 37.8) / 115)
  const barcodeHeightPixels = Math.max(10, isHorizontal ? labelHeightCm * 10 : (labelHeightCm * codeFraction * 37.8) * 0.8)

  const gap_px = 3.78
  const sheetW_px = paperSize.pxW - (7.56 * 2)
  const sheetH_px = paperSize.pxH - (7.56 * 2)
  const labelsPerRow = Math.floor(sheetW_px / (labelWidthScaled + gap_px))
  const labelsPerCol = Math.floor(sheetH_px / (pxHeight + gap_px))
  const visibleCapacity = (labelsPerRow * labelsPerCol) || 1

  return (
    <div
      className="print-sheet shadow-[0_0_120px_rgba(0,0,0,0.8)] transition-all duration-300 ring-1 ring-white/10"
      style={{
        width: paperSize.width,
        height: paperSize.height,
        minHeight: paperSize.height,
        background: 'white',
        padding: '2mm',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1mm',
        alignContent: 'flex-start',
        boxSizing: 'border-box'
      }}
    >
      {allLabelsInQueue.slice(0, visibleCapacity).map((product, pIdx) => (
        <div
          key={pIdx}
          className={`bg-white overflow-hidden border border-dashed border-gray-400 print:!border-gray-300 relative`}
          style={{
            height: `${(labelHeightCm * 10).toFixed(2)}mm`,
            width: `${(labelWidthScaled / 3.78).toFixed(2)}mm`,
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            width: `${100 * RENDER_SCALE}%`,
            height: `${100 * RENDER_SCALE}%`,
            transform: `scale(${1 / RENDER_SCALE})`,
            transformOrigin: 'top left',
            display: 'flex',
            flexDirection: isHorizontal ? 'row' : 'column',
            boxSizing: 'border-box'
          }}>
            <div
              className={`flex items-center justify-center bg-transparent overflow-hidden ${isHorizontal ? (hasInfo ? 'border-r border-gray-200' : '') : (hasInfo ? 'border-b border-gray-200' : '')}`}
              style={hasInfo
                ? (isHorizontal ? { width: `${codeFraction * 100}%`, height: '100%', padding: toPx(Math.min(labelHeightCm, labelWidth / 37.8) * 0.02) } : { width: '100%', height: `${codeFraction * 100}%`, padding: toPx(Math.min(labelHeightCm, labelWidth / 37.8) * 0.02) })
                : { width: '100%', height: '100%', padding: toPx(Math.min(labelHeightCm, labelWidth / 37.8) * 0.02) }
              }
            >
              {type === 'qr' || type === 'web-qr' ? (
                <QRCodeSVG
                  value={type === 'web-qr' ? `https://bliscorp.com/shop/product/${product.id}` : product.sku}
                  style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}
                  level="H"
                  marginSize={0}
                  bgColor="transparent"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full max-w-full max-h-full">
                  <Barcode
                    value={product.sku}
                    width={barcodeWidthMultiplier}
                    height={barcodeHeightPixels}
                    displayValue={false}
                    background="transparent"
                    margin={0}
                  />
                </div>
              )}
            </div>
            {hasInfo && (
              <div style={{ padding: toPx(Math.min(textH_cm, textW_cm) * 0.08), gap: toPx(fitFactor * 0.15) }} className={`flex flex-col justify-center ${isHorizontal ? 'text-left items-start' : 'text-center items-center'} flex-1 overflow-hidden min-w-0`}>
                {labelSettings.showCategory && <p style={fStyles.category} className="font-black text-black uppercase tracking-widest m-0">{product.category}</p>}
                {labelSettings.showName && <h4 style={fStyles.name} className={`text-black font-black uppercase tracking-tight m-0 ${labelSettings.titleLines === 1 ? 'line-clamp-1' : 'line-clamp-2'}`}>{product.name}</h4>}
                {(labelSettings.showSku || labelSettings.showPrice) && (
                  <div className="flex flex-col gap-[0.1em] leading-tight flex-shrink-0" style={{ alignItems: isHorizontal ? 'flex-start' : 'center' }}>
                    {labelSettings.showSku && <span style={fStyles.sku} className="font-black text-black uppercase tracking-widest">{product.sku}</span>}
                    {labelSettings.showPrice && <span style={fStyles.price} className="font-black text-black">{selectedCurrency.symbol}{product.price?.toFixed(2)}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}