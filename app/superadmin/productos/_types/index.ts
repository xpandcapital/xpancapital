// ═══════════════════════════════════════════════════════════════════════════════
// XPAND CORP - TIPOS DE PRODUCTO
// Esquemas tipados para el módulo de productos
// ═══════════════════════════════════════════════════════════════════════════════

export type ViewMode = 'grid' | 'list' | 'compact'

export type PaperSize = 'A2' | 'A3' | 'A4' | 'A5'

export type ProductStatus = 'Disponible' | 'Bajo Stock' | 'Agotado' | 'Ilimitado'

export type PerishableHandling = 'discard' | 'reimburse'

export type QRModalType = 'qr' | 'barcode' | 'web-qr' | 'default'

export interface Product {
  id: string
  sku: string
  skuPrefix: string
  isAutoSku: boolean
  name: string
  slug: string
  shortSlug: string
  category: string
  tipo?: 'digital' | 'fisico' | 'servicio' | 'suscripcion'
  price: number
  originalPrice: number
  discountPercentage: number
  discountUntil: string
  xpandCoins: number
  isxpandCoinsOnly: boolean
  stock: number
  lowStockThreshold: number
  status: ProductStatus
  image: string
  description: string
  metaDescripcion: string
  metaTitulo: string
  currencyCode: string
  precios_multimoneda: Record<string, number>
  isPerishable: boolean
  purchaseDate: string
  expirationDate: string
  perishableHandling: PerishableHandling
  batchUid: string
  unitsPerBox?: number
  isSerialized?: boolean
  categoria_id?: string
  curso_id?: string | null
  curso?: { id: string; nombre: string } | null
  duracion_dias?: number | null
  visible_en_tienda?: boolean
  activo?: boolean
}

export interface ProductFilters {
  searchTerm: string
  categoryFilters: string[]
}

export interface ProductSort {
  key: string
  direction: 'asc' | 'desc' | null
}

export interface ProductPagination {
  currentPage: number
  itemsPerPage: number
  totalPages: number
  totalItems: number
}

export interface QRModalState {
  isOpen: boolean
  items: Array<{ product: Product; quantity: number }>
  type: QRModalType
}

export interface DeleteConfirmState {
  isOpen: boolean
  productId: string | 'bulk'
}

export interface MassEditData {
  category: string
  status: string
}

export interface AnalyticsData {
  inventoryValue: number
  lowStockCount: number
  outOfStockCount: number
  totalPhysicalItems: number
  inventoryStatusData: {
    disponible: number
    bajoStock: number
    agotado: number
  }
  topCategoriesByStock: Array<{
    name: string
    stock: number
  }>
  perishableStats: {
    total: number
    critical: number
    expired: number
  }
}

export interface LabelSettings {
  showCategory: boolean
  showName: boolean
  showSku: boolean
  showPrice: boolean
  showDescription: boolean
  showLogo: boolean
  paperSize: PaperSize
  zoom: number
  layout: 'vertical' | 'horizontal'
  titleLines: 1 | 2
  defaultType: 'qr' | 'barcode' | 'web-qr'
}

export interface ProductFormData {
  nombre: string
  slug: string
  descripcion: string
  contenido: string
  metodo_pago: 'coins' | 'dinero' | 'ambos'
  precio_usd: number
  precio_coins: number
  tipo: 'digital' | 'fisico' | 'servicio' | 'suscripcion'
  categoria_id: string | null
  imagen_principal: string | null
  stock: number
  stock_ilimitado: boolean
  sku: string
  sku_prefix: string
  is_auto_sku: boolean
  precio_comparacion: number
  descuento_porcentaje: number
  descuento_hasta: string | null
  stock_bajo_nivel: number
  activo: boolean
  destacado: boolean
  es_perecedero?: boolean
  fecha_compra?: string
  fecha_vencimiento?: string
  manejo_perecedero?: PerishableHandling
  lote_uid?: string
  meta_descripcion?: string
  meta_titulo?: string
  duracion_dias?: number | null
  curso_id?: string | null
}

export interface Category {
  id: string
  name: string
  skuPrefix: string
  slug?: string
}

export interface Status {
  id: string
  name: string
  color?: string
}

export interface SkuPattern {
  id: string
  prefix: string
  name?: string
}

export interface Currency {
  code: string
  name: string
  symbol: string
}

export interface ProductContextValue {
  products: Product[]
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  createProduct: (data: ProductFormData) => Promise<Product | null>
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  deleteProducts: (ids: string[]) => Promise<void>
}
