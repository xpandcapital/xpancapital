export type ProjectLot = {
  id: string
  project_id: string
  lot_number: string
  lot_area: number
  client_name: string
  total_price: number
  status: string
  created_at: string
  payments?: Array<{ month: string; actual: number; expected: number; paymentDate?: string }>
  initial_payments?: Array<{ description: string; expected: number; actual: number; paymentDate?: string }>
}

export type Project = {
  id: string
  name: string
  status: string
  website: string | null
  location: string | null
  description: string | null
  cover_image: string | null
  gallery_images: string[]
  start_date: string | null
  end_date: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string | null
  is_active: boolean
  order_index: number | null
  created_at: string
  notion_database_id?: string | null
  notion_receipts_database_id?: string | null
  notion_last_sync?: string | null
  lots?: ProjectLot[]
}

export const STATUS_OPTIONS = [
  'EN PLANOS',
  'PREVENTA',
  'VENTA CON ESCRITURA',
  'VENTA FINALIZADA',
  'PROYECTO ENTREGADO'
]

export const LOT_STATUS_OPTIONS = [
  'Disponible',
  'Reservado',
  'Vendido',
  'Desistido'
]

export const getLotRealStatus = (lot: ProjectLot): string => {
  if (lot.client_name && lot.client_name !== 'No especificado' && lot.client_name !== '' && lot.client_name !== 'No especificado ') {
    return 'Vendido'
  }
  if (lot.status === 'Reservado') {
    return 'Reservado'
  }
  if (lot.status === 'Desistido') {
    return 'Desistido'
  }
  return 'Disponible'
}

export const getFirstPaymentDate = (lot: ProjectLot): string | null => {
  if (lot.initial_payments && lot.initial_payments.length > 0) {
    const firstInitial = lot.initial_payments.find(p => p.paymentDate && p.actual > 0)
    if (firstInitial?.paymentDate) {
      return firstInitial.paymentDate
    }
  }
  if (lot.payments && lot.payments.length > 0) {
    const firstPayment = lot.payments.find(p => p.paymentDate && p.actual > 0)
    if (firstPayment?.paymentDate) {
      return firstPayment.paymentDate
    }
  }
  return null
}

export const getProjectSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const extractNotionId = (input: string): string | null => {
  let id = input.trim()
  const idMatch = id.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})|([a-f0-9]{32})/i)
  if (idMatch) {
    id = idMatch[0].replace(/-/g, '')
    return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`
  }
  return null
}

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'EN PLANOS': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'PREVENTA': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'VENTA CON ESCRITURA': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'VENTA FINALIZADA': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'PROYECTO ENTREGADO': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }
}

export const getLotStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Vendido': return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'Disponible':
    case 'Activo': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'Reservado': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'Desistido': return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }
}

export type ProjectFormData = {
  name: string
  id: string
  status: string
  website: string
  location: string
  description: string
  cover_image: string
  gallery_images: string[]
  start_date: string
  end_date: string
  logo_url: string
  primary_color: string
  secondary_color: string
}