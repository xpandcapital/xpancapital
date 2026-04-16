'use client'

import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import type { Client, DbProfile } from '../_types'

const tierMap: Record<string, string> = {
  'platinum': 'Platinum Member',
  'gold': 'Gold Member',
  'silver': 'Silver Member',
  'bronze': 'Bronze Member'
}

const roleMap: Record<string, 'Cliente' | 'Admin' | 'Moderador' | 'Staff'> = {
  'usuario': 'Cliente',
  'cliente': 'Cliente',
  'editor': 'Staff',
  'admin': 'Admin',
  'superadmin': 'Admin'
}

const docTypeMap: Record<string, 'DNI' | 'RUC' | 'Cedula' | 'Pasaporte'> = {
  'DNI': 'DNI',
  'RUC': 'RUC',
  'Cedula': 'Cedula',
  'Pasaporte': 'Pasaporte',
  'CE': 'Pasaporte',
  'RUT': 'RUC',
  'CURP': 'Pasaporte',
  'RFC': 'RUC',
  'NIT': 'RUC',
  'TI': 'Cedula',
  'CC': 'Cedula',
  'CPF': 'Pasaporte',
  'CI': 'Cedula'
}

export function mapDbToClient(profile: DbProfile): Client {
  const docType = docTypeMap[profile.tipo_documento || 'DNI'] || 'DNI'
  let status = 'Socio'
  if (profile.verificado) status = 'Verificado'
  else if (profile.ha_comprado) status = 'Premium'

  return {
    id: profile.id,
    firstName: profile.nombre || '',
    lastName: profile.apellido || '',
    email: profile.email,
    avatar: (profile.nombre?.charAt(0) || profile.email.charAt(0)).toUpperCase(),
    role: roleMap[profile.rol] || 'Cliente',
    blisCoins: profile.blis_coins || 0,
    purchases: profile.total_compras || 0,
    income: Number(profile.total_gastado_usd) || 0,
    lastActive: profile.ultimo_login ? `Hace ${Math.floor((Date.now() - new Date(profile.ultimo_login).getTime()) / 3600000)} horas` : 'Nunca',
    status,
    joined: new Date(profile.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    birthday: profile.fecha_nacimiento || '',
    phone: profile.telefono || '',
    tier: profile.nivel_id ? (tierMap[profile.nivel_id] || 'Bronze Member') : 'Bronze Member',
    country: profile.pais || 'PE',
    region: profile.region || '',
    documentType: docType,
    dni: profile.numero_documento || '',
    maritalStatus: profile.estado_civil || '',
    profession: profile.profesion || '',
    education: profile.educacion || '',
    condition: '',
    address: '',
    city: profile.ciudad || '',
    isCompany: profile.tipo_cuenta === 'empresa',
    companyName: profile.empresa_nombre || '',
    legalRep: profile.empresa_rep_legal || '',
    addresses: (profile.addresses || []).map(addr => ({
      id: addr.id,
      type: addr.tipo === 'envio' ? 'Envio' : addr.tipo === 'facturacion' ? 'Facturacion' : 'Oficina',
      label: addr.etiqueta || '',
      address: addr.direccion,
      city: addr.ciudad
    })),
    auditLogs: [],
    internalNotes: profile.notas_internas || '',
    isNewsletterSubscribed: profile.recibir_newsletter ?? true,
    isPushEnabled: profile.recibir_push ?? true,
    isAccountFrozen: profile.cuenta_congelada ?? false,
    creditLimit: 500,
    transactions: [],
    orders: [],
    abandonedCart: null,
    coinsExpiration: profile.coins_expiran || '2024-12-31',
    academicProgress: [],
    certificates: [],
    privateEvents: [],
    managedEmployees: [],
    aiTags: [],
    heatMap: [],
    npsScore: 8,
    churnRisk: 'low',
    recommendedProducts: [],
    supportTickets: [],
    courierPreference: (profile.courier_preferido?.charAt(0).toUpperCase() + profile.courier_preferido?.slice(1)) as 'PickUp' | 'Home' | 'Office' || 'Home',
    isDifficultAccess: false,
    restockAlerts: [],
    referralCount: profile.total_referidos || 0,
    referrals: [],
    isBirthdayAutoGift: profile.cumpleanos_auto_regalo ?? true,
    inactivityReminderSent: profile.recordatorio_inactividad ?? false,
    lastLoginDate: profile.ultimo_login || ''
  }
}

export function useClients() {
  const { showToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchClients()
  }, [])

  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/clientes')
      const data = await res.json()
      if (data.success && data.data) {
        const mappedClients = data.data.map(mapDbToClient)
        setClients(mappedClients)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      showToast('Error al cargar clientes', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  const updateClient = useCallback(async (clientId: string, fields: Partial<Client>, silent = true) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return

    const updated = { ...client, ...fields }
    setClients(prev => prev.map(c => c.id === clientId ? updated : c))
    
    try {
      const dbUpdate: Record<string, unknown> = {}
      if (fields.firstName !== undefined) dbUpdate.nombre = fields.firstName
      if (fields.lastName !== undefined) dbUpdate.apellido = fields.lastName
      if (fields.email !== undefined) dbUpdate.email = fields.email
      if (fields.phone !== undefined) dbUpdate.telefono = fields.phone
      if (fields.tier !== undefined) {
        const tierReverseMap: Record<string, string> = {
          'Platinum Member': 'platinum',
          'Gold Member': 'gold',
          'Silver Member': 'silver',
          'Bronze Member': 'bronze'
        }
        dbUpdate.nivel_id = tierReverseMap[fields.tier] || 'bronze'
      }
      if (fields.documentType !== undefined) dbUpdate.tipo_documento = fields.documentType
      if (fields.dni !== undefined) dbUpdate.numero_documento = fields.dni
      if (fields.birthday !== undefined) dbUpdate.fecha_nacimiento = fields.birthday
      if (fields.maritalStatus !== undefined) dbUpdate.estado_civil = fields.maritalStatus
      if (fields.profession !== undefined) dbUpdate.profesion = fields.profession
      if (fields.education !== undefined) dbUpdate.educacion = fields.education
      if (fields.internalNotes !== undefined) dbUpdate.notas_internas = fields.internalNotes
      if (fields.isNewsletterSubscribed !== undefined) dbUpdate.recibir_newsletter = fields.isNewsletterSubscribed
      if (fields.isPushEnabled !== undefined) dbUpdate.recibir_push = fields.isPushEnabled
      if (fields.isAccountFrozen !== undefined) dbUpdate.cuenta_congelada = fields.isAccountFrozen
      if (fields.blisCoins !== undefined) dbUpdate.blis_coins = fields.blisCoins
      
      if (Object.keys(dbUpdate).length > 0) {
        await fetch('/api/admin/clientes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: clientId, ...dbUpdate })
        })
      }
    } catch (error) {
      console.error('Error updating client:', error)
    }
    
    if (!silent) showToast('Cambios guardados', 'success')
  }, [clients, showToast])

  const deleteClient = useCallback(async (clientId: string) => {
    try {
      await fetch(`/api/admin/clientes?id=${clientId}`, { method: 'DELETE' })
      setClients(prev => prev.filter(c => c.id !== clientId))
      showToast('Cuenta eliminada', 'error')
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }, [showToast])

  const formatCurrency = useCallback((amount: number) => {
    if (!isMounted) return amount.toString()
    return amount.toLocaleString()
  }, [isMounted])

  return {
    clients,
    setClients,
    isLoading,
    isMounted,
    fetchClients,
    updateClient,
    deleteClient,
    formatCurrency
  }
}