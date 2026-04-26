"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { ProductImageUploader } from './ProductImageUploader'
import { ProductPriceSection } from './ProductPriceSection'
import { ProductStockSection } from './ProductStockSection'
import { PerishableSection } from './PerishableSection'
import RichTextEditor from "@/components/superadmin/RichTextEditor"
import type { Product, Category, Status, Currency, PerishableHandling } from '../../_types'

interface ProductFormModalProps {
  isOpen: boolean
  editingProduct: Product | null
  categories: Category[]
  statuses: Status[]
  skuPatterns: Array<{ id: string; prefix: string }>
  currencies: Currency[]
  selectedCurrency: Currency
  taxCurrency: Currency
  isMultiCurrencyEnabled: boolean
  isBlisCoinsEnabled: boolean
  settings: {
    enablePerishables: boolean
    enableSerialization: boolean
  }
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

export function ProductFormModal({
  isOpen,
  editingProduct,
  categories,
  currencies,
  selectedCurrency,
  taxCurrency,
  isBlisCoinsEnabled,
  settings,
  onClose,
  onSave
}: ProductFormModalProps) {
  const [isPerishable, setIsPerishable] = useState(editingProduct?.isPerishable ?? settings.enablePerishables ?? false)
  const [perishableHandling, setPerishableHandling] = useState<PerishableHandling>(editingProduct?.perishableHandling ?? 'discard')
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(editingProduct?.stock === -1)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [formData, setFormData] = useState(() => {
    if (editingProduct) {
      return {
        name: editingProduct.name,
        description: editingProduct.description || '',
        category: editingProduct.category,
        price: editingProduct.price,
        originalPrice: editingProduct.originalPrice || 0,
        bliscoins: editingProduct.bliscoins || 0,
        stock: editingProduct.stock === -1 ? 0 : editingProduct.stock,
        lowStockThreshold: editingProduct.lowStockThreshold || 15,
        sku: editingProduct.sku,
        skuPrefix: editingProduct.skuPrefix || 'SKU',
        isAutoSku: editingProduct.isAutoSku ?? true,
        purchaseDate: editingProduct.purchaseDate || '',
        expirationDate: editingProduct.expirationDate || '',
        image: editingProduct.image || null
      }
    }
    return {
      name: '',
      description: '',
      category: categories[0]?.name ?? '',
      price: 0,
      originalPrice: 0,
      bliscoins: 0,
      stock: 0,
      lowStockThreshold: 15,
      sku: '',
      skuPrefix: categories[0]?.skuPrefix ?? 'SKU',
      isAutoSku: true,
      purchaseDate: '',
      expirationDate: '',
      image: null
    }
  })

  if (!isOpen) return null

  const handleAIGenerate = (title: string, idea: string) => {
    setIsGeneratingAI(true)
    setTimeout(() => {
      const aiDescription = `<h3>${title}</h3><p>Esta es una descripción generada por IA basada en: ${idea}. Ofrece información profesional sobre beneficios y características únicas del producto.</p>`
      setFormData(prev => ({ ...prev, description: prev.description + aiDescription }))
      setIsGeneratingAI(false)
    }, 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const categoryName = (form.querySelector('[name="category"]') as HTMLSelectElement)?.value
    const category = categories.find(c => c.name === categoryName)
    
    const data = {
      nombre: formData.name,
      slug: formData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      descripcion: formData.description,
      contenido: formData.description,
      metodo_pago: 'ambos' as const,
      precio_usd: formData.price,
      precio_coins: formData.bliscoins,
      tipo: 'digital' as const,
      categoria_id: category?.id ?? null,
      imagen_principal: formData.image,
      stock: isUnlimitedStock ? 0 : formData.stock,
      stock_ilimitado: isUnlimitedStock,
      sku: formData.isAutoSku ? `${formData.skuPrefix}-${(editingProduct?.id || Date.now()).toString().substring(0, 4)}` : formData.sku,
      sku_prefix: formData.skuPrefix,
      is_auto_sku: formData.isAutoSku,
      precio_comparacion: formData.originalPrice,
      descuento_porcentaje: 0,
      descuento_hasta: null,
      stock_bajo_nivel: formData.lowStockThreshold,
      activo: true,
      destacado: false,
      es_perecedero: isPerishable,
      fecha_compra: formData.purchaseDate || undefined,
      fecha_vencimiento: formData.expirationDate || undefined,
      manejo_perecedero: perishableHandling
    }

    await onSave(data)
    onClose()
  }

  return (
    <div className="w-full space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-8 pt-8">
      <div className="sticky top-[-1px] bg-black/80 backdrop-blur-2xl z-[50] py-4 border-b border-white/5 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all">←</button>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h1>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Gestor de Catálogo</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center animate-pulse">
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{taxCurrency.name} ({taxCurrency.code})</span>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Moneda Fiscal de Referencia</span>
            </div>
          </div>
          <div className="flex items-center gap-6 px-8 py-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-gray-600 uppercase">Multimoneda</span>
              <span className="text-[10px] font-black uppercase text-emerald-500">Activo</span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-gray-600 uppercase">BlisCoins</span>
              <span className={`text-[10px] font-black uppercase ${isBlisCoinsEnabled ? 'text-amber-500' : 'text-gray-600'}`}>
                {isBlisCoinsEnabled ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form className="max-w-4xl mx-auto space-y-8" onSubmit={handleSubmit}>
        <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-10 shadow-2xl">
          <ProductImageUploader
            image={formData.image}
            onImageChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre del Producto</label>
              <input
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                type="text"
                placeholder="Ej. Whey Protein Isolate"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-800 focus:outline-none focus:border-blis-red transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción</label>
              <RichTextEditor
                value={formData.description}
                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                placeholder="Describe el producto detalladamente..."
                onAIGenerate={handleAIGenerate}
                isGeneratingAI={isGeneratingAI}
                onCancelAIGenerate={() => setIsGeneratingAI(false)}
              />
</div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pb-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</label>
              {categories.length === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-3">
                  <p className="text-[10px] font-bold text-amber-500">⚠️ No hay categorías disponibles. Crea una categoría primero.</p>
                </div>
              )}
              <select
                name="category"
                required={categories.length > 0}
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blis-red transition-all appearance-none disabled:opacity-50"
                disabled={categories.length === 0}
              >
                {categories.length === 0 && <option value="" className="bg-zinc-900">-- Sin categoría --</option>}
                {categories.map(c => <option key={c.id} value={c.name} className="bg-zinc-900">{c.name} ({c.skuPrefix})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pb-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Prefijo / Patrón SKU</label>
                <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer leading-none">
                  <input
                    type="checkbox"
                    checked={formData.isAutoSku}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAutoSku: e.target.checked }))}
                    className="accent-blue-500 w-3 h-3"
                  />
                  Automático
                </label>
              </div>
              <div className="flex gap-2">
                <select
                  value={formData.skuPrefix}
                  onChange={(e) => setFormData(prev => ({ ...prev, skuPrefix: e.target.value }))}
                  className="w-[120px] bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs font-black text-blue-400 focus:outline-none focus:border-blue-500 transition-all appearance-none uppercase tracking-widest"
                >
                  <optgroup label="Categorías" className="bg-zinc-900 text-gray-500">
                    {categories.map(c => <option key={c.id} value={c.skuPrefix}>{c.skuPrefix}</option>)}
                  </optgroup>
                </select>
                <input
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  type="text"
                  placeholder="SKU Manual"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-800 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <ProductPriceSection
              price={formData.price}
              originalPrice={formData.originalPrice}
              bliscoins={formData.bliscoins}
              currencySymbol={selectedCurrency.symbol}
              isBlisCoinsEnabled={isBlisCoinsEnabled}
              onPriceChange={(price) => setFormData(prev => ({ ...prev, price }))}
              onOriginalPriceChange={(originalPrice) => setFormData(prev => ({ ...prev, originalPrice }))}
              onBlisCoinsChange={(bliscoins) => setFormData(prev => ({ ...prev, bliscoins }))}
            />

            <ProductStockSection
              stock={formData.stock}
              lowStockThreshold={formData.lowStockThreshold}
              isUnlimited={isUnlimitedStock}
              onStockChange={(stock) => setFormData(prev => ({ ...prev, stock }))}
              onThresholdChange={(lowStockThreshold) => setFormData(prev => ({ ...prev, lowStockThreshold }))}
              onUnlimitedChange={setIsUnlimitedStock}
            />

            {settings.enablePerishables && (
              <PerishableSection
                isPerishable={isPerishable}
                purchaseDate={formData.purchaseDate}
                expirationDate={formData.expirationDate}
                perishableHandling={perishableHandling}
                onPerishableChange={setIsPerishable}
                onPurchaseDateChange={(purchaseDate) => setFormData(prev => ({ ...prev, purchaseDate }))}
                onExpirationDateChange={(expirationDate) => setFormData(prev => ({ ...prev, expirationDate }))}
                onPerishableHandlingChange={setPerishableHandling}
              />
            )}
          </div>

          <div className="pt-8 flex justify-end gap-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-8 py-4 text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-white hover:bg-white/5 rounded-2xl transition-colors">
              Descartar
            </button>
            <button type="submit" className="bg-blis-red text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl shadow-blis-red/20 active:scale-95">
              {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}