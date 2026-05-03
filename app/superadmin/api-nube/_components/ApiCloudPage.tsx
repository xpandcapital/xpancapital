"use client"

import React, { useState, useEffect } from "react"
import {
    Cloud, Key, Eye, EyeOff, CheckCircle2,
    Loader2, ChevronDown, ChevronUp,
    Brain, Lightbulb, X, Star, Copy, Search, Filter,
    Download, Upload, AlertCircle, Check, XCircle,
    Clock, ExternalLink, RefreshCw, Settings, ShieldCheck,
    Zap, Plus, Trash2, Globe
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApiConfig } from '../_hooks/useApiConfig'
import { useApiState } from '../_hooks/useApiState'
import { categories } from '../_data/apiCategories'
import { getAppIdeas } from '../_data/apiIdeas'
import type { ApiApp, ApiField, ApiCategory } from '../_types'

export function ApiCloudPage() {
    const config = useApiConfig()
    const state = useApiState()

    const [searchQuery, setSearchQuery] = useState('')
    const [filterCost, setFilterCost] = useState<string | null>(null)
    const [filterAccess, setFilterAccess] = useState<string | null>(null)
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [fallbackModal, setFallbackModal] = useState<{ groupId: string; apps: ApiApp[] } | null>(null)

    useEffect(() => {
        state.initCategoryOrder(categories.length)
    }, [])

    const runTest = async (field: ApiField) => {
        const value = config.apiValues[field.id]
        if (!value) {
            config.setApiStatus(prev => ({ ...prev, [field.id]: 'error' }))
            return
        }
        let extraValues: Record<string, string> | undefined
        if (field.id === 'cloudinary_api_key') {
            extraValues = {
                cloudinary_api_secret: config.apiValues['cloudinary_api_secret'] || '',
                cloudinary_cloud_name: config.apiValues['cloudinary_cloud_name'] || '',
            }
        } else if (field.id === 'supabase_url') {
            extraValues = {
                supabase_anon_key: config.apiValues['supabase_anon_key'] || '',
            }
        }
        await config.testApiConnection(field.id, value, extraValues)
    }

    const copyToClipboard = async (id: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value)
            state.setCopied(id)
        } catch {
            console.error('Failed to copy')
        }
    }

    const ideasData = state.ideasModal ? getAppIdeas(state.ideasModal.appId) : null

    const totalKeys = Object.keys(config.apiValues).length
    const filledKeys = Object.values(config.apiValues).filter(v => v && v.trim() !== '').length

    if (config.isLoading) {
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
            <AnimatePresence>
                {state.ideasModal && ideasData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={state.closeIdeasModal}
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
                                        <p className="text-sm text-gray-500">Ideas y posibilidades de implementacion</p>
                                    </div>
                                </div>
                                <button onClick={state.closeIdeasModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {ideasData.ideas.map((cat, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">{cat.category}</h3>
                                        <ul className="space-y-2">
                                            {cat.items.map((item, itemIdx) => (
                                                <li key={itemIdx} className="flex gap-3 text-sm text-gray-300">
                                                    <span className="text-purple-400 mt-1">-</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-white/10 bg-black/20">
                                <button onClick={state.closeIdeasModal} className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full mx-auto px-4 md:px-12 py-6 md:py-10 pb-24">
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
                                <button
                                    onClick={() => config.setEnvironment('development')}
                                    className={`flex-1 lg:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                                        config.environment === 'development'
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'text-gray-500 hover:text-white'
                                    }`}
                                >
                                    <Settings className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                                    Desarrollo
                                </button>
                                <button
                                    onClick={() => config.setEnvironment('production')}
                                    className={`flex-1 lg:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                                        config.environment === 'production'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'text-gray-500 hover:text-white'
                                    }`}
                                >
                                    <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                                    Producción
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-6">
                        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-xl p-3 md:p-4">
                            <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-xs md:text-sm">
                                <Key className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Configuradas
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-white mt-1">{filledKeys} <span className="text-gray-500 text-sm md:text-base">/ {totalKeys}</span></p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-3 md:p-4">
                            <div className="flex items-center gap-1.5 md:gap-2 text-emerald-400 text-xs md:text-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Activas
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">
                                {Object.values(config.apiStatus).filter(s => s === 'success').length}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-3 md:p-4">
                            <div className="flex items-center gap-1.5 md:gap-2 text-red-400 text-xs md:text-sm">
                                <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Error
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-red-400 mt-1">
                                {Object.values(config.apiStatus).filter(s => s === 'error').length}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-3 md:p-4">
                            <div className="flex items-center gap-1.5 md:gap-2 text-amber-400 text-xs md:text-sm">
                                <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Límite
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-amber-400 mt-1">
                                {Object.values(config.apiStatus).filter(s => s === 'limit').length}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-3 md:p-4 col-span-2 md:col-span-1">
                            <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2 text-purple-400 text-xs md:text-sm">
                                <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Favoritas
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-purple-400 mt-1 text-center md:text-left">{config.favorites.size}</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar APIs por nombre o categoría..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-blis-red/30 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    <X className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                                    showFilters ? 'bg-blis-red/20 text-blis-red border border-blis-red/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                                }`}
                            >
                                <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Filtros
                            </button>

                            <button
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                                    showFavoritesOnly ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                                }`}
                            >
                                <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Favoritas
                            </button>

                            <div className="hidden md:block h-6 w-px bg-white/10" />

                            <div className="flex items-center gap-1 w-full md:w-auto mt-2 md:mt-0">
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase mr-1">Costo:</span>
                                {['gratis', 'freemium', 'pagado'].map(cost => (
                                    <button
                                        key={cost}
                                        onClick={() => setFilterCost(filterCost === cost ? null : cost)}
                                        className={`px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                                            filterCost === cost
                                                ? cost === 'gratis' ? 'bg-emerald-500/20 text-emerald-400'
                                                : cost === 'freemium' ? 'bg-amber-500/20 text-amber-400'
                                                : 'bg-red-500/20 text-red-400'
                                                : 'bg-white/5 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {cost}
                                    </button>
                                ))}
                            </div>

                            <div className="hidden md:block h-6 w-px bg-white/10" />

                            <div className="flex items-center gap-1 w-full md:w-auto">
                                <span className="text-[10px] md:text-xs text-gray-500 uppercase mr-1">Acceso:</span>
                                {['Pública', 'Privada'].map(access => (
                                    <button
                                        key={access}
                                        onClick={() => setFilterAccess(filterAccess === access ? null : access)}
                                        className={`px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                                            filterAccess === access
                                                ? access === 'Pública' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                                : 'bg-white/5 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {access}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 hidden lg:block" />

                            <div className="flex w-full lg:w-auto gap-2 mt-2 lg:mt-0">
                                <button
                                    onClick={config.exportConfig}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all"
                                    title="Exportar configuración"
                                >
                                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Exportar
                                </button>
                                <label className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all cursor-pointer">
                                    <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Importar
                                    <input type="file" accept=".json" onChange={config.importConfig} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={config.handleSaveAll}
                        disabled={config.isSaving}
                        className={`w-full md:w-auto px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2
                            ${config.isSaving ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blis-red text-white hover:bg-blis-red/90'}`}
                    >
                        {config.isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><CheckCircle2 className="w-4 h-4" /> Guardar Todo</>}
                    </button>
                </div>

                <div className="space-y-6">
                    {(() => {
                        const displayCategories: (ApiCategory & { isVirtual?: boolean; originalIndex?: number })[] = []

                        const allFavApps = categories.flatMap(c => c.apps).filter(app => config.favorites.has(app.id))

                        if (allFavApps.length > 0 && !searchQuery && !showFavoritesOnly) {
                            displayCategories.push({
                                id: 'favorites-section',
                                title: "Favoritos",
                                icon: Star,
                                color: "text-purple-400",
                                description: "Tus APIs y servicios marcados como favoritos para acceso rápido.",
                                apps: allFavApps,
                                isVirtual: true,
                                originalIndex: -1
                            })
                        }

                        state.categoryOrder.forEach((catIdx, originalIndex) => {
                            displayCategories.push({
                                ...categories[catIdx],
                                isVirtual: false,
                                originalIndex
                            })
                        })

                        return displayCategories.map((category, displayIndex) => {
                            const filteredApps = category.apps.filter(app => {
                                if (searchQuery) {
                                    const query = searchQuery.toLowerCase()
                                    const matchesName = app.name.toLowerCase().includes(query)
                                    const matchesDesc = app.description.toLowerCase().includes(query)
                                    const matchesCategory = category.title.toLowerCase().includes(query)
                                    if (!matchesName && !matchesDesc && !matchesCategory) return false
                                }
                                if (showFavoritesOnly && !config.favorites.has(app.id)) return false
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

                            if (filteredApps.length === 0) return null

                            const isCatExpanded = state.expandedCategories.has(category.id)
                            const catAppCount = filteredApps.length
                            const catFieldCount = filteredApps.reduce((acc, app) => acc + app.fields.length, 0)

                            return (
                                <div key={`${category.id}-${displayIndex}`} className="space-y-3">
                                    <div className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all ${
                                        category.isVirtual
                                            ? 'bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/20'
                                            : 'bg-gradient-to-r from-white/[0.05] to-transparent border-white/5 hover:border-white/10'
                                    }`}>
                                        <div className="flex items-center gap-3 w-full">
                                            {!category.isVirtual && (
                                                <div className="flex flex-col gap-1 mr-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => state.moveCategory(category.originalIndex!, 'up', categories.length)}
                                                        disabled={category.originalIndex === 0}
                                                        className="p-1 md:p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => state.moveCategory(category.originalIndex!, 'down', categories.length)}
                                                        disabled={category.originalIndex === state.categoryOrder.length - 1}
                                                        className="p-1 md:p-1.5 hover:bg-white/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                                    </button>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => state.toggleCategory(category.id)}
                                                className="flex-1 flex flex-col md:flex-row md:items-center justify-between group gap-3"
                                            >
                                                <div className="flex items-center gap-3 md:gap-4 text-left">
                                                    <div className={`p-2.5 md:p-3 rounded-xl ${category.color.replace('text-', 'bg-')}/10 flex-shrink-0`}>
                                                        <category.icon className={`w-5 h-5 md:w-6 md:h-6 ${category.color}`} />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg md:text-xl font-bold text-white">{category.title}</h2>
                                                        <p className="text-sm md:text-base text-gray-500 mt-0.5 md:mt-1">{category.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center self-end md:self-auto gap-3 md:gap-4 mt-1 md:mt-0">
                                                    <span className="text-xs md:text-base text-gray-500 bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded-lg whitespace-nowrap">
                                                        {catAppCount} {catAppCount === 1 ? 'app' : 'apps'} <span className="hidden sm:inline">· {catFieldCount} {catFieldCount === 1 ? 'clave' : 'claves'}</span>
                                                    </span>
                                                    {isCatExpanded ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />}
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isCatExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                                                    {filteredApps.map(app => {
                                                        const isAppExpanded = state.expandedApps.has(app.id)
                                                        const costs = [...new Set(app.fields.map(f => f.cost))]
                                                        const accesses = [...new Set(app.fields.map(f => f.accessType))]
                                                        const costLabel = costs.length === 1 ? costs[0] : 'mixto'
                                                        const accessLabel = accesses.length === 1 ? accesses[0] : 'mixto'
                                                        const isFavorite = config.favorites.has(app.id)
                                                        const appStatus = Object.keys(app.fields).some(fId => {
                                                            const status = config.apiStatus[app.fields[parseInt(fId)].id]
                                                            return status === 'success'
                                                        }) ? 'success' : Object.keys(app.fields).some(fId => config.apiStatus[app.fields[parseInt(fId)].id] === 'error') ? 'error' : 'untested'

                                                        return (
                                                            <div key={app.id} className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
                                                                <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 hover:bg-white/[0.02] transition-colors">
                                                                    <div className="flex items-start sm:items-center gap-2 md:gap-3 w-full">
                                                                        <div className="flex items-center gap-2 mt-1 sm:mt-0">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => { e.stopPropagation(); config.toggleFavorite(app.id) }}
                                                                                className={`transition-colors ${isFavorite ? 'text-purple-400' : 'text-gray-600 hover:text-purple-400'}`}
                                                                            >
                                                                                <Star className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                                                            </button>
                                                                            <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0 ${
                                                                                appStatus === 'success' ? 'bg-emerald-400' :
                                                                                appStatus === 'error' ? 'bg-red-400' :
                                                                                'bg-gray-600'
                                                                            }`} title={`Estado: ${appStatus}`} />
                                                                        </div>
                                                                        <div className={`p-1.5 md:p-2 rounded-lg ${app.bg} flex-shrink-0`}>
                                                                            <app.icon className={`w-4 h-4 md:w-5 md:h-5 ${app.color}`} />
                                                                        </div>
                                                                        <div className="text-left flex-1 min-w-0">
                                                                            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                                                                <h3 className="text-sm md:text-base font-bold text-white truncate max-w-[150px] sm:max-w-full">{app.name}</h3>
                                                                                <span className={`text-[9px] md:text-xs font-bold uppercase px-1.5 py-0.5 md:px-2 md:py-0.5 rounded whitespace-nowrap
                                                                                    ${costLabel === 'gratis' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                                    costLabel === 'freemium' ? 'bg-amber-500/10 text-amber-400' :
                                                                                    costLabel === 'mixto' ? 'bg-blue-500/10 text-blue-400' :
                                                                                    'bg-red-500/10 text-red-400'}`}>
                                                                                    {costLabel}
                                                                                </span>
                                                                                <span className={`text-[9px] md:text-xs font-bold uppercase px-1.5 py-0.5 md:px-2 md:py-0.5 rounded whitespace-nowrap
                                                                                    ${accessLabel === 'Pública' ? 'bg-blue-500/10 text-blue-400' :
                                                                                    accessLabel === 'mixto' ? 'bg-purple-500/10 text-purple-400' :
                                                                                    'bg-orange-500/10 text-orange-400'}`}>
                                                                                    {accessLabel}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mt-0.5 md:mt-1">{app.description}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center self-end sm:self-auto gap-1 md:gap-2 bg-black/20 sm:bg-transparent p-1 sm:p-0 rounded-lg">
                                                                        <span className="text-[10px] md:text-sm text-gray-600 bg-white/5 px-1.5 py-0.5 md:px-2 md:py-1 rounded hidden sm:inline-block">
                                                                            {app.fields.length} <span className="hidden lg:inline">campos</span>
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); const firstKey = app.fields[0]?.id; if (firstKey && config.apiValues[firstKey]) copyToClipboard(firstKey, config.apiValues[firstKey]); }}
                                                                            className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                                                                                state.copiedId && state.copiedId === app.fields[0]?.id
                                                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                                                    : 'text-gray-500 hover:text-white hover:bg-white/10'
                                                                            }`}
                                                                            title="Copiar primer valor"
                                                                        >
                                                                            {state.copiedId && state.copiedId === app.fields[0]?.id ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                                                        </button>
                                                                        {/* Scope badge */}
                                                                        {(() => {
                                                                            const scope = config.appScopes[app.id] || 'global'
                                                                            return (
                                                                                <span className={`text-[9px] md:text-xs font-bold uppercase px-1.5 py-0.5 md:px-2 md:py-0.5 rounded whitespace-nowrap ${
                                                                                    scope === 'global' 
                                                                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                                                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                                }`}>
                                                                                    {scope === 'global' ? 'Global' : 'Mi API'}
                                                                                </span>
                                                                            )
                                                                        })()}
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); app.fields.forEach(f => runTest(f)); }}
                                                                            className="p-1.5 md:p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                                                                            title="Probar conexión"
                                                                        >
                                                                            <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { 
                                                                                e.stopPropagation(); 
                                                                                const scope = config.appScopes[app.id] || 'global'
                                                                                config.handleSaveApp(app.id, app.fields.map(f => f.id), scope === 'global')
                                                                            }}
                                                                            disabled={config.isSavingApp === app.id}
                                                                            className="p-1.5 md:p-2 rounded-lg text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                                                                            title="Guardar esta API"
                                                                        >
                                                                            {config.isSavingApp === app.id ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                                                        </button>
                                                                        <div
                                                                            onClick={(e) => { e.stopPropagation(); state.openIdeasModal(app.id, app.name); }}
                                                                            className="text-purple-400 hover:text-purple-300 transition-colors p-1.5 md:p-2 cursor-pointer rounded-lg hover:bg-white/10"
                                                                            title="Ideas de uso"
                                                                        >
                                                                            <Brain className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                        </div>
                                                                        {app.docsUrl && (
                                                                            <a
                                                                                href={app.docsUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="text-gray-500 hover:text-white transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white/10"
                                                                                title="Documentación"
                                                                            >
                                                                                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                            </a>
                                                                        )}
                                                                        <a
                                                                            href={`https://${app.website}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="text-gray-500 hover:text-white transition-colors p-1.5 md:p-2 rounded-lg hover:bg-white/10"
                                                                            title="Sitio web"
                                                                        >
                                                                            <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                        </a>
                                                                        {/* Toggle Global / Personal */}
                                                                        {(() => {
                                                                            const scope = config.appScopes[app.id] || 'global'
                                                                            const canToggle = true // Todos pueden cambiar su propia vista
                                                                            return (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        const newScope = scope === 'global' ? 'personal' : 'global'
                                                                                        config.setAppScopes(prev => ({ ...prev, [app.id]: newScope }))
                                                                                    }}
                                                                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase transition-all ${
                                                                                        scope === 'global'
                                                                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                                                                                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                                                    }`}
                                                                                    title={scope === 'global' ? 'Cambiar a Mi API' : 'Cambiar a Global'}
                                                                                >
                                                                                    {scope === 'global' ? 'Global' : 'Mi API'}
                                                                                </button>
                                                                            )
                                                                        })()}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => state.toggleApp(app.id)}
                                                                            className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                                        >
                                                                            {isAppExpanded ? <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />}
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {!isAppExpanded && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => state.toggleApp(app.id)}
                                                                        className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors border-t border-white/5"
                                                                    >
                                                                        Click para ver {app.fields.length} campo{app.fields.length > 1 ? 's' : ''}
                                                                    </button>
                                                                )}

                                                                <AnimatePresence>
                                                                    {isAppExpanded && (
                                                                        <motion.div
                                                                            initial={{ height: 0, opacity: 0 }}
                                                                            animate={{ height: "auto", opacity: 1 }}
                                                                            exit={{ height: 0, opacity: 0 }}
                                                                            transition={{ duration: 0.1 }}
                                                                            className="overflow-hidden"
                                                                        >
                                                                            <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 md:space-y-4">
                                                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                                                                        <button
                                                                                            onClick={() => app.fields.forEach(f => runTest(f))}
                                                                                            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs md:text-sm font-bold transition-all"
                                                                                        >
                                                                                            <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                                            Probar todas
                                                                                        </button>
                                                                                        {app.fallbackGroup && (
                                                                                            <button
                                                                                                onClick={() => setFallbackModal({ groupId: app.fallbackGroup!, apps: categories.flatMap(c => c.apps).filter(a => a.fallbackGroup === app.fallbackGroup) })}
                                                                                                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-purple-400 text-xs md:text-sm font-bold transition-all"
                                                                                            >
                                                                                                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                                                <span className="hidden sm:inline">Configurar </span>Fallback
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                    {config.lastUpdated[app.fields[0]?.id] && (
                                                                                        <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500">
                                                                                            <Clock className="w-3 h-3" />
                                                                                            Act: {new Date(config.lastUpdated[app.fields[0]?.id]).toLocaleDateString()}
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {app.fields.map(field => {
                                                                                    const fieldStatus = config.apiStatus[field.id] || 'untested'
                                                                                    const hasValue = config.apiValues[field.id] && config.apiValues[field.id].trim() !== ''
                                                                                    return (
                                                                                        <div key={field.id} className="space-y-2.5 md:space-y-3 bg-white/[0.02] p-3 md:p-4 rounded-xl border border-white/5">
                                                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                                <div className="flex items-center gap-2 md:gap-3">
                                                                                                    <label className="text-sm md:text-base font-bold text-gray-300">{field.label}</label>
                                                                                                    <span className={`text-[9px] md:text-xs font-bold uppercase px-1.5 md:px-2 py-0.5 rounded ${
                                                                                                        fieldStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                                                        fieldStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                                                                                                        fieldStatus === 'testing' ? 'bg-amber-500/20 text-amber-400' :
                                                                                                        fieldStatus === 'limit' ? 'bg-orange-500/20 text-orange-400' :
                                                                                                        'bg-gray-500/20 text-gray-400'
                                                                                                    }`}>
                                                                                                        {fieldStatus === 'untested' ? 'sin probar' : fieldStatus}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                                                                    {hasValue && (
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => copyToClipboard(field.id, config.apiValues[field.id])}
                                                                                                            className={`p-1 md:p-1.5 rounded-lg transition-colors ${
                                                                                                                state.copiedId === field.id
                                                                                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                                                                                    : 'text-gray-500 hover:text-white hover:bg-white/10'
                                                                                                            }`}
                                                                                                            title="Copiar valor"
                                                                                                        >
                                                                                                            {state.copiedId === field.id ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                                                                                        </button>
                                                                                                    )}
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => runTest(field)}
                                                                                                        disabled={fieldStatus === 'testing' || !hasValue}
                                                                                                        className="p-1 md:p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                                                                                                        title="Probar conexión"
                                                                                                    >
                                                                                                        <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${fieldStatus === 'testing' ? 'animate-spin' : ''}`} />
                                                                                                    </button>
                                                                                                    {field.type === 'password' && hasValue && (
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => config.setShowKeys(prev => ({...prev, [field.id]: !prev[field.id]}))}
                                                                                                            className="text-gray-500 hover:text-white transition-colors p-1 md:p-1.5"
                                                                                                        >
                                                                                                            {config.showKeys[field.id] ? <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>

                                                                                            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{field.description}</p>
                                                                                            <p className="text-[10px] md:text-sm text-gray-500">
                                                                                                <span className="font-bold text-gray-600">Obtener en:</span> {field.getFrom}
                                                                                            </p>

                                                                                            {field.type === 'database_selector' ? (
                                                                                                <div className="space-y-3">
                                                                                                    {(() => {
                                                                                                        let databases: any[] = []
                                                                                                        try { databases = JSON.parse(config.apiValues[field.id] || '[]') } catch { databases = [] }
                                                                                                        return databases.map((db: any, i: number) => (
                                                                                                            <div key={i} className="flex items-center justify-between bg-white/5 p-2 md:p-3 rounded border border-white/10 text-xs md:text-sm">
                                                                                                                <div className="min-w-0 pr-2">
                                                                                                                    <span className="font-bold text-white block truncate">{db.name}</span>
                                                                                                                    <p className="text-[10px] md:text-xs text-gray-500 font-mono truncate">{db.id}</p>
                                                                                                                </div>
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() => {
                                                                                                                        const current = [...databases]
                                                                                                                        current.splice(i, 1)
                                                                                                                        config.handleKeyChange(field.id, JSON.stringify(current))
                                                                                                                    }}
                                                                                                                    className="text-red-400 hover:text-red-300 p-1 md:p-1.5 transition-colors flex-shrink-0"
                                                                                                                    title="Eliminar base de datos"
                                                                                                                >
                                                                                                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        ))
                                                                                                    })()}
                                                                                                    <div className="flex flex-col md:flex-row gap-2 items-start pt-2">
                                                                                                        <input
                                                                                                            id={`${field.id}_name`}
                                                                                                            type="text"
                                                                                                            placeholder="Nombre (Ej: Leads)"
                                                                                                            className="w-full md:w-1/3 bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all"
                                                                                                        />
                                                                                                        <input
                                                                                                            id={`${field.id}_id`}
                                                                                                            type="text"
                                                                                                            placeholder="ID de Base de Datos"
                                                                                                            className="flex-1 w-full bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-mono text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all"
                                                                                                        />
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() => {
                                                                                                                const nameInput = document.getElementById(`${field.id}_name`) as HTMLInputElement
                                                                                                                const idInput = document.getElementById(`${field.id}_id`) as HTMLInputElement
                                                                                                                if (nameInput?.value && idInput?.value) {
                                                                                                                    let current: any[] = []
                                                                                                                    try { current = JSON.parse(config.apiValues[field.id] || '[]') } catch { current = [] }
                                                                                                                    current.push({ name: nameInput.value, id: idInput.value })
                                                                                                                    config.handleKeyChange(field.id, JSON.stringify(current))
                                                                                                                    nameInput.value = ''
                                                                                                                    idInput.value = ''
                                                                                                                }
                                                                                                            }}
                                                                                                            className="w-full md:w-auto px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 md:gap-2 hover:bg-purple-500/30 transition-colors"
                                                                                                        >
                                                                                                            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Agregar
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ) : field.type === 'file' ? (
                                                                                                <div className="flex gap-2">
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        readOnly
                                                                                                        placeholder="Sin archivo"
                                                                                                        value={config.apiValues[field.id] ? "✓ Archivo cargado" : ""}
                                                                                                        className={`flex-1 bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-mono
                                                                                                            ${config.apiValues[field.id] ? 'text-emerald-400' : 'text-gray-500'}`}
                                                                                                    />
                                                                                                    <label className="cursor-pointer px-2.5 py-1.5 md:px-3 md:py-2 bg-blis-red/10 border border-blis-red/20 rounded text-blis-red text-[10px] md:text-sm font-bold uppercase hover:bg-blis-red/20 transition-all flex items-center justify-center">
                                                                                                        <input type="file" className="hidden" accept=".p12" onChange={(e) => config.handleFileChange(field.id, e)} />
                                                                                                        {config.apiValues[field.id] ? 'Cambiar' : 'Subir'}
                                                                                                    </label>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="relative">
                                                                                                    <input
                                                                                                        type={field.type === 'password' && !config.showKeys[field.id] ? 'password' : 'text'}
                                                                                                        value={config.apiValues[field.id] || ''}
                                                                                                        onChange={(e) => config.handleKeyChange(field.id, e.target.value)}
                                                                                                        placeholder="••••••••••"
                                                                                                        className="w-full bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 pr-16 md:pr-20 text-xs md:text-sm font-mono text-gray-300 focus:outline-none focus:border-blis-red/30 transition-all"
                                                                                                    />
                                                                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                                                                        {hasValue && (
                                                                                                            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mt-0.5 ${
                                                                                                                config.apiValues[field.id]?.length > 20 ? 'bg-emerald-400' :
                                                                                                                config.apiValues[field.id]?.length > 10 ? 'bg-amber-400' :
                                                                                                                'bg-gray-500'
                                                                                                            }`} title="Longitud de la key" />
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}

                                                                                            {config.lastUpdated[field.id] && (
                                                                                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                                                                                    <Clock className="w-3 h-3" />
                                                                                                    Actualizado: {new Date(config.lastUpdated[field.id]).toLocaleDateString('es-ES', {
                                                                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                                                                        hour: '2-digit', minute: '2-digit'
                                                                                                    })}
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                    )
                                                                                })}

                                                                                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <label className="text-base font-bold text-gray-300">Notas</label>
                                                                                    </div>
                                                                                    <textarea
                                                                                        value={config.apiNotes[app.id] || ''}
                                                                                        onChange={(e) => config.saveNote(app.id, e.target.value)}
                                                                                        placeholder="Agrega notas sobre esta API..."
                                                                                        className="w-full bg-white/[0.03] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blis-red/30 transition-all resize-none"
                                                                                        rows={2}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })
                    })()}
                </div>

                <footer className="mt-8 md:mt-10 bg-gradient-to-r from-emerald-500/10 to-blis-red/5 border border-emerald-500/10 p-4 md:p-5 rounded-xl flex items-start sm:items-center gap-3 md:gap-4 flex-col sm:flex-row">
                    <div className="p-2.5 md:p-3 bg-emerald-500/10 rounded-lg">
                        <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="text-xs md:text-sm font-bold text-emerald-400">Base de Datos Segura</h3>
                        <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                            Todas las claves se guardan en Supabase con encriptación y backup automático.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    )
}