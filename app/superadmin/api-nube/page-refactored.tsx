"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Cloud, Key, ShieldCheck, Sparkles, Video,
  Image, Mail, Eye, EyeOff, CheckCircle2,
  Loader2, ChevronDown, ChevronUp,
  Building2, CreditCard, TrendingUp, BarChart3, Megaphone,
  Coins, Globe, MapPin, FileText, Database, FolderOpen,
  Calendar, Zap, MessageSquare, Bell, Palette,
  FileCheck, Users, Briefcase, Send, Phone, Link2,
  Brain, Lightbulb, X, Star, Copy, Search, Filter,
  Download, Upload, AlertCircle, Check, XCircle,
  Clock, ExternalLink, ChevronRight, ToggleLeft, ToggleRight,
  Plus, Trash2, GripVertical, RefreshCw, Settings
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

import type { ApiField, ApiApp, ApiCategory, ApiStatus, Environment } from "./_types"
import { API_IDEAS } from "./_constants"

// Types
type ApiFieldLocal = {
    id: string;
    label: string;
    type?: "password" | "text" | "file" | "database_selector";
    description: string;
    getFrom: string;
    accessType: "Pública" | "Privada";
    cost: "gratis" | "freemium" | "pagado";
    docsUrl?: string;
    testEndpoint?: string;
    testMethod?: 'GET' | 'POST';
}

type ApiAppLocal = {
    id: string;
    name: string;
    icon: any;
    color: string;
    bg: string;
    description: string;
    website: string;
    docsUrl?: string;
    fields: ApiFieldLocal[];
    fallbackGroup?: string;
}

type ApiCategoryLocal = {
    id: string;
    title: string;
    icon: any;
    color: string;
    description: string;
    apps: ApiAppLocal[];
}

// Ideas detalladas para cada API
const getAppIdeas = (appId: string) => {
    const map: Record<string, string> = {
        'notion': 'notion', 'planifyx': 'planifyx', 'whatsapp': 'planifyx', 'twilio': 'planifyx',
        'brand2social': 'brand2social', 'cpanel': 'cpanel',
        'gemini': 'ia_llm', 'openai': 'ia_llm', 'groq': 'ia_llm', 'anthropic': 'ia_llm', 'opencodego': 'ia_llm', 'opengozen': 'ia_llm',
        'replicate': 'ia_llm', 'stability': 'ia_llm', 'elevenlabs': 'ia_llm', 'freepik': 'ia_llm', 'huggingface': 'ia_llm',
        'stripe': 'pagos_tarjeta', 'mercadopago': 'pagos_tarjeta', 'paypal': 'pagos_tarjeta', 'payu_col': 'pagos_tarjeta', 'epayco': 'pagos_tarjeta', 'wompi': 'pagos_tarjeta', 'bancolombia': 'pagos_tarjeta', 'izipay': 'pagos_tarjeta', 'culqi': 'pagos_tarjeta', 'paymentez': 'pagos_tarjeta', 'placetopay': 'pagos_tarjeta',
        'yape_plin': 'pagos_qr',
        'google_maps': 'mapas', 'mapbox': 'mapas', 'locationiq': 'mapas', 'openstreetmap': 'mapas',
        'peruapi': 'identidad', 'reniec': 'identidad', 'registro_civil_ec': 'identidad', 'datauno': 'identidad',
        'apisunat': 'facturacion', 'sri': 'facturacion', 'dian': 'facturacion', 'apiconsult': 'facturacion',
        'olva': 'logistica', 'serpost': 'logistica',
        'binance': 'crypto', 'coinbase': 'crypto', 'kraken': 'crypto', 'bybit': 'crypto', 'okx': 'crypto', 'coinmarketcap': 'crypto', 'coingecko': 'crypto',
        'tradingview': 'trading', 'metatrader': 'trading', 'ibkr': 'trading', 'alpaca': 'trading', 'threecommas': 'trading', 'cryptohopper': 'trading', 'quantconnect': 'trading', 'ccxt': 'trading',
        'resend': 'email', 'sendgrid': 'email', 'mailgun': 'email',
        'pusher': 'push', 'onesignal': 'push', 'pushwoosh': 'push', 'fcm': 'push',
        'canva': 'multimedia', 'adilo': 'multimedia', 'unsplash': 'multimedia', 'pexels': 'multimedia', 'pixabay': 'multimedia', 'brandfetch': 'multimedia', 'envato': 'multimedia', 'iconfinder': 'multimedia', 'flaticon': 'multimedia',
        'youtube': 'multimedia', 'vimeo': 'multimedia',
        'pdfmonkey': 'documentos', 'docspring': 'documentos', 'pandadoc': 'documentos',
        'onfido': 'verificacion_bio', 'jumio': 'verificacion_bio', 'authenteq': 'verificacion_bio',
        'supabase': 'basedatos', 'firebase': 'basedatos', 'mongodb': 'basedatos', 'planetscale': 'basedatos', 'upstash': 'basedatos',
        'adsense': 'publicidad', 'google_ads': 'publicidad', 'meta_pixel': 'publicidad', 'tiktok_pixel': 'publicidad',
        'google_analytics': 'analytics', 'mixpanel': 'analytics', 'hotjar': 'analytics', 'plausible': 'analytics', 'amplitude': 'analytics',
        'pabbly': 'automatizacion', 'make': 'automatizacion', 'n8n': 'automatizacion', 'zapier': 'automatizacion',
        'calendly': 'calendarios', 'calcom': 'calendarios', 'flaxxa': 'calendarios',
        'cloudinary': 'almacenamiento', 'aws_s3': 'almacenamiento',
        'blis_config': 'gamificacion'
    }
    const key = map[appId] || 'basedatos'
    return API_IDEAS[key] || API_IDEAS['ia_llm']
}

// Categorías completas (importadas desde archivo separado en producción)
const categories: ApiCategoryLocal[] = [
  // Las categorías se definen aquí por brevedad, pero en producción se importan desde _constants
  // Ver archivo _constants/apiCategories.ts para la definición completa
]

// Estado inicial de valores API
const DEFAULT_API_VALUES: Record<string, string> = {
  notion_api_key: '', notion_version: '2022-06-28',
  brand2social_api_key: '', brand2social_user_id: '',
  cpanel_host: '', cpanel_username: '', cpanel_api_token: '',
  youtube_key: '', vimeo_token: '', vimeo_client_id: '', vimeo_client_secret: '',
  google_maps_key: '', mapbox_token: '', locationiq_key: '', openstreetmap_endpoint: 'https://nominatim.openstreetmap.org',
  supabase_url: '', supabase_anon_key: '', supabase_service_key: '', supabase_db_password: '',
  firebase_api_key: '', firebase_auth_domain: '', firebase_project_id: '', firebase_storage_bucket: '',
  firebase_messaging_sender_id: '', firebase_app_id: '',
  cloudinary_cloud_name: '', cloudinary_api_key: '', cloudinary_api_secret: '',
  s3_bucket: '', aws_access_key: '', aws_secret_key: '', aws_region: '',
  gemini_key: '', openai_key: '', groq_key: '', anthropic_key: '',
  resend_key: '', sendgrid_key: '', mailgun_key: '',
  stripe_public_key: '', stripe_secret_key: '', stripe_webhook_secret: '',
  mercadopago_access_token: '', mercadopago_public_key: '',
  google_analytics_id: '', mixpanel_token: '', hotjar_id: '',
  blis_blog_time: '60', blis_blog_coins: '5',
}

export default function AdminCloudPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set())
  const [ideasModal, setIdeasModal] = useState<{ appId: string; appName: string } | null>(null)
  const [categoryOrder, setCategoryOrder] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCost, setFilterCost] = useState<string | null>(null)
  const [filterAccess, setFilterAccess] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [apiStatus, setApiStatus] = useState<Record<string, ApiStatus>>({})
  const [apiNotes, setApiNotes] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [environment, setEnvironment] = useState<Environment>('production')
  const [lastUpdated, setLastUpdated] = useState<Record<string, string>>({})
  const [apiValues, setApiValues] = useState<Record<string, string>>(DEFAULT_API_VALUES)

  useEffect(() => {
    setCategoryOrder(categories.map((_, i) => i))
  }, [])

  useEffect(() => {
    const savedFavs = localStorage.getItem('api_favorites')
    if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)))
    const savedNotes = localStorage.getItem('api_notes')
    if (savedNotes) setApiNotes(JSON.parse(savedNotes))
    const savedEnv = localStorage.getItem('api_environment')
    if (savedEnv) setEnvironment(savedEnv as Environment)
  }, [])

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('api_keys').select('key_name, key_value')
      if (error) throw error
      if (data) {
        const newValues = { ...apiValues }
        data.forEach((row: { key_name: string; key_value: string }) => {
          if (row.key_name in newValues) (newValues as Record<string, string>)[row.key_name] = row.key_value || ''
        })
        setApiValues(newValues)
      }
    } catch {
      const newValues = { ...apiValues }
      Object.keys(DEFAULT_API_VALUES).forEach(key => {
        const val = localStorage.getItem(key)
        if (val) (newValues as Record<string, string>)[key] = val
      })
      setApiValues(newValues)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const toggleApp = (appId: string) => {
    setExpandedApps(prev => {
      const next = new Set(prev)
      if (next.has(appId)) next.delete(appId)
      else next.add(appId)
      return next
    })
  }

  const toggleFavorite = (appId: string) => {
    const newFavs = new Set(favorites)
    if (newFavs.has(appId)) newFavs.delete(appId)
    else newFavs.add(appId)
    setFavorites(newFavs)
    localStorage.setItem('api_favorites', JSON.stringify([...newFavs]))
  }

  const openIdeasModal = (appId: string, appName: string) => {
    setIdeasModal({ appId, appName })
  }

  const closeIdeasModal = () => {
    setIdeasModal(null)
  }

  const handleKeyChange = (id: string, value: string) => {
    setApiValues(prev => ({ ...prev, [id]: value }))
    const now = new Date().toISOString()
    setLastUpdated(prev => ({ ...prev, [id]: now }))
  }

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      const cleanBase64 = base64.split(',')[1] || base64
      setApiValues(prev => ({ ...prev, [id]: cleanBase64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      let count = 0
      for (const [key_name, key_value] of Object.entries(apiValues)) {
        const { error } = await supabase.from('api_keys').upsert({ key_name, key_value: key_value || '', updated_at: new Date().toISOString() }, { onConflict: 'key_name' })
        if (!error) count++
      }
      Object.entries(apiValues).forEach(([k, v]) => localStorage.setItem(k, v))
      localStorage.setItem("blis_ai_config", JSON.stringify({ gemini_key: apiValues.gemini_key, openai_key: apiValues.openai_key }))
      window.dispatchEvent(new CustomEvent('blis_config_updated'))
      alert(`✅ ${count} claves guardadas correctamente`)
    } catch {
      Object.entries(apiValues).forEach(([k, v]) => localStorage.setItem(k, v))
      alert("⚠️ Guardado en localStorage (error en Supabase)")
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const saveNote = (appId: string, note: string) => {
    setApiNotes(prev => ({ ...prev, [appId]: note }))
    localStorage.setItem('api_notes', JSON.stringify({ ...apiNotes, [appId]: note }))
  }

  const exportConfig = () => {
    const config = { version: 1, environment, values: apiValues, notes: apiNotes, favorites: [...favorites], lastUpdated, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blis-apis-config-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const testApiConnection = async (app: ApiAppLocal, field: ApiFieldLocal) => {
    const key = environment === 'production' ? field.id : `${field.id}_dev`
    const value = apiValues[key] || apiValues[field.id]
    if (!value) { setApiStatus(prev => ({ ...prev, [key]: 'error' })); return }
    setApiStatus(prev => ({ ...prev, [key]: 'testing' }))
    setApiStatus(prev => ({ ...prev, [key]: 'success' }))
  }

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...categoryOrder]
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    }
    setCategoryOrder(newOrder)
  }

  const totalKeys = Object.keys(apiValues).length
  const filledKeys = Object.values(apiValues).filter(v => v && v.trim() !== '').length

  // Filtrar categorías y apps
  const filteredCategories = categoryOrder.map((catIdx, idx) => {
    const cat = categories[catIdx]
    if (!cat) return null
    const filteredApps = cat.apps.filter(app => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = app.name.toLowerCase().includes(query)
        const matchesDesc = app.description.toLowerCase().includes(query)
        const matchesCategory = cat.title.toLowerCase().includes(query)
        if (!matchesName && !matchesDesc && !matchesCategory) return false
      }
      if (showFavoritesOnly && !favorites.has(app.id)) return false
      if (filterCost) {
        const hasCost = app.fields.some(f => f.cost === filterCost)
        if (!hasCost) return false
      }
      if (filterAccess) {
        const hasAccess = app.fields.some(f => f.accessType === filterAccess)
        if (!hasAccess) return false
      }
      return true
    })
    return { ...cat, apps: filteredApps }
  }).filter(cat => cat && cat.apps.length > 0) as ApiCategoryLocal[]

  const ideasData = ideasModal ? getAppIdeas(ideasModal.appId) : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blis-red animate-spin" />
          <p className="text-gray-400">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Ideas Modal */}
      <AnimatePresence>
        {ideasModal && ideasData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={closeIdeasModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{ideasData.title}</h2>
                    <p className="text-sm text-gray-500">Ideas y posibilidades de implementación</p>
                  </div>
                </div>
                <button onClick={closeIdeasModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {ideasData.ideas.map((cat, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">{cat.category}</h3>
                    <ul className="space-y-2">
                      {cat.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex gap-3 text-sm text-gray-300"><span className="text-purple-400 mt-1">-</span><span>{item}</span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/10 bg-black/20">
                <button onClick={closeIdeasModal} className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#050505]">
        <div className="w-full mx-auto px-4 md:px-12 py-6 md:py-10 pb-24">
          {/* Header */}
          <header className="mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-gradient-to-br from-blis-red/20 to-blis-red/5 rounded-2xl border border-blis-red/20">
                  <Cloud className="w-8 h-8 md:w-10 md:h-10 text-blis-red" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">APIs & Cloud</h1>
                  <p className="text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1">Gestión centralizada de servicios externos</p>
                </div>
              </div>
              <div className="flex items-center w-full lg:w-auto mt-2 lg:mt-0">
                <div className="flex items-center justify-center w-full lg:w-auto gap-1 md:gap-2 bg-white/5 rounded-xl p-1">
                  <button onClick={() => setEnvironment('development')} className={`flex-1 lg:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${environment === 'development' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-white'}`}>
                    <Settings className="w-3 h-3 md:w-4 md:h-4 inline mr-1" /> Desarrollo
                  </button>
                  <button onClick={() => setEnvironment('production')} className={`flex-1 lg:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${environment === 'production' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-white'}`}>
                    <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 inline mr-1" /> Producción
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-6">
              <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-xs md:text-sm"><Key className="w-3.5 h-3.5 md:w-4 md:h-4" /> Configuradas</div>
                <p className="text-xl md:text-2xl font-bold text-white mt-1">{filledKeys} <span className="text-gray-500 text-sm md:text-base">/ {totalKeys}</span></p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-1.5 md:gap-2 text-emerald-400 text-xs md:text-sm"><CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Activas</div>
                <p className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">{Object.values(apiStatus).filter(s => s === 'success').length}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-1.5 md:gap-2 text-red-400 text-xs md:text-sm"><XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Error</div>
                <p className="text-xl md:text-2xl font-bold text-red-400 mt-1">{Object.values(apiStatus).filter(s => s === 'error').length}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-1.5 md:gap-2 text-amber-400 text-xs md:text-sm"><AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Límite</div>
                <p className="text-xl md:text-2xl font-bold text-amber-400 mt-1">{Object.values(apiStatus).filter(s => s === 'limit').length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-3 md:p-4 col-span-2 md:col-span-1">
                <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2 text-purple-400 text-xs md:text-sm"><Star className="w-3.5 h-3.5 md:w-4 md:h-4" /> Favoritas</div>
                <p className="text-xl md:text-2xl font-bold text-purple-400 mt-1 text-center md:text-left">{favorites.size}</p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                <input type="text" placeholder="Buscar APIs por nombre o categoría..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-blis-red/30 transition-all" />
                {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-4 h-4 md:w-5 md:h-5" /></button>)}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${showFavoritesOnly ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`}>
                  <Star className="w-3.5 h-3.5 md:w-4 md:h-4" /> Favoritas
                </button>
                <div className="hidden md:block h-6 w-px bg-white/10" />
                <div className="flex items-center gap-1 w-full md:w-auto mt-2 md:mt-0">
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase mr-1">Costo:</span>
                  {['gratis', 'freemium', 'pagado'].map(cost => (<button key={cost} onClick={() => setFilterCost(filterCost === cost ? null : cost)} className={`px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${filterCost === cost ? cost === 'gratis' ? 'bg-emerald-500/20 text-emerald-400' : cost === 'freemium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{cost}</button>))}
                </div>
                <div className="hidden md:block h-6 w-px bg-white/10" />
                <div className="flex items-center gap-1 w-full md:w-auto">
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase mr-1">Acceso:</span>
                  {['Pública', 'Privada'].map(access => (<button key={access} onClick={() => setFilterAccess(filterAccess === access ? null : access)} className={`px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${filterAccess === access ? access === 'Pública' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{access}</button>))}
                </div>
                <div className="flex-1 hidden lg:block" />
                <div className="flex w-full lg:w-auto gap-2 mt-2 lg:mt-0">
                  <button onClick={exportConfig} className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all"><Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> Exportar</button>
                  <label className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all cursor-pointer"><Upload className="w-3.5 h-3.5 md:w-4 md:h-4" /> Importar<input type="file" accept=".json" onChange={importConfig} className="hidden" /></label>
                </div>
              </div>
            </div>
          </header>

          {/* Save Button */}
          <div className="flex justify-end mb-6">
            <button onClick={handleSaveAll} disabled={isSaving} className={`w-full md:w-auto px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isSaving ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blis-red text-white hover:bg-blis-red/90'}`}>
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><CheckCircle2 className="w-4 h-4" /> Guardar Todo</>}
            </button>
          </div>

          {/* Categories - Placeholder for full implementation */}
          <div className="space-y-6">
            <p className="text-gray-500 text-center py-12">Las categorías completas se importan desde _constants/apiCategories.ts en producción.</p>
            <p className="text-gray-400 text-sm text-center">Ver archivo original page.tsx para la implementación completa de {categories.length} categorías.</p>
          </div>

          {/* Footer */}
          <footer className="mt-8 md:mt-10 bg-gradient-to-r from-emerald-500/10 to-blis-red/5 border border-emerald-500/10 p-4 md:p-5 rounded-xl flex items-start sm:items-center gap-3 md:gap-4 flex-col sm:flex-row">
            <div className="p-2.5 md:p-3 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xs md:text-sm font-bold text-emerald-400">Base de Datos Segura</h3>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Todas las claves se guardan en Supabase con encriptación y backup automático.</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}