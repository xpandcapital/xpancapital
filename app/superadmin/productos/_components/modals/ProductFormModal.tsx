"use client"

import { useState } from "react"
import { Globe, Copy, Check, Loader2, X, Search, GraduationCap, Link2, Unlink2 } from "lucide-react"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import { ProductImageUploader } from './ProductImageUploader'
import { ProductPriceSection } from './ProductPriceSection'
import { ProductStockSection } from './ProductStockSection'
import { PerishableSection } from './PerishableSection'
import RichTextEditor from "@/components/superadmin/RichTextEditor"
import type { Product, Category, Status, Currency, PerishableHandling } from '../../_types'
import type { Currency as CurrencyObj } from '@/context/CurrencyContext'

const SITE_DOMAIN = 'xpancapital.org'

function generateSlug(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

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
  activeMultiCurrencies?: CurrencyObj[]
  settings: {
    enablePerishables: boolean
    enableSerialization: boolean
  }
  cursos?: Array<{ id: string; nombre: string }>
  onClose: () => void
  onSave: (data: any) => Promise<{ shortSlug?: string } | void>
}

export function ProductFormModal({
  isOpen,
  editingProduct,
  categories,
  currencies,
  selectedCurrency,
  taxCurrency,
  isMultiCurrencyEnabled,
  isBlisCoinsEnabled,
  activeMultiCurrencies = [],
  settings,
  cursos = [],
  onClose,
  onSave
}: ProductFormModalProps) {
  const [isPerishable, setIsPerishable] = useState(editingProduct?.isPerishable ?? settings.enablePerishables ?? false)
  const [perishableHandling, setPerishableHandling] = useState<PerishableHandling>(editingProduct?.perishableHandling ?? 'discard')
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(editingProduct ? editingProduct.stock === -1 : true)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isAutoSlug, setIsAutoSlug] = useState(editingProduct ? !editingProduct.slug : true)
  const [shortSlug, setShortSlug] = useState(editingProduct?.shortSlug || '')
  const [shortSlugEditing, setShortSlugEditing] = useState(false)
  const [shortSlugValue, setShortSlugValue] = useState('')
  const [shortSlugSaving, setShortSlugSaving] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [formData, setFormData] = useState<{
    name: string; slug: string; metaDescripcion: string; description: string;
    category: string; price: number; originalPrice: number; bliscoins: number;
    stock: number; lowStockThreshold: number; sku: string; skuPrefix: string;
    isAutoSku: boolean; purchaseDate: string; expirationDate: string;
    image: string | null; cursoId: string | null; multiPrices: Record<string, number>;
    duracion_dias: number | null; multiOriginalPrices: Record<string, number>;
  }>(() => {
    if (editingProduct) {
      return {
        name: editingProduct.name,
        slug: editingProduct.slug || generateSlug(editingProduct.name),
        metaDescripcion: editingProduct.metaDescripcion || '',
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
        image: editingProduct.image || null,
        cursoId: editingProduct.curso_id || null,
        multiPrices: editingProduct.precios_multimoneda || {} as Record<string, number>,
        duracion_dias: editingProduct.duracion_dias || null,
        multiOriginalPrices: {},
      }
    }
    return {
      name: '',
      slug: '',
      metaDescripcion: '',
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
      image: null,
      cursoId: null,
      multiPrices: {} as Record<string, number>,
      duracion_dias: null,
      multiOriginalPrices: {} as Record<string, number>,
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
    try {
    const form = e.target as HTMLFormElement
    const category = categories.find(c => c.name === formData.category)
    
    const finalSlug = isAutoSlug ? generateSlug(formData.name) : formData.slug
    
    const data = {
      nombre: formData.name,
      slug: finalSlug,
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
      duracion_dias: formData.duracion_dias || null,
      destacado: false,
      es_perecedero: isPerishable,
      fecha_compra: formData.purchaseDate || undefined,
      fecha_vencimiento: formData.expirationDate || undefined,
      manejo_perecedero: perishableHandling,
      meta_descripcion: formData.metaDescripcion || null,
      meta_titulo: null,
      curso_id: formData.cursoId || null,
      precios_multimoneda: isMultiCurrencyEnabled ? formData.multiPrices : {},
    }

    const result = await onSave(data)

    // Si es producto nuevo, actualizar shortSlug con el generado por el backend
    if (!editingProduct?.id && result?.shortSlug) {
      setShortSlug(result.shortSlug)
      setLinkCopied(false)
    }

    // Solo cerrar si es edición (ya existía)
    if (editingProduct?.id) {
      onClose()
    }
    } catch (err: any) {
      console.error('Error guardando producto:', err)
      alert('Error al guardar: ' + (err?.message || 'Error desconocido'))
    }
  }

  // ── Handlers para enlace corto ──────────────────────────────────────────────
  const handleSaveShortSlug = async () => {
    if (!shortSlugValue.trim() || !formData.slug) return
    const code = shortSlugValue.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!/^[a-z0-9]{3,20}$/.test(code)) return
    setShortSlugSaving(true)
    try {
      const productoUrl = `/tienda/producto/${formData.slug}`
      const res = await fetch('/api/short-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productoUrl, nuevo_codigo: code })
      })
      const result = await res.json()
      if (result.success) {
        setShortSlug(result.codigo)
        setShortSlugEditing(false)
      } else if (result.error) {
        alert(result.error)
      }
    } catch (err) {
      console.error('Error guardando short slug:', err)
    } finally {
      setShortSlugSaving(false)
    }
  }

  return (
    <div className="w-full">
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
              <span className={`text-[10px] font-black uppercase ${isMultiCurrencyEnabled ? 'text-emerald-500' : 'text-gray-600'}`}>
                {isMultiCurrencyEnabled ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-gray-600 uppercase">Xpand Coins</span>
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
                onChange={(e) => {
                  const name = e.target.value
                  setFormData(prev => ({ ...prev, name, slug: isAutoSlug ? generateSlug(name) : prev.slug }))
                }}
                type="text"
                placeholder="Ej. Whey Protein Isolate"
                className="w-full"
              />
            </div>

            {/* Enlace público (slug) */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between items-center pb-1">
                <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Enlace Público (URL)</label>
                <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer leading-none">
                  <input
                    type="checkbox"
                    checked={isAutoSlug}
                    onChange={(e) => {
                      setIsAutoSlug(e.target.checked)
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }))
                      }
                    }}
                    className="accent-emerald-500 w-3 h-3"
                  />
                  Automático
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-mono shrink-0 hidden sm:inline">{SITE_DOMAIN}/tienda/producto/</span>
                <span className="text-gray-500 text-xs font-mono shrink-0 sm:hidden">/</span>
                <input
                  value={formData.slug}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
                    setFormData(prev => ({ ...prev, slug }))
                  }}
                  disabled={isAutoSlug}
                  type="text"
                  placeholder="whey-protein-isolate"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono placeholder:text-gray-800 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                />
              </div>
              {formData.slug && (
                <p className="text-[10px] text-gray-600 font-mono truncate flex items-center gap-2">
                  <span>Vista previa:</span>
                  <span className="text-emerald-500/70">https://{SITE_DOMAIN}/tienda/producto/{formData.slug}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://${SITE_DOMAIN}/tienda/producto/${formData.slug}`)
                      setLinkCopied(true)
                      setTimeout(() => setLinkCopied(false), 1500)
                    }}
                    className="p-1 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors flex-shrink-0"
                    title="Copiar enlace"
                  >
                    {linkCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </p>
              )}
            </div>

            {/* Enlace corto */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Enlace Corto para Compartir</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-mono shrink-0 hidden sm:inline">{SITE_DOMAIN}/s/</span>
                <span className="text-gray-500 text-xs font-mono shrink-0 sm:hidden">s/</span>
                <input
                  type="text"
                  value={shortSlugEditing ? shortSlugValue : (shortSlug || '')}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
                    setShortSlugValue(val)
                    setShortSlugEditing(true)
                  }}
                  onFocus={() => {
                    if (!shortSlugEditing) {
                      setShortSlugValue(shortSlug || '')
                      setShortSlugEditing(true)
                    }
                  }}
                  placeholder={shortSlug ? shortSlug : 'código-corto'}
                  maxLength={20}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSaveShortSlug()
                    }
                  }}
                />
                {shortSlugEditing && (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveShortSlug}
                      disabled={shortSlugSaving || !shortSlugValue.trim()}
                      className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
                    >
                      {shortSlugSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShortSlugEditing(false)}
                      className="p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
              {!shortSlug && !shortSlugEditing && (
                <p className="text-[10px] text-amber-400/70 flex items-center gap-1">
                  Se generará automáticamente al guardar el producto
                </p>
              )}
              {shortSlug && !shortSlugEditing && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${SITE_DOMAIN}/s/${shortSlug}`)
                    setLinkCopied(true)
                    setTimeout(() => setLinkCopied(false), 1500)
                  }}
                  className="text-[10px] text-emerald-400/70 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-2.5 h-2.5" />
                  Copiar enlace corto
                </button>
              )}
            </div>

            {/* Descripción para compartir (meta) */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex justify-between items-center pb-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Descripción para Compartir (SEO/Redes)</label>
                <span className={`text-[9px] font-black ${(formData.metaDescripcion || '').length > 160 ? 'text-red-500' : 'text-gray-600'}`}>
                  {(formData.metaDescripcion || '').length}/160
                </span>
              </div>
              <textarea
                value={formData.metaDescripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescripcion: e.target.value }))}
                rows={2}
                maxLength={200}
                placeholder="Texto corto que aparece al compartir el enlace en WhatsApp, Facebook, etc. Si lo dejas vacío, se usa la imagen del producto."
                className="w-full"
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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</label>
              {categories.length === 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-3">
                  <p className="text-[10px] font-bold text-amber-500">⚠️ No hay categorías disponibles. Crea una categoría primero.</p>
                </div>
              )}
              <SearchableSelect
                value={formData.category}
                onChange={(value) => {
                  const cat = categories.find(c => c.name === value)
                  setFormData(prev => ({ ...prev, category: value, skuPrefix: cat?.skuPrefix || prev.skuPrefix }))
                }}
                options={categories.length === 0 ? [{ value: "", label: "-- Sin categoría --" }] : categories.map(c => ({ value: c.name, label: `${c.name} (${c.skuPrefix})` }))}
                placeholder="Seleccionar categoría..."
                className={`w-full ${categories.length === 0 ? "opacity-50 pointer-events-none" : ""}`}
              />
            </div>

            {cursos.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                  Vincular a Curso
                </label>

                {formData.cursoId ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-sm text-purple-300 truncate">
                        {cursos.find(c => c.id === formData.cursoId)?.nombre || 'Curso vinculado'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cursoId: null }))}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Desvincular curso"
                    >
                      <Unlink2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <CursoSelector cursos={cursos} onSelect={(id) => setFormData(prev => ({ ...prev, cursoId: id }))} />
                )}

                {formData.cursoId && (
                  <p className="text-[10px] text-purple-400/70 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    Al comprar este producto se asignará automáticamente el curso vinculado
                  </p>
                )}
              </div>
            )}

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
                <SearchableSelect
                  value={formData.skuPrefix}
                  onChange={(value) => setFormData(prev => ({ ...prev, skuPrefix: value }))}
                  options={categories.map(c => ({ value: c.skuPrefix, label: c.skuPrefix }))}
                  placeholder="SKU"
                  className="w-[120px]"

                />
                <input
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  type="text"
                  placeholder="SKU Manual"
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <ProductPriceSection
              price={formData.price}
              originalPrice={formData.originalPrice}
              bliscoins={formData.bliscoins}
              currencySymbol={selectedCurrency.symbol}
              isBlisCoinsEnabled={isBlisCoinsEnabled}
              isMultiCurrencyEnabled={isMultiCurrencyEnabled}
              activeCurrencies={activeMultiCurrencies}
              multiPrices={formData.multiPrices}
              multiOriginalPrices={formData.multiOriginalPrices}
              onPriceChange={(price) => setFormData(prev => ({ ...prev, price }))}
              onOriginalPriceChange={(originalPrice) => setFormData(prev => ({ ...prev, originalPrice }))}
              onBlisCoinsChange={(bliscoins) => setFormData(prev => ({ ...prev, bliscoins }))}
              onMultiPriceChange={(code, price) => setFormData(prev => ({ ...prev, multiPrices: { ...prev.multiPrices, [code]: price } }))}
              onMultiOriginalPriceChange={(code, price) => setFormData(prev => ({ ...prev, multiOriginalPrices: { ...prev.multiOriginalPrices, [code]: price } }))}
            />

            <ProductStockSection
              stock={formData.stock}
              lowStockThreshold={formData.lowStockThreshold}
              isUnlimited={isUnlimitedStock}
              onStockChange={(stock) => setFormData(prev => ({ ...prev, stock }))}
              onThresholdChange={(lowStockThreshold) => setFormData(prev => ({ ...prev, lowStockThreshold }))}
              onUnlimitedChange={setIsUnlimitedStock}
            />

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Duración del Acceso</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-400 uppercase font-bold">Duración (días)</label>
                  <input type="number" value={formData.duracion_dias || ''} onChange={e => setFormData(prev => ({ ...prev, duracion_dias: parseInt(e.target.value) || null }))}
                    placeholder="Vitalicio" min={0}
                    className="w-32 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blis-red/50" />
                </div>
                <span className="text-[10px] text-gray-500">0 = acceso vitalicio · 90 = 3 meses · 365 = 1 año</span>
              </div>
            </div>

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

function CursoSelector({ cursos, onSelect }: { cursos: Array<{ id: string; nombre: string }>; onSelect: (id: string) => void }) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState("")

  const filtrados = cursos
    .filter(c => !busqueda || c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="w-full flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-dashed border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-xs text-gray-400 hover:text-purple-400"
      >
        <Search className="w-3.5 h-3.5" />
        Buscar y vincular un curso existente...
      </button>
    )
  }

  return (
    <div className="space-y-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">
          Seleccionar curso
        </span>
        <button
          type="button"
          onClick={() => { setAbierto(false); setBusqueda("") }}
          className="text-[10px] text-gray-500 hover:text-white"
        >
          Cancelar
        </button>
      </div>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar curso..."
        className="w-full"
        autoFocus
      />
      <div className="max-h-40 overflow-y-auto space-y-0.5">
        {filtrados.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => { onSelect(c.id); setAbierto(false); setBusqueda("") }}
            className="w-full"
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            {c.nombre}
          </button>
        ))}
        {filtrados.length === 0 && (
          <p className="text-[10px] text-gray-500 px-3 py-2 text-center">
            {busqueda ? 'No se encontraron cursos' : 'No hay cursos disponibles'}
          </p>
        )}
      </div>
    </div>
  )
}
