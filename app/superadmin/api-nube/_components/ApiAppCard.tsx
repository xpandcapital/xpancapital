"use client"

import { motion, AnimatePresence } from "framer-motion"
import {Star, Copy, Check, RefreshCw, Brain, ExternalLink, Globe, ChevronDown, ChevronUp, Clock, Eye, EyeOff, CheckCircle2, XCircle, Zap, Plus, Trash2 } from "lucide-react"
import type { ApiApp, ApiStatus } from '../_types'

interface ApiAppCardProps {
  app: ApiApp
  isExpanded: boolean
  isFavorite: boolean
  appStatus: ApiStatus
  fieldStatuses: Record<string, ApiStatus>
  showKeys: Record<string, boolean>
  apiValues: Record<string, string>
  apiNotes: Record<string, string>
  lastUpdated: Record<string, string>
  copiedId: string | null
  onToggleExpand: () => void
  onToggleFavorite: () => void
  onCopy: (fieldId: string, value: string) => void
  onTest: (fieldId: string) => void
  onKeyChange: (fieldId: string, value: string) => void
  onFileChange: (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => void
  onNoteChange: (note: string) => void
  onToggleShowKey: (fieldId: string) => void
  onOpenIdeas: () => void
  onOpenFallback?: () => void
}

export function ApiAppCard({
  app,
  isExpanded,
  isFavorite,
  appStatus,
  fieldStatuses,
  showKeys,
  apiValues,
  apiNotes,
  lastUpdated,
  copiedId,
  onToggleExpand,
  onToggleFavorite,
  onCopy,
  onTest,
  onKeyChange,
  onFileChange,
  onNoteChange,
  onToggleShowKey,
  onOpenIdeas,
  onOpenFallback,
}: ApiAppCardProps) {
  const costs = [...new Set(app.fields.map(f => f.cost))]
  const accesses = [...new Set(app.fields.map(f => f.accessType))]
  const costLabel = costs.length === 1 ? costs[0] : 'mixto'
  const accessLabel = accesses.length === 1 ? accesses[0] : 'mixto'

  const getStatusColor = (status: ApiStatus) => {
    switch (status) {
      case 'success': return 'bg-emerald-400'
      case 'error': return 'bg-red-400'
      case 'testing': return 'bg-amber-400 animate-pulse'
      case 'limit': return 'bg-orange-400'
      default: return 'bg-gray-600'
    }
  }

  const getStatusLabel = (status: ApiStatus) => {
    switch (status) {
      case 'success': return 'conectado'
      case 'error': return 'error'
      case 'testing': return 'probando'
      case 'limit': return 'límite'
      default: return 'sin probar'
    }
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3 hover:bg-white/[0.02] transition-colors">
        {/* Left: star + status */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`transition-colors ${isFavorite ? 'text-purple-400' : 'text-gray-600 hover:text-purple-400'}`}
          >
            <Star className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(appStatus)}`} title={`Estado: ${appStatus}`} />
        </div>

        {/* Icon */}
        <div className={`p-1.5 md:p-2 rounded-lg ${app.bg} flex-shrink-0`}>
          <app.icon className={`w-4 h-4 md:w-5 md:h-5 ${app.color}`} />
        </div>

        {/* Center: name + badges + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 md:gap-1.5 flex-wrap min-w-0">
            <h3 className="text-sm md:text-base font-bold text-white truncate">{app.name}</h3>
            <span className={`text-[9px] md:text-[10px] font-bold uppercase px-1.5 py-0.5 md:px-2 md:py-0.5 rounded flex-shrink-0
              ${costLabel === 'gratis' ? 'bg-emerald-500/10 text-emerald-400' :
                costLabel === 'freemium' ? 'bg-amber-500/10 text-amber-400' :
                costLabel === 'mixto' ? 'bg-blue-500/10 text-blue-400' :
                'bg-red-500/10 text-red-400'}`}>
              {costLabel}
            </span>
            <span className={`text-[9px] md:text-[10px] font-bold uppercase px-1.5 py-0.5 md:px-2 md:py-0.5 rounded flex-shrink-0
              ${accessLabel === 'Pública' ? 'bg-blue-500/10 text-blue-400' :
                accessLabel === 'mixto' ? 'bg-purple-500/10 text-purple-400' :
                'bg-orange-500/10 text-orange-400'}`}>
              {accessLabel}
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 line-clamp-1 mt-0.5">{app.description}</p>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
          <span className="text-[10px] md:text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded hidden lg:inline-block flex-shrink-0">
            {app.fields.length} campos
          </span>
          
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); const firstKey = app.fields[0]?.id; if (firstKey && apiValues[firstKey]) onCopy(firstKey, apiValues[firstKey]); }}
            className={`p-1 md:p-1.5 rounded-lg transition-colors flex-shrink-0 ${
              copiedId && copiedId === app.fields[0]?.id
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-gray-500 hover:text-white hover:bg-white/10'
            }`}
            title="Copiar primer valor"
          >
            {copiedId && copiedId === app.fields[0]?.id ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <Copy className="w-3 h-3 md:w-3.5 md:h-3.5" />}
          </button>
          
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); app.fields.forEach(f => onTest(f.id)); }}
            className="p-1 md:p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            title="Probar conexión"
          >
            <RefreshCw className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </button>
          
          <div
            onClick={(e) => { e.stopPropagation(); onOpenIdeas(); }}
            className="text-purple-400 hover:text-purple-300 transition-colors p-1 md:p-1.5 cursor-pointer rounded-lg hover:bg-white/10 flex-shrink-0"
            title="Ideas de uso"
          >
            <Brain className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </div>
          
          {app.docsUrl && (
            <a
              href={app.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-white transition-colors p-1 md:p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"
              title="Documentación"
            >
              <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </a>
          )}
          
          <a
            href={`https://${app.website}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-gray-500 hover:text-white transition-colors p-1 md:p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"
            title="Sitio web"
          >
            <Globe className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </a>
          
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1 md:p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            {isExpanded ? <ChevronUp className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400" /> : <ChevronDown className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400" />}
          </button>
        </div>
      </div>
      
      {!isExpanded && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors border-t border-white/5"
        >
          Click para ver {app.fields.length} campo{app.fields.length > 1 ? 's' : ''}
        </button>
      )}

      <AnimatePresence>
        {isExpanded && (
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
                    onClick={() => app.fields.forEach(f => onTest(f.id))}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs md:text-sm font-bold transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Probar todas
                  </button>
                  {app.fallbackGroup && onOpenFallback && (
                    <button
                      onClick={onOpenFallback}
                      className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-purple-400 text-xs md:text-sm font-bold transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Configurar </span>Fallback
                    </button>
                  )}
                </div>
                {lastUpdated[app.fields[0]?.id] && (
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Act: {new Date(lastUpdated[app.fields[0]?.id]).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {app.fields.map(field => {
                const fieldStatus = fieldStatuses[field.id] || ('untested' as ApiStatus)
                const hasValue = apiValues[field.id] && apiValues[field.id].trim() !== ''
                
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
                          {getStatusLabel(fieldStatus)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        {hasValue && (
                          <button
                            type="button"
                            onClick={() => onCopy(field.id, apiValues[field.id])}
                            className={`p-1 md:p-1.5 rounded-lg transition-colors ${
                              copiedId === field.id
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'text-gray-500 hover:text-white hover:bg-white/10'
                            }`}
                            title="Copiar valor"
                          >
                            {copiedId === field.id ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                          </button>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => onTest(field.id)}
                          disabled={fieldStatus === 'testing' || !hasValue}
                          className="p-1 md:p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                          title="Probar conexión"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${fieldStatus === 'testing' ? 'animate-spin' : ''}`} />
                        </button>
                        
                        {field.type === 'password' && hasValue && (
                          <button
                            type="button"
                            onClick={() => onToggleShowKey(field.id)}
                            className="text-gray-500 hover:text-white transition-colors p-1 md:p-1.5"
                          >
                            {showKeys[field.id] ? <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed">{field.description}</p>
                    <p className="text-[10px] md:text-sm text-gray-500">
                      <span className="font-bold text-gray-600">Obtener en:</span> {field.getFrom}
                    </p>

                    {field.type === 'file' ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          placeholder="Sin archivo"
                          value={apiValues[field.id] ? "✓ Archivo cargado" : ""}
                          className={`flex-1 bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-mono
                            ${apiValues[field.id] ? 'text-emerald-400' : 'text-gray-500'}`}
                        />
                        <label className="cursor-pointer px-2.5 py-1.5 md:px-3 md:py-2 bg-blis-red/10 border border-blis-red/20 rounded text-blis-red text-[10px] md:text-sm font-bold uppercase hover:bg-blis-red/20 transition-all flex items-center justify-center">
                          <input type="file" className="hidden" accept=".p12" onChange={(e) => onFileChange(field.id, e)} />
                          {apiValues[field.id] ? 'Cambiar' : 'Subir'}
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type === 'password' && !showKeys[field.id] ? 'password' : 'text'}
                          value={apiValues[field.id] || ''}
                          onChange={(e) => onKeyChange(field.id, e.target.value)}
                          placeholder="••••••••••"
                          className="w-full bg-white/[0.03] border border-white/10 rounded px-2.5 py-1.5 md:px-3 md:py-2 pr-16 md:pr-20 text-xs md:text-sm font-mono text-gray-300 focus:outline-none focus:border-blis-red/30 transition-all"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          {hasValue && (
                            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mt-0.5 ${
                              apiValues[field.id]?.length > 20 ? 'bg-emerald-400' :
                              apiValues[field.id]?.length > 10 ? 'bg-amber-400' :
                              'bg-gray-500'
                            }`} title="Longitud de la key" />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {lastUpdated[field.id] && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Actualizado: {new Date(lastUpdated[field.id]).toLocaleDateString('es-ES', { 
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
                  value={apiNotes[app.id] || ''}
                  onChange={(e) => onNoteChange(e.target.value)}
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
}