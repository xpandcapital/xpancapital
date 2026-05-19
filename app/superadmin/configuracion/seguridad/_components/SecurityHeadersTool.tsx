"use client";

import { useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, Lock, Layers, FileWarning, Link2, Cctv,
  ChevronDown, ChevronUp, Edit3, Check, X, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SecurityHeadersConfig, SecurityHeaderDef } from '../_types';
import { defaultSecurityHeadersConfig } from '../_types';

const HEADER_META: Record<string, {
  label: string
  short: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  risk: string
  attack: string
}> = {
  'content-security-policy': {
    label: 'Content-Security-Policy',
    short: 'CSP',
    icon: ShieldAlert,
    color: 'text-red-400',
    risk: 'XSS · Inyección de scripts',
    attack: 'Un hacker inyecta <script> en un formulario de leads. Sin CSP, el script se ejecuta en el navegador del admin y roba su sesión.'
  },
  'strict-transport-security': {
    label: 'Strict-Transport-Security',
    short: 'HSTS',
    icon: Lock,
    color: 'text-amber-400',
    risk: 'MITM · Downgrade HTTP',
    attack: 'Un atacante en una red WiFi pública fuerza tu sitio a HTTP y captura contraseñas y tokens de sesión en texto plano.'
  },
  'x-frame-options': {
    label: 'X-Frame-Options',
    short: 'XFO',
    icon: Layers,
    color: 'text-orange-400',
    risk: 'Clickjacking · Robo de clics',
    attack: 'Un atacante empaqueta /superadmin/login en un iframe invisible. El admin escribe su contraseña pero realmente la envía al atacante.'
  },
  'x-content-type-options': {
    label: 'X-Content-Type-Options',
    short: 'NoSniff',
    icon: FileWarning,
    color: 'text-yellow-400',
    risk: 'MIME sniffing · Ejecución oculta',
    attack: 'Un atacante sube un archivo script.js disfrazado como imagen.png. El navegador lo ejecuta como JS en lugar de mostrarlo como imagen.'
  },
  'referrer-policy': {
    label: 'Referrer-Policy',
    short: 'RefPol',
    icon: Link2,
    color: 'text-blue-400',
    risk: 'Fuga de URL · Privacidad',
    attack: 'Un usuario hace clic en un enlace externo desde /miembros/perfil. El sitio destino recibe la URL completa incluyendo parámetros sensibles.'
  },
  'permissions-policy': {
    label: 'Permissions-Policy',
    short: 'PermPol',
    icon: Cctv,
    color: 'text-purple-400',
    risk: 'Abuso de APIs · Cámara/Mic/Ubicación',
    attack: 'Un script malicioso en un comentario del blog activa la cámara y el micro sin que el usuario lo sepa. Graba conversaciones privadas.'
  }
}

interface Props {
  config?: SecurityHeadersConfig
  saving?: boolean
  onSave?: () => void
  onUpdate?: (updates: Partial<SecurityHeadersConfig>) => void
}

export function SecurityHeadersTool({ config, saving, onSave, onUpdate }: Props) {
  const sec = config || defaultSecurityHeadersConfig
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (key: string) => {
    setEditingKey(key)
    setEditValue(sec.headers[key]?.valor || '')
  }

  const saveEdit = () => {
    if (!editingKey || !onUpdate) return
    onUpdate({
      headers: {
        ...sec.headers,
        [editingKey]: { ...sec.headers[editingKey], valor: editValue }
      }
    })
    setEditingKey(null)
  }

  const toggleHeaderEnabled = (key: string) => {
    if (!onUpdate) return
    onUpdate({
      headers: {
        ...sec.headers,
        [key]: { ...sec.headers[key], habilitado: !sec.headers[key].habilitado }
      }
    })
  }

  const activeCount = Object.values(sec.headers).filter(h => h.habilitado).length
  const totalHeaders = Object.keys(HEADER_META).length
  const percentage = Math.round((activeCount / totalHeaders) * 100)

  const grade = useMemo(() => {
    if (activeCount === 6) return { grade: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-400' }
    if (activeCount >= 5) return { grade: 'A', color: 'text-green-400', bg: 'bg-green-400' }
    if (activeCount >= 4) return { grade: 'B', color: 'text-blue-400', bg: 'bg-blue-400' }
    if (activeCount >= 3) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-400' }
    if (activeCount >= 2) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-400' }
    if (activeCount >= 1) return { grade: 'E', color: 'text-red-400', bg: 'bg-red-400' }
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-600' }
  }, [activeCount])

  return (
    <div className="bg-zinc-950 rounded-xl border border-white/5">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Security Headers</h2>
            <p className="text-xs text-gray-500">Cabeceras HTTP de seguridad · XSS · Clickjacking · MITM</p>
          </div>

          {/* Scanner grade */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className={`text-2xl font-black ${grade.color}`}>{grade.grade}</span>
              <span className="text-[10px] text-gray-500">Scanner {activeCount}/{totalHeaders}</span>
            </div>
            <div className="w-1.5 h-14 bg-zinc-900 rounded-full overflow-hidden relative">
              <motion.div
                animate={{ height: `${percentage}%` }}
                className={`absolute bottom-0 left-0 right-0 rounded-full ${grade.bg} opacity-80`}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs ${sec.habilitado ? 'text-green-400' : 'text-gray-500'}`}>
              {sec.habilitado ? 'Activo' : 'Inactivo'}
            </span>
            <button
              onClick={() => onUpdate?.({ habilitado: !sec.habilitado })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                sec.habilitado ? 'bg-green-500' : 'bg-zinc-700'
              }`}
            >
              <motion.div
                animate={{ x: sec.habilitado ? 20 : 2 }}
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md"
              />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${percentage}%` }}
              className={`h-full rounded-full ${grade.bg}`}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{activeCount} de {totalHeaders} activos</span>
        </div>
      </div>

      {/* Content */}
      {sec.habilitado && (
        <div className="p-6 space-y-2">
          {Object.entries(HEADER_META).map(([key, meta]) => {
            const header = sec.headers[key] || { habilitado: false, valor: '' }
            const isExpanded = expandedKey === key
            const isEditing = editingKey === key

            return (
              <motion.div
                key={key}
                className={`rounded-xl border transition-colors ${
                  header.habilitado
                    ? 'bg-emerald-500/3 border-emerald-500/10'
                    : 'bg-zinc-900 border-white/5 opacity-60'
                }`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                  onClick={() => setExpandedKey(isExpanded ? null : key)}
                >
                  <meta.icon className={`w-4 h-4 shrink-0 ${header.habilitado ? meta.color : 'text-gray-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${header.habilitado ? 'text-white' : 'text-gray-500'}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-gray-600">{meta.short}</span>
                    </div>
                    {!isExpanded && (
                      <p className="text-[10px] text-gray-600 truncate mt-0.5">{header.valor}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleHeaderEnabled(key) }}
                    className={`w-8 h-5 rounded-full transition-colors relative shrink-0 ${
                      header.habilitado ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <motion.div
                      animate={{ x: header.habilitado ? 14 : 2 }}
                      className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-md"
                    />
                  </button>
                  <div className="text-gray-600">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 mx-4">
                        {/* Risk & attack description */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-zinc-900 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="w-3 h-3 text-red-400" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Riesgo</span>
                            </div>
                            <p className="text-[11px] text-gray-300">{meta.risk}</p>
                          </div>
                          <div className="bg-zinc-900 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <ShieldAlert className="w-3 h-3 text-amber-400" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Vector de ataque</span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">{meta.attack}</p>
                          </div>
                        </div>

                        {/* Value editor */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Valor actual</span>
                            {!isEditing && (
                              <button
                                onClick={() => startEdit(key)}
                                className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                Editar
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none border border-white/5 focus:border-emerald-500/30"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingKey(null) }}
                              />
                              <button onClick={saveEdit} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditingKey(null)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <code className="block bg-zinc-900 rounded-lg px-3 py-2 text-[11px] text-emerald-400/80 font-mono break-all">
                              {header.valor}
                            </code>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}

          {/* Save */}
          <div className="flex justify-end pt-4 border-t border-white/5 mt-4">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blis-red text-white text-sm font-bold rounded-xl hover:bg-blis-red/80 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
