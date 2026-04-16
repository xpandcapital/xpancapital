// ═══════════════════════════════════════════════════════════════════════════════
// BLIS CORP - TIPOS DE API NUBE
// Esquemas tipados para el módulo de APIs
// ═══════════════════════════════════════════════════════════════════════════════

export type ApiFieldType = 'password' | 'text' | 'file' | 'database_selector'

export type ApiAccessType = 'Pública' | 'Privada'

export type ApiCostType = 'gratis' | 'freemium' | 'pagado'

export type ApiStatus = 'untested' | 'testing' | 'success' | 'error' | 'limit'

export type Environment = 'development' | 'production'

export interface ApiField {
  id: string
  label: string
  type?: ApiFieldType
  description: string
  getFrom: string
  accessType: ApiAccessType
  cost: ApiCostType
  docsUrl?: string
  testEndpoint?: string
  testMethod?: 'GET' | 'POST'
}

export interface ApiApp {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  description: string
  website: string
  docsUrl?: string
  fields: ApiField[]
  fallbackGroup?: string
}

export interface ApiCategory {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  description: string
  apps: ApiApp[]
}

export interface ApiConfig {
  values: Record<string, string>
  notes: Record<string, string>
  favorites: Set<string>
  status: Record<string, ApiStatus>
  environment: Environment
  lastUpdated: Record<string, string>
}

export interface ApiIdeas {
  title: string
  ideas: Array<{
    category: string
    items: string[]
  }>
}

export interface ApiFilterState {
  searchQuery: string
  filterCost: string | null
  filterAccess: string | null
  filterCountry: string | null
  showFavoritesOnly: boolean
}

export interface FallbackGroup {
  groupId: string
  apps: ApiApp[]
}

export interface ApiAppState {
  showKeys: Record<string, boolean>
  expandedCategories: Set<string>
  expandedApps: Set<string>
  categoryOrder: number[]
  appOrder: Record<string, string[]>
  favorites: Set<string>
  apiStatus: Record<string, ApiStatus>
  apiNotes: Record<string, string>
  environment: Environment
  lastUpdated: Record<string, string>
  isLoading: boolean
  isSaving: boolean
}