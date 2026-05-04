/**
 * Peru APIs Utility — Decolecta.com
 * Consultas DNI (RENIEC), RUC (SUNAT) y tipo de cambio (SBS).
 */
export interface PeruCustomerData {
  success: boolean
  name: string
  dni?: string
  ruc?: string
  address?: string
  department?: string
  province?: string
  district?: string
  country?: string
  status?: string
  condition?: string
  firstName?: string
  lastName?: string
  education?: string
  profession?: string
  maritalStatus?: string
  birthDate?: string
  lastUpdate?: string
  type: 'natural' | 'juridica'
  message?: string
}

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}

  const configStr = localStorage.getItem('blis_ai_config')
  if (configStr) {
    try {
      const config = JSON.parse(configStr)
      if (config.PERU_API_TOKEN) {
        return { 'x-peru-api-token': config.PERU_API_TOKEN }
      }
    } catch { /* ignore */ }
  }

  const individualToken = localStorage.getItem('peru_api_token')
  if (individualToken) {
    return { 'x-peru-api-token': individualToken }
  }

  return {}
}

export const fetchDniData = async (dni: string): Promise<PeruCustomerData> => {
  if (dni.length !== 8) throw new Error('DNI debe tener 8 dígitos')

  if (dni === '00000000') {
    return {
      success: true,
      name: 'CARLOS ENRIQUE PEREZ GOMEZ',
      firstName: 'CARLOS ENRIQUE',
      lastName: 'PEREZ GOMEZ',
      dni: '00000000',
      address: 'Av. Paseo de la República 123',
      district: 'SANTIAGO DE SURCO',
      province: 'LIMA',
      department: 'LIMA',
      birthDate: '1990-05-12',
      maritalStatus: 'SOLTERO',
      profession: 'INGENIERO DE SISTEMAS',
      education: 'SUPERIOR COMPLETA',
      type: 'natural',
    }
  }

  try {
    const response = await fetch(`/api/peru-api?type=dni&id=${dni}`, {
      headers: getAuthHeaders(),
    })
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Error al consultar DNI')
    }

    const r = data.data || data
    return {
      success: true,
      name: r.full_name || `${r.first_name || ''} ${r.first_last_name || ''} ${r.second_last_name || ''}`.trim(),
      firstName: r.first_name || '',
      lastName: `${r.first_last_name || ''} ${r.second_last_name || ''}`.trim(),
      dni,
      address: r.direccion || '',
      department: r.departamento || '',
      province: r.provincia || '',
      district: r.distrito || '',
      country: 'PERÚ',
      type: 'natural',
      birthDate: r.fecha_nacimiento || r.nacimiento || '',
      education: r.nivel_instruccion || r.estudios || '',
      profession: r.profesion || r.ocupacion || '',
      maritalStatus: r.estado_civil || '',
      condition: r.condicion || '',
      status: r.estado || '',
    }
  } catch (error: any) {
    return { success: false, name: '', message: error.message, type: 'natural' }
  }
}

export const fetchRucData = async (ruc: string): Promise<PeruCustomerData> => {
  if (ruc.length !== 11) throw new Error('RUC debe tener 11 dígitos')

  if (ruc === '10000000001') {
    return {
      success: true,
      name: 'BLIS CORP PERU S.A.C.',
      ruc: '10000000001',
      address: 'Calle Los Negocios 456, San Isidro',
      department: 'LIMA',
      province: 'LIMA',
      district: 'SAN ISIDRO',
      status: 'ACTIVO',
      condition: 'HABIDO',
      type: 'juridica',
    }
  }

  try {
    const response = await fetch(`/api/peru-api?type=ruc&id=${ruc}`, {
      headers: getAuthHeaders(),
    })
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || 'Error al consultar RUC')
    }

    const r = data.data || data
    return {
      success: true,
      name: r.razon_social || r.nombre_o_razon_social || r.nombre || '',
      ruc,
      address: r.direccion || '',
      department: r.departamento || '',
      province: r.provincia || '',
      district: r.distrito || '',
      country: 'PERÚ',
      status: r.estado || r.condicion || '',
      condition: r.condicion || r.estado_contribuyente || '',
      birthDate: r.fecha_inscripcion || r.fecha_inicio_actividades || '',
      lastUpdate: r.fecha_actualizacion || '',
      type: 'juridica',
    }
  } catch (error: any) {
    return { success: false, name: '', message: error.message, type: 'juridica' }
  }
}

export const fetchExchangeRate = async (country?: string): Promise<{ success: boolean; buy: number; sell: number; message?: string }> => {
  try {
    // Intentar con Decolecta (requiere token)
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('peru_api_token') || '')
      : ''
    if (token) {
      const response = await fetch(`/api/peru-api?type=tipo_cambio`, {
        headers: { 'x-peru-api-token': token },
      })
      const data = await response.json()
      if (data.success) {
        const r = data.data || data
        return {
          success: true,
          buy: parseFloat(r.buy_price || r.compra) || 3.75,
          sell: parseFloat(r.sell_price || r.venta) || 3.80,
        }
      }
    }

    // Fallback: API pública gratuita SUNAT
    const res = await fetch(`/api/public/tipo-cambio?country=${country || 'PE'}`)
    const publicData = await res.json()
    if (publicData.success) {
      return {
        success: true,
        buy: publicData.buy || publicData.usdToPen || 3.75,
        sell: publicData.sell || publicData.usdToPen || 3.80,
      }
    }

    return { success: false, buy: 3.75, sell: 3.80, message: publicData.message || 'No disponible' }
  } catch (error: any) {
    return { success: false, buy: 3.75, sell: 3.80, message: error.message }
  }
}

export const fetchWhatsAppStatus = async (phone: string): Promise<{ success: boolean; hasWhatsApp?: boolean; message?: string }> => {
  if (!phone || phone.length < 7) return { success: false, message: 'Teléfono inválido' }

  try {
    const clean = phone.replace(/[^0-9]/g, '')
    const token = typeof window !== 'undefined' ? localStorage.getItem('peru_api_token') : ''
    // WhatsApp check usa el mismo endpoint de ApiConsult (es universal)
    const res = await fetch(`/api/ecuador-api?type=whatsapp&id=${clean}`, {
      headers: { 'x-apiconsult-token': token || '' },
    })
    const data = await res.json()
    if (!data.success) {
      return { success: false, message: data.message || 'Error al verificar WhatsApp' }
    }
    return { success: true, hasWhatsApp: data.data?.hasWhatsapp || data.data?.has_whatsapp || data.data?.active || false }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
