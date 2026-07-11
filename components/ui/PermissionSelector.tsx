"use client"

import { useState } from 'react'
import { PERMISSIONS, ROLE_DEFAULTS, type Permission, type UserRole, type PermisosAdicionales } from '@/lib/auth/permissions'
import { Check, X, Shield, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PermissionSelectorProps {
  role: UserRole
  permisosAdicionales?: PermisosAdicionales | null
  onChange: (permisos: PermisosAdicionales) => void
  readOnly?: boolean
}

const PERMISSION_CATEGORIES: Record<string, Permission[]> = {
  'Dashboard': ['dashboard:ver'],
  'Proyectos': ['proyectos:ver', 'proyectos:crear', 'proyectos:editar', 'proyectos:eliminar'],
  'Lotes': ['lotes:ver', 'lotes:editar'],
  'Contratos': ['contratos:ver', 'contratos:crear', 'contratos:editar'],
  'Asesores': ['asesores:ver', 'asesores:crear', 'asesores:editar'],
  'POS': ['pos:ver'],
  'Ventas': ['ventas:ver', 'ventas:crear', 'ventas:editar', 'ventas:eliminar'],
  'Formas de Pago': ['formasdepago:ver', 'formasdepago:editar'],
  'Productos': ['productos:ver', 'productos:crear', 'productos:editar', 'productos:eliminar'],
  'Clientes': ['clientes:ver', 'clientes:editar'],
  'Cursos': ['cursos:ver', 'cursos:crear', 'cursos:editar', 'cursos:eliminar'],
  'Biblioteca': ['biblioteca:ver', 'biblioteca:crear', 'biblioteca:editar', 'biblioteca:eliminar'],
  'Certificados': ['certificados:ver', 'certificados:crear'],
  'Trading': ['trading:ver'],
  'Páginas': ['templates:ver', 'templates:editar'],
  'Correos': ['mails:ver', 'mails:editar'],
  'Calendarios': ['calendarios:ver', 'calendarios:editar'],
  'Formularios': ['formularios:ver', 'formularios:crear'],
  'Leads': ['leads:ver', 'leads:editar'],
  'Campañas': ['campanas:ver', 'campanas:crear'],
  'Blog': ['blog:ver', 'blog:crear', 'blog:editar', 'blog:eliminar'],
  'Equipo': ['equipo:ver', 'equipo:crear', 'equipo:editar'],
  'Postulantes': ['postulantes:ver', 'postulantes:editar'],
  'Capacitaciones': ['capacitaciones:ver', 'capacitaciones:editar'],
  'Utilidades': ['utilidades:ver'],
  'Configuración': ['configuracion:ver', 'configuracion:editar'],
  'APIs y Nube': ['api-nube:ver'],
  'Analíticas': ['analiticas:ver'],
  'Ajustes': ['ajustes:ver', 'ajustes:editar'],
  'Roles': ['roles:ver', 'roles:editar'],
  'Perfil': ['perfil:ver', 'perfil:editar'],
  'Miembros': ['miembros:ver'],
  'Facturación': ['facturacion:ver'],
}

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  empleado: 'Empleado',
  cliente: 'Cliente',
  usuario: 'Usuario',
}

export function PermissionSelector({ role, permisosAdicionales, onChange, readOnly = false }: PermissionSelectorProps) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(Object.keys(PERMISSION_CATEGORIES)))
  const [activeTab, setActiveTab] = useState<'defaults' | 'overrides'>('overrides')

  const defaults = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.usuario
  const isWildcard = (defaults as any[]).includes('*')
  const extras = permisosAdicionales?.extra || []
  const denieds = permisosAdicionales?.denied || []

  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const toggleExtra = (perm: Permission) => {
    if (readOnly) return
    const newExtras = extras.includes(perm)
      ? extras.filter(p => p !== perm)
      : [...extras, perm]
    const newDenieds = denieds.filter(p => p !== perm)
    onChange({ extra: newExtras, denied: newDenieds })
  }

  const toggleDenied = (perm: Permission) => {
    if (readOnly) return
    const newDenieds = denieds.includes(perm)
      ? denieds.filter(p => p !== perm)
      : [...denieds, perm]
    const newExtras = extras.filter(p => p !== perm)
    onChange({ extra: newExtras, denied: newDenieds })
  }

  const getPermissionState = (perm: Permission): 'default' | 'extra' | 'denied' => {
    if (denieds.includes(perm)) return 'denied'
    if (isWildcard || defaults.includes(perm)) return 'default'
    if (extras.includes(perm)) return 'extra'
    return 'default'
  }

  const isEffectivelyEnabled = (perm: Permission): boolean => {
    if (denieds.includes(perm)) return false
    if (isWildcard) return true
    return defaults.includes(perm) || extras.includes(perm)
  }

  return (
    <div className="space-y-4">
      {isWildcard && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/20">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-bold text-xs">Acceso Total</p>
            <p className="text-gray-500 text-[10px]">Tiene todos los permisos — puedes denegar secciones específicas abajo</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Shield className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">
            Permisos de <span className="text-blis-red">{ROLE_LABELS[role]}</span>
          </p>
          <p className="text-gray-500 text-xs">
            {isWildcard ? 'Acceso total' : `${defaults.length} permisos por defecto`}
            {extras.length > 0 && ` + ${extras.length} extras`}
            {denieds.length > 0 && ` - ${denieds.length} denegados`}
          </p>
        </div>
      </div>

      {!readOnly && (
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          <button onClick={() => setActiveTab('defaults')} className={`flex-1 text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-lg transition-all ${activeTab === 'defaults' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            Permisos del Rol
          </button>
          <button onClick={() => setActiveTab('overrides')} className={`flex-1 text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-lg transition-all ${activeTab === 'overrides' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            Personalizar
          </button>
        </div>
      )}

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {Object.entries(PERMISSION_CATEGORIES).map(([cat, perms]) => {
          const catDefaultCount = perms.filter(p => defaults.includes(p)).length
          const catExtraCount = perms.filter(p => extras.includes(p)).length
          const catDeniedCount = perms.filter(p => denieds.includes(p)).length
          const hasOverrides = catExtraCount > 0 || catDeniedCount > 0

          return (
            <div key={cat} className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedCats.has(cat) ? <ChevronDown className="w-3 h-3 text-gray-600" /> : <ChevronRight className="w-3 h-3 text-gray-600" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{cat}</span>
                  {hasOverrides && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </div>
                <span className="text-[9px] text-gray-600">
                  {catDefaultCount}/{perms.length}
                  {catExtraCount > 0 && ` +${catExtraCount}`}
                  {catDeniedCount > 0 && ` -${catDeniedCount}`}
                </span>
              </button>
              <AnimatePresence>
                {expandedCats.has(cat) && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                      {perms.map(perm => {
                        const state = getPermissionState(perm)
                        const enabled = isEffectivelyEnabled(perm)

                        if (activeTab === 'defaults' && !readOnly) {
                          return (
                            <span key={perm} className={`text-[9px] px-2 py-0.5 rounded-full border ${enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-gray-600'}`}>
                              {enabled ? <Check className="w-2.5 h-2.5 inline mr-0.5" /> : <X className="w-2.5 h-2.5 inline mr-0.5" />}
                              {PERMISSIONS[perm]}
                            </span>
                          )
                        }

                        return (
                          <div key={perm} className="flex items-center gap-1">
                            {state === 'denied' ? (
                              <button
                                onClick={() => toggleDenied(perm)}
                                disabled={readOnly}
                                className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-red-500/20'} bg-red-500/10 border-red-500/30 text-red-400`}
                              >
                                <X className="w-2.5 h-2.5 inline mr-0.5" />
                                {PERMISSIONS[perm]}
                              </button>
                            ) : state === 'extra' ? (
                              <button
                                onClick={() => toggleExtra(perm)}
                                disabled={readOnly}
                                className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-emerald-500/20'} bg-emerald-500/10 border-emerald-500/30 text-emerald-400`}
                              >
                                <Check className="w-2.5 h-2.5 inline mr-0.5" />
                                {PERMISSIONS[perm]}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (readOnly) return
                                  if (defaults.includes(perm)) {
                                    toggleDenied(perm)
                                  } else {
                                    toggleExtra(perm)
                                  }
                                }}
                                disabled={readOnly}
                                className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${enabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:border-blue-500/50' : 'bg-white/[0.02] border-white/5 text-gray-600 hover:border-white/10 hover:text-gray-400'}`}
                              >
                                {enabled && <Check className="w-2.5 h-2.5 inline mr-0.5" />}
                                {PERMISSIONS[perm]}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {!readOnly && (extras.length > 0 || denieds.length > 0) && (
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ extra: [], denied: [] })}
            className="text-[9px] px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            Restablecer a por defecto
          </button>
        </div>
      )}
    </div>
  )
}