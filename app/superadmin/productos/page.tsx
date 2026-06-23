"use client"

import { useState, useEffect } from "react"
import { useActionGuard } from '@/hooks/useActionGuard'
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, CheckCircle2, Package } from "lucide-react"
import { useProducts } from "./_hooks/useProducts"
import { useProductFilters } from "./_hooks/useProductFilters"
import { useProductSelection } from "./_hooks/useProductSelection"
import { usePagination } from "./_hooks/usePagination"
import { useProductAnalytics } from "./_hooks/useProductAnalytics"
import { Header, SearchFilterBar, ViewModeToggle, PaginationBar, AnalyticsSection, BulkEditActions } from "./_components"
import { DeleteConfirmModal, MassEditModal, ProductFormModal, QRBarcodeModal } from "./_components/modals"
import { ProductListView, ProductGridView, CompactTableView } from "./_components/views"
import { CategoryProvider, useCategories } from "@/context/CategoryContext"
import type { Product, QRModalType } from "./_types"
import { StatusProvider, useStatuses } from "@/context/StatusContext"
import { SkuProvider, useSku } from "@/context/SkuContext"
import { CurrencyProvider, useCurrency } from "@/context/CurrencyContext"
import { LabelProvider, useLabel } from "@/context/LabelContext"
import { UnitProvider } from "@/context/UnitContext"
import { BusinessSettingsProvider, useBusinessSettings } from "@/context/BusinessSettingsContext"
import { ShippingProvider } from "@/context/ShippingContext"
import type { ViewMode } from "./_types"

function AdminProductsContent() {
  const { settings } = useBusinessSettings()
  const { guard } = useActionGuard()
  const { categories: contextCategories } = useCategories()
  const { statuses: contextStatuses } = useStatuses()
  const { skuPatterns } = useSku()
  const { currencies, selectedCurrency, taxCurrency, activeCurrencyCodes, isMultiCurrencyEnabled, isBlisCoinsEnabled } = useCurrency()
  const { settings: labelSettings, updateSettings: updateLabelSettings } = useLabel()

  const { products, isLoading, fetchProducts, createProduct, updateProduct, deleteProducts } = useProducts()
  const { filters, setFilters, searchTerm, setSearchTerm, categoryFilters, setCategoryFilters, sortConfig, handleSort, filteredProducts, sortedProducts } = useProductFilters(products)
  const { selectedProducts, toggleProductSelection, toggleAllSelection, handleSelectAllGlobal, clearSelection } = useProductSelection()
  const { currentPage, setCurrentPage, itemsPerPage, setItemsPerPage, totalPages, paginatedItems } = usePagination(sortedProducts.length)
  const { analytics } = useProductAnalytics(filteredProducts, contextCategories.map(c => c.name))

  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [isBulkEditing, setIsBulkEditing] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true)
  const [showTools, setShowTools] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ isOpen: boolean; productId: string | 'bulk' }>({ isOpen: false, productId: '' })
  const [isMassEditing, setIsMassEditing] = useState(false)
  const [massEditData, setMassEditData] = useState<{ category: string; status: string }>({ category: '', status: '' })
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<"success" | "deleted">("success")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; items: Array<{ product: Product; quantity: number }>; type: QRModalType }>({ isOpen: false, items: [], type: 'default' })
  const [cursos, setCursos] = useState<Array<{ id: string; nombre: string }>>([])

  useEffect(() => {
    fetch('/api/admin/cursos?limit=500')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setCursos(d.data.map((c: any) => ({ id: c.id, nombre: c.nombre })))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("blis_default_view")
    if (saved === "compact" || saved === "list" || saved === "grid") {
      setViewMode(saved as ViewMode)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("blis_default_view", viewMode)
  }, [viewMode])

  const categories = ["Todas", ...contextCategories.map(c => c.name)]
  const statusOptions = contextStatuses.map(s => s.name)

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      if (!guard('productos', 'editar')) return
    } else {
      if (!guard('productos', 'crear')) return
    }
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleDelete = async () => {
    if (!guard('productos', 'eliminar')) return
    const idsToDelete = showDeleteConfirm.productId === 'bulk' ? selectedProducts : [showDeleteConfirm.productId]
    await deleteProducts(idsToDelete)
    clearSelection()
    setShowDeleteConfirm({ isOpen: false, productId: '' })
    setToastType("deleted")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleMassEdit = async () => {
    if (massEditData.category || massEditData.status) {
      for (const id of selectedProducts) {
        const updates: Partial<Product> = {}
        if (massEditData.category) updates.category = massEditData.category
        if (massEditData.status) updates.status = massEditData.status as any
        await updateProduct(id, updates)
      }
      clearSelection()
      setIsMassEditing(false)
      setMassEditData({ category: '', status: '' })
      setToastType("success")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

const handleBulkUpdate = async (id: string, field: string, value: string | number | boolean) => {
    await updateProduct(id, { [field]: value })
  }

  const handleToggleBulkEdit = () => {
    if (!isBulkEditing) {
      setIsBulkEditing(true)
    } else {
      setIsBulkEditing(false)
      setToastType("success")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handlePrintLabels = (product: Product) => {
    setQrModal({ isOpen: true, items: [{ product, quantity: 1 }], type: 'default' })
  }

  const handlePrintLabelsBulk = () => {
    const items = selectedProducts.map(id => {
      const product = products.find(p => p.id === id)
      return product ? { product, quantity: 1 } : null
    }).filter(Boolean) as Array<{ product: Product; quantity: number }>
    setQrModal({ isOpen: true, items, type: 'default' })
  }

  const paginatedProducts = paginatedItems(sortedProducts) as Product[]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-inter selection:bg-blis-red/30 selection:text-white pb-20 overflow-x-hidden">
        <div className="space-y-8 w-full mx-auto px-4 md:px-8 pt-8 md:pt-8 text-center py-20">
          <div className="w-12 h-12 border-4 border-blis-red/20 border-t-blis-red rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4 font-black uppercase tracking-[0.3em] text-[10px]">Cargando Sistema...</p>
        </div>
      </div>
    )
  }

  const handleSaveProduct = async (data: any): Promise<{ shortSlug?: string }> => {
    try {
      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, data)
        return {}
      } else {
        const res = await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        const result = await res.json()
        if (!result.success) throw new Error(result.error || 'Error al crear producto')
        await fetchProducts()
        setToastType("success")
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        return { shortSlug: result.shortSlug || undefined }
      }
    } catch (err) {
      console.error("Error guardando producto:", err)
      throw err
    }
  }

  if (isModalOpen) {
    return (
      <ProductFormModal
        isOpen={isModalOpen}
        editingProduct={editingProduct}
        categories={contextCategories}
        statuses={contextStatuses}
        skuPatterns={skuPatterns}
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        taxCurrency={taxCurrency}
        isMultiCurrencyEnabled={isMultiCurrencyEnabled}
        isBlisCoinsEnabled={isBlisCoinsEnabled}
        settings={{
          enablePerishables: settings?.enablePerishables ?? false,
          enableSerialization: settings?.enableSerialization ?? false
        }}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        cursos={cursos}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-inter selection:bg-blis-red/30 selection:text-white pb-20 overflow-x-hidden">
      <div id="main-ui" className="print:hidden">
        <div className="space-y-8 w-full mx-auto px-4 md:px-8 pt-8 md:pt-8">
          <Header
            onOpenModal={() => handleOpenModal(null)}
            showTools={showTools}
            onToggleTools={() => setShowTools(!showTools)}
          />



          <div className="relative">
            <div className="flex flex-col space-y-4">
              <SearchFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryFilters={categoryFilters}
                onCategoryChange={setCategoryFilters}
                categories={categories}
              />

              <div className="flex items-center gap-2">
                <BulkEditActions
                  selectedCount={selectedProducts.length}
                  isBulkEditing={isBulkEditing}
                  onToggleBulkEdit={handleToggleBulkEdit}
                  onPrintLabels={handlePrintLabelsBulk}
                  onBulkDelete={() => setShowDeleteConfirm({ isOpen: true, productId: 'bulk' })}
                />

                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>

              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={sortedProducts.length}
                selectedCount={selectedProducts.length}
                filteredCount={filteredProducts.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                onSelectAllGlobal={() => handleSelectAllGlobal(filteredProducts)}
              />
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                {viewMode === "list" && (
                  <ProductListView
                    products={paginatedProducts}
                    selectedIds={selectedProducts}
                    onToggleSelection={toggleProductSelection}
                    onToggleAll={() => toggleAllSelection(paginatedProducts)}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onEdit={handleOpenModal}
                    onDelete={(id) => setShowDeleteConfirm({ isOpen: true, productId: id })}
                    onPrintLabels={handlePrintLabels}
                    isBulkEditing={isBulkEditing}
                    onUpdateBulk={handleBulkUpdate}
                    categories={contextCategories}
                    statuses={contextStatuses}
                    currencies={currencies}
                    selectedCurrency={selectedCurrency}
                    isMultiCurrencyEnabled={isMultiCurrencyEnabled}
                    activeCurrencyCodes={activeCurrencyCodes}
                    isBlisCoinsEnabled={isBlisCoinsEnabled}
                    skuPatterns={skuPatterns}
                    filteredCount={filteredProducts.length}
                  />
                )}
                {viewMode === "compact" && (
                  <CompactTableView
                    products={paginatedProducts}
                    selectedIds={selectedProducts}
                    onToggleSelection={(id) => toggleProductSelection(id)}
                    onToggleAll={() => toggleAllSelection(paginatedProducts)}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onEdit={handleOpenModal}
                    onDelete={(id) => setShowDeleteConfirm({ isOpen: true, productId: id })}
                    onPrintLabels={handlePrintLabels}
                    isBulkEditing={isBulkEditing}
                    onUpdateBulk={handleBulkUpdate}
                    categories={contextCategories}
                    statuses={contextStatuses}
                    selectedCurrency={selectedCurrency}
                    isBlisCoinsEnabled={isBlisCoinsEnabled}
                    filteredCount={filteredProducts.length}
                  />
                )}
                {viewMode === "grid" && (
                  <ProductGridView
                    products={paginatedProducts}
                    selectedIds={selectedProducts}
                    onToggleSelection={(id) => toggleProductSelection(id)}
                    onEdit={handleOpenModal}
                    onDelete={(id) => setShowDeleteConfirm({ isOpen: true, productId: id })}
                    onPrintLabels={handlePrintLabels}
                    isBulkEditing={isBulkEditing}
                    onUpdateBulk={handleBulkUpdate}
                    categories={contextCategories}
                    statuses={contextStatuses}
                    isBlisCoinsEnabled={isBlisCoinsEnabled}
                  />
                )}

                {filteredProducts.length === 0 && (
                  <div className="p-16 md:p-32 text-center space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-10 h-10 text-gray-800" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">No hay resultados</h3>
                    <p className="text-gray-600 max-w-xs mx-auto text-sm">Prueba ajustando los filtros o buscando otro término.</p>
                    <button onClick={() => { setSearchTerm(""); setCategoryFilters(["Todas"]) }} className="text-blis-red text-xs font-black uppercase tracking-widest hover:underline mt-4">Ver todos los productos</button>
                  </div>
                )}
              </div>
            </div>

            <AnalyticsSection
              isAnalyticsOpen={isAnalyticsOpen}
              onToggle={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
              analytics={analytics}
              selectedCurrencySymbol={selectedCurrency.symbol}
              totalProducts={products.length}
              enablePerishables={settings?.enablePerishables ?? false}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 border backdrop-blur-md px-6 py-4 rounded-2xl z-[300] flex items-center gap-3 ${toastType === 'deleted' ? 'bg-red-500/20 border-red-500/30 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]'}`}
          >
            {toastType === 'deleted' ? <Trash2 className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="text-sm font-black uppercase tracking-widest">
              {toastType === 'deleted' ? "Artículo Eliminado" : "Cambios Guardados"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm.isOpen}
        isBulk={showDeleteConfirm.productId === 'bulk'}
        count={showDeleteConfirm.productId === 'bulk' ? selectedProducts.length : 1}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm({ isOpen: false, productId: '' })}
      />

      <MassEditModal
        isOpen={isMassEditing}
        selectedCount={selectedProducts.length}
        categories={categories.filter(c => c !== "Todas")}
        statuses={statusOptions}
        massEditData={massEditData}
        onCategoryChange={(category) => setMassEditData(prev => ({ ...prev, category }))}
        onStatusChange={(status) => setMassEditData(prev => ({ ...prev, status }))}
        onConfirm={handleMassEdit}
        onCancel={() => setIsMassEditing(false)}
      />

      <QRBarcodeModal
        isOpen={qrModal.isOpen}
        items={qrModal.items}
        type={qrModal.type}
        onClose={() => setQrModal({ isOpen: false, items: [], type: 'default' })}
        labelSettings={{
          showCategory: true,
          showName: true,
          showSku: true,
          showPrice: true,
          showDescription: false,
          showLogo: false,
          paperSize: 'A4',
          zoom: 0.5,
          layout: 'vertical',
          titleLines: 1,
          defaultType: 'qr'
        }}
        onLabelSettingsChange={(settings) => {}}
        selectedCurrency={selectedCurrency}
      />
    </div>
  )
}

export default function AdminProducts() {
  return (
    <BusinessSettingsProvider>
      <CategoryProvider>
        <StatusProvider>
          <SkuProvider>
            <UnitProvider>
              <CurrencyProvider>
                <LabelProvider>
                  <ShippingProvider>
                    <AdminProductsContent />
                  </ShippingProvider>
                </LabelProvider>
              </CurrencyProvider>
            </UnitProvider>
          </SkuProvider>
        </StatusProvider>
      </CategoryProvider>
    </BusinessSettingsProvider>
  )
}