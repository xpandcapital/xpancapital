// Hook para permisos granulares del usuario
// Combina el rol del perfil con permisos adicionales y permisos del rol en la BD
"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  getEffectivePermissions,
  hasPermission as checkPermission,
  canAccessSection as checkSection,
  isAdminRole as checkIsAdmin,
  getDefaultRouteForRole,
  PermisosAdicionales,
  SECTION_PERMISSIONS,
  ROLE_CONFIG,
  ROLE_DEFAULTS,
  UserRole,
  Permission,
} from '@/lib/auth/permissions'

export function usePermissions() {
  const { user, loading: authLoading } = useAuth()
  const [rolePermissions, setRolePermissions] = useState<string[]>([])
  const [roleRutaInicio, setRoleRutaInicio] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user?.id) {
      setRolePermissions([])
      setRoleRutaInicio(null)
      setApiLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setApiLoading(true)
      try {
        const res = await fetch('/api/admin/roles')
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        const rolesArray = Array.isArray(json) ? json : (json.data || [])
        const roleData = rolesArray.find?.((r: { nombre: string }) => r.nombre === user.role)
        if (cancelled) return
        setRolePermissions(roleData?.permisos || [])
        setRoleRutaInicio(roleData?.ruta_inicio || null)
      } catch (e) {
        console.error('[usePermissions] fetch error:', e)
        if (!cancelled) setRolePermissions([])
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [user?.id, user?.role, authLoading])

  const rol = (user?.role || 'usuario') as UserRole
  const permisosAdicionales = user?.permisos_adicionales as PermisosAdicionales | null | undefined

  const effectivePermissions = !apiLoading && rolePermissions.length > 0
    ? getEffectivePermissionsFromDB(rol, rolePermissions, permisosAdicionales)
    : getEffectivePermissions(rol, permisosAdicionales)

  const isAdmin = checkIsAdmin(rol)
  const defaultRoute = getDefaultRouteForRole(rol, roleRutaInicio)
  const roleConfig = ROLE_CONFIG[rol] || ROLE_CONFIG.usuario

  return {
    permissions: effectivePermissions,
    effectivePermissions,
    hasPermission: useCallback(
      (permission: string) => checkPermission(effectivePermissions, permission),
      [effectivePermissions]
    ),
    canAccessSection: useCallback(
      (sectionPath: string) => checkSection(effectivePermissions, sectionPath),
      [effectivePermissions]
    ),
    role: rol,
    isAdmin,
    defaultRoute,
    roleConfig,
    allowedSections: Object.entries(SECTION_PERMISSIONS)
      .filter(([, perm]) => checkPermission(effectivePermissions, perm))
      .map(([section]) => section),
    loading: authLoading || apiLoading,
  }
}

function getEffectivePermissionsFromDB(
  rol: string,
  dbPermissions: string[],
  permisosAdicionales?: PermisosAdicionales | null
): Set<string> {
  const defaults = ROLE_DEFAULTS[rol as UserRole] || ROLE_DEFAULTS.usuario
  const hasWildcardDefault = defaults.includes('*' as any)
  const base = new Set<string>(dbPermissions.length > 0 ? dbPermissions : defaults)

  if (hasWildcardDefault) {
    base.add('*')
  }

  if (permisosAdicionales?.extra) {
    permisosAdicionales.extra.forEach(p => base.add(p))
  }

  if (permisosAdicionales?.denied) {
    permisosAdicionales.denied.forEach(p => base.delete(p))
  }

  if (hasWildcardDefault) {
    base.add('*')
  }

  return base
}