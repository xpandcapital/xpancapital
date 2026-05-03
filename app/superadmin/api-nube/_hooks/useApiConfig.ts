"use client"

import { useState, useEffect, useCallback } from 'react'
import type { ApiStatus, Environment } from '../_types'

const DEFAULT_VALUES: Record<string, string> = {
  notion_api_key: '',
  notion_version: '2022-06-28',
  brand2social_api_key: '',
  brand2social_user_id: '',
  cpanel_host: '',
  cpanel_username: '',
  cpanel_api_token: '',
  youtube_key: '',
  vimeo_token: '',
  vimeo_client_id: '',
  vimeo_client_secret: '',
  google_maps_key: '',
  mapbox_token: '',
  locationiq_key: '',
  openstreetmap_endpoint: 'https://nominatim.openstreetmap.org',
  supabase_url: '',
  supabase_anon_key: '',
  supabase_service_key: '',
  supabase_db_password: '',
  firebase_api_key: '',
  firebase_auth_domain: '',
  firebase_project_id: '',
  firebase_storage_bucket: '',
  firebase_messaging_sender_id: '',
  firebase_app_id: '',
  cloudinary_cloud_name: '',
  cloudinary_api_key: '',
  cloudinary_api_secret: '',
  s3_bucket: '',
  aws_access_key: '',
  aws_secret_key: '',
  aws_region: '',
  peru_api_token: '',
  tipo_cambio_api: '',
  apisunat_token: '',
  apisunat_env: '',
  apisunat_serie_f: '',
  apisunat_serie_b: '',
  olva_user: '',
  olva_password: '',
  serpost_tracking_url: '',
  reniec_api_token: '',
  apiconsult_token: '',
  apiconsult_p12: '',
  apiconsult_p12_base64: '',
  apiconsult_env: '',
  sri_api_key: '',
  tipo_cambio_ecuador: '',
  registro_civil_ec_token: '',
  dian_api_key: '',
  dian_certificate: '',
  tipo_cambio_colombia: '',
  payu_merchant_id: '',
  payu_api_key: '',
  payu_api_login: '',
  epayco_public_key: '',
  epayco_private_key: '',
  wompi_public_key: '',
  wompi_private_key: '',
  wompi_integrity_key: '',
  bancolombia_client_id: '',
  bancolombia_client_secret: '',
  datauno_api_key: '',
  validaruc_api_key: '',
  gemini_key: '',
  openai_key: '',
  groq_key: '',
  anthropic_key: '',
  huggingface_key: '',
  replicate_key: '',
  stability_key: '',
  elevenlabs_key: '',
  opencodego_key: '',
  opengozen_key: '',
  freepik_key: '',
  freepik_ai_key: '',
  flaxxa_api_key: '',
  flaxxa_auth_token: '',
  flaxxa_webhook_url: '',
  calendly_api_key: '',
  calendly_webhook_url: '',
  calcom_api_key: '',
  calcom_webhook_url: '',
  pabbly_api_key: '',
  make_api_key: '',
  make_team_id: '',
  n8n_api_url: '',
  n8n_api_key: '',
  n8n_webhook_url: '',
  zapier_webhook_url: '',
  izipay_merchant_id: '',
  izipay_public_key: '',
  izipay_client_secret: '',
  culqi_public_key: '',
  culqi_secret_key: '',
  plin_api: '',
  yape_api: '',
  paymentez_key: '',
  placetopay_key: '',
  stripe_public_key: '',
  stripe_secret_key: '',
  stripe_webhook_secret: '',
  mercadopago_access_token: '',
  mercadopago_public_key: '',
  paypal_client_id: '',
  paypal_secret: '',
  binance_api_key: '',
  binance_secret_key: '',
  coinbase_api_key: '',
  coinbase_secret: '',
  kraken_api_key: '',
  kraken_secret: '',
  bybit_api_key: '',
  bybit_secret_key: '',
  okx_api_key: '',
  okx_secret_key: '',
  okx_passphrase: '',
  coinmarketcap_key: '',
  coingecko_key: '',
  tradingview_key: '',
  metatrader_server: '',
  metatrader_login: '',
  metatrader_password: '',
  ibkr_api_key: '',
  ibkr_account_id: '',
  alpaca_api_key: '',
  alpaca_secret_key: '',
  threecommas_api_key: '',
  threecommas_secret: '',
  cryptohopper_api_key: '',
  quantconnect_api_key: '',
  ccxt_exchange: '',
  ccxt_api_key: '',
  ccxt_secret: '',
  planifyx_access_token: '',
  planifyx_instance_id: '',
  planifyx_webhook_url: '',
  twilio_account_sid: '',
  twilio_auth_token: '',
  twilio_phone_number: '',
  whatsapp_token: '',
  whatsapp_phone_id: '',
  whatsapp_business_id: '',
  resend_key: '',
  sendgrid_key: '',
  mailgun_key: '',
  pusher_app_id: '',
  pusher_key: '',
  pusher_secret: '',
  pusher_cluster: '',
  onesignal_app_id: '',
  onesignal_api_key: '',
  pushwoosh_app_id: '',
  pushwoosh_api_key: '',
  fcm_server_key: '',
  fcm_sender_id: '',
  canva_api_key: '',
  adilo_api_key: '',
  adilo_account_id: '',
  pdfmonkey_api_key: '',
  docspring_api_key: '',
  docspring_secret: '',
  pandadoc_api_key: '',
  onfido_api_key: '',
  onfido_webhook_token: '',
  jumio_api_key: '',
  jumio_api_secret: '',
  authenteq_api_key: '',
  mongodb_uri: '',
  mongodb_api_key: '',
  planetscale_api_key: '',
  planetscale_service_token: '',
  upstash_url: '',
  upstash_token: '',
  unsplash_access_key: '',
  unsplash_secret_key: '',
  pexels_api_key: '',
  pixabay_api_key: '',
  brandfetch_api_key: '',
  envato_api_key: '',
  envato_personal_token: '',
  envato_elements_email: '',
  envato_elements_password: '',
  iconfinder_api_key: '',
  flaticon_api_key: '',
  adsense_client_id: '',
  adsense_slot_id: '',
  google_ads_id: '',
  meta_pixel_id: '',
  tiktok_pixel_id: '',
  google_analytics_id: '',
  mixpanel_token: '',
  hotjar_id: '',
  plausible_domain: '',
  amplitude_key: '',
  blis_blog_time: '60',
  blis_blog_coins: '5',
}

export function useApiConfig() {
  const [apiValues, setApiValues] = useState<Record<string, string>>(DEFAULT_VALUES)
  const [apiNotes, setApiNotes] = useState<Record<string, string>>({})
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [apiStatus, setApiStatus] = useState<Record<string, ApiStatus>>({})
  const [environment, setEnvironment] = useState<Environment>('production')
  const [lastUpdated, setLastUpdated] = useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [appScopes, setAppScopes] = useState<Record<string, 'global' | 'personal'>>({})
  const [userRole, setUserRole] = useState<string>('viewer')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingApp, setIsSavingApp] = useState<string | null>(null)

  useEffect(() => {
    loadApiKeys()
    
    const savedFavs = localStorage.getItem('api_favorites')
    if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)))

    const savedNotes = localStorage.getItem('api_notes')
    if (savedNotes) setApiNotes(JSON.parse(savedNotes))

    const savedEnv = localStorage.getItem('api_environment')
    if (savedEnv) setEnvironment(savedEnv as Environment)

    const savedOrder = localStorage.getItem('api_app_order')
    if (savedOrder) {/* Handle order if needed */}
  }, [])

  const loadApiKeys = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/api-keys?unmasked=true')
      const result = await response.json()
      if (result.success && result.keys) {
        const newValues = { ...apiValues }
        const newUpdated: Record<string, string> = {}
        const newScopes: Record<string, 'global' | 'personal'> = {}
        
        // Track which apps have global vs personal keys
        const appScopeMap: Record<string, { global: number; personal: number }> = {}
        
        result.keys.forEach((row: { 
          key_name: string; 
          key_value: string; 
          has_value: boolean; 
          is_global: boolean;
          user_id: string | null;
          updated_at?: string 
        }) => {
          if (row.key_name in newValues) {
            if (row.key_value) {
              (newValues as Record<string, string>)[row.key_name] = row.key_value
            }
          }
          if (row.updated_at) newUpdated[row.key_name] = row.updated_at
          
          // Determine app scope from key prefix (e.g., "gemini_key" → "gemini")
          const appId = row.key_name.split('_')[0]
          if (appId) {
            if (!appScopeMap[appId]) appScopeMap[appId] = { global: 0, personal: 0 }
            if (row.is_global) appScopeMap[appId].global++
            else appScopeMap[appId].personal++
          }
        })
        
        // Determine final scope for each app (global wins if any global key exists)
        Object.entries(appScopeMap).forEach(([appId, counts]) => {
          newScopes[appId] = counts.global > 0 ? 'global' : 'personal'
        })
        
        setApiValues(newValues)
        setLastUpdated(prev => ({ ...prev, ...newUpdated }))
        setAppScopes(newScopes)
      }
    } catch {
      const newValues = { ...apiValues }
      Object.keys(DEFAULT_VALUES).forEach(key => {
        const val = localStorage.getItem(key)
        if (val) (newValues as Record<string, string>)[key] = val
      })
      setApiValues(newValues)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyChange = useCallback((id: string, value: string) => {
    setApiValues(prev => ({ ...prev, [id]: value }))
    const now = new Date().toISOString()
    setLastUpdated(prev => ({ ...prev, [id]: now }))
  }, [])

  const handleFileChange = useCallback((id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      const cleanBase64 = base64.split(',')[1] || base64
      setApiValues(prev => ({ ...prev, [id]: cleanBase64 }))
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSaveApp = async (appId: string, fieldIds: string[], isGlobal: boolean) => {
    setIsSavingApp(appId)
    try {
      const keysToSave: Record<string, { value: string; is_global: boolean }> = {}
      
      fieldIds.forEach(fieldId => {
        const value = apiValues[fieldId] || ''
        // Solo guardar si tiene valor o si ya existía (para borrar)
        if (value !== DEFAULT_VALUES[fieldId as keyof typeof DEFAULT_VALUES]) {
          keysToSave[fieldId] = { value, is_global: isGlobal }
        }
      })

      if (Object.keys(keysToSave).length === 0) {
        alert('No hay cambios para guardar')
        return
      }

      const response = await fetch('/api/admin/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: keysToSave }),
      })
      const result = await response.json()

      if (result.success && result.errors === 0) {
        setAppScopes(prev => ({ ...prev, [appId]: isGlobal ? 'global' : 'personal' }))
        window.dispatchEvent(new CustomEvent('blis_config_updated'))
        alert(`✅ ${appId} guardado correctamente`)
      } else if (result.success && result.errors > 0) {
        throw new Error(`${result.saved} guardadas, ${result.errors} errores`)
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (err: any) {
      Object.entries(apiValues).forEach(([k, v]) => localStorage.setItem(k, v))
      alert(`⚠️ Guardado en localStorage (error: ${err.message})`)
    } finally {
      setIsSavingApp(null)
    }
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const keysToSave: Record<string, { value: string; is_global: boolean }> = {}
      
      Object.entries(apiValues).forEach(([k, v]) => {
        if (v !== DEFAULT_VALUES[k as keyof typeof DEFAULT_VALUES] || lastUpdated[k]) {
          // Determinar si es global o personal basado en el app scope
          const appId = k.split('_')[0]
          const isGlobal = appScopes[appId] === 'global'
          keysToSave[k] = { value: v || '', is_global: isGlobal }
        }
      })

      const response = await fetch('/api/admin/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: keysToSave }),
      })
      const result = await response.json()

      if (result.success && result.errors === 0) {
        window.dispatchEvent(new CustomEvent('blis_config_updated'))
        alert(`✅ ${result.saved} claves guardadas correctamente`)
      } else if (result.success && result.errors > 0) {
        throw new Error(`${result.saved} guardadas, ${result.errors} errores`)
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (err: any) {
      Object.entries(apiValues).forEach(([k, v]) => localStorage.setItem(k, v))
      alert(`⚠️ Guardado en localStorage (error: ${err.message})`)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleFavorite = useCallback((appId: string) => {
    setFavorites(prev => {
      const newFavs = new Set(prev)
      if (newFavs.has(appId)) newFavs.delete(appId)
      else newFavs.add(appId)
      localStorage.setItem('api_favorites', JSON.stringify([...newFavs]))
      return newFavs
    })
  }, [])

  const saveNote = useCallback((appId: string, note: string) => {
    setApiNotes(prev => {
      const newNotes = { ...prev, [appId]: note }
      localStorage.setItem('api_notes', JSON.stringify(newNotes))
      return newNotes
    })
    const now = new Date().toISOString()
    setLastUpdated(prev => ({ ...prev, [appId]: now }))
  }, [])

  const copyToClipboard = useCallback(async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      console.error('Failed to copy')
      return false
    }
  }, [])

  const testApiConnection = useCallback(async (fieldId: string, value: string, extraValues?: Record<string, string>) => {
    if (!value) {
      setApiStatus(prev => ({ ...prev, [fieldId]: 'error' }))
      return 'error'
    }

    setApiStatus(prev => ({ ...prev, [fieldId]: 'testing' }))

    try {
      const res = await fetch('/api/admin/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldId, value, extraValues }),
      })
      const data = await res.json()
      if (data.valid) {
        setApiStatus(prev => ({ ...prev, [fieldId]: 'success' }))
        return 'success'
      } else {
        setApiStatus(prev => ({ ...prev, [fieldId]: 'error' }))
        return 'error'
      }
    } catch {
      setApiStatus(prev => ({ ...prev, [fieldId]: 'error' }))
      return 'error'
    }
  }, [])

  const exportConfig = useCallback(() => {
    const config = {
      version: 1,
      environment,
      values: apiValues,
      notes: apiNotes,
      favorites: [...favorites],
      lastUpdated,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blis-apis-config-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [apiValues, apiNotes, favorites, lastUpdated, environment])

  const importConfig = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string)
        if (config.values) setApiValues(config.values)
        if (config.notes) setApiNotes(config.notes)
        if (config.favorites) setFavorites(new Set(config.favorites))
        if (config.environment) setEnvironment(config.environment)
        if (config.lastUpdated) setLastUpdated(config.lastUpdated)
        alert('Configuración importada correctamente')
      } catch {
        alert('Error al importar configuración')
      }
    }
    reader.readAsText(file)
  }, [])

  return {
    apiValues,
    apiNotes,
    favorites,
    apiStatus,
    environment,
    lastUpdated,
    showKeys,
    appScopes,
    userRole,
    currentUserId,
    isLoading,
    isSaving,
    isSavingApp,
    setApiValues,
    setApiNotes,
    setFavorites,
    setApiStatus,
    setEnvironment,
    setShowKeys,
    setAppScopes,
    setUserRole,
    setCurrentUserId,
    handleKeyChange,
    handleFileChange,
    handleSaveApp,
    handleSaveAll,
    toggleFavorite,
    saveNote,
    copyToClipboard,
    testApiConnection,
    exportConfig,
    importConfig,
  }
}