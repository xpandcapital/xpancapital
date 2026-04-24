"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  hasPermission as checkPermission,
  canAccessSection as checkSection,
  isAdminRole as checkIsAdmin,
  getDefaultRouteForRole,
  SECTION_PERMISSIONS,
  ROLE_CONFIG,
  ROLE_DEFAULTS,
  type UserRole,
} from '@/lib/auth/permissions'

export function usePermissions() {
  const { user, loading: authLoading } = useAuth()
  const [dbPermissions, setDbPermissions] = useState<string[] | null>(null)
  const [dbRutaInicio, setDbRutaInicio] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user?.id) {
      setDbPermissions([])
      setDbRutaInicio(null)
      setApiLoading(false)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    async function load() {
      setApiLoading(true)
      setDbPermissions(null)
      try {
        const res = await fetch(`/api/admin/roles`, {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        const rolesArray = Array.isArray(json) ? json : (json.data || [])
        const roleData = rolesArray.find?.(
          (r: { nombre: string }) => r.nombre === user.role
        )
        setDbPermissions(roleData?.permisos ?? null)
        setDbRutaInicio(roleData?.ruta_inicio ?? null)
      } catch (e: any) {
        if (e.name === 'AbortError') return
        console.error('[usePermissions] fetch error:', e)
        setDbPermissions([])
      } finally {
        setApiLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [user?.id, user?.role, authLoading])

  const rol = (user?.role || 'usuario') as UserRole
  const permisosAdicionales = user?.permisos_adicionales as
    | { extra?: string[]; denied?: string[] }
    | null
    | undefined

  const effectivePermissions: Set<string> | null =
    !apiLoading && dbPermissions !== null
      ? buildEffectivePermissions(rol, dbPermissions, permisosAdicionales)
      : null

  const isAdmin = checkIsAdmin(rol)
  const defaultRoute = getDefaultRouteForRole(rol, dbRutaInicio)
  const roleConfig = ROLE_CONFIG[rol] || ROLE_CONFIG.usuario

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!effectivePermissions) return false
      return checkPermission(effectivePermissions, permission)
    },
    [effectivePermissions]
  )

  const canAccessSection = useCallback(
    (sectionPath: string): boolean => {
      if (!effectivePermissions) return false
      return checkSection(effectivePermissions, sectionPath)
    },
    [effectivePermissions]
  )

  const allowedSections = Object.entries(SECTION_PERMISSIONS)
    .filter(([, perm]) =>
      effectivePermissions ? checkPermission(effectivePermissions, perm) : false
    )
    .map(([section]) => section)

  return {
    permissions: effectivePermissions,
    effectivePermissions,
    hasPermission,
    canAccessSection,
    role: rol,
    isAdmin,
    defaultRoute,
    roleConfig,
    allowedSections,
    loading: authLoading || apiLoading,
  }
}

function buildEffectivePermissions(
  rol: string,
  dbPermissions: string[],
  permisosAdicionales?: { extra?: string[]; denied?: string[] } | null
): Set<string> {
  const defaults = ROLE_DEFAULTS[rol as UserRole] || ROLE_DEFAULTS.usuario

  const base =
    dbPermissions.length > 0
      ? new Set<string>(dbPermissions)
      : new Set<string>(defaults)

  if (permisosAdicionales?.extra) {
    permisosAdicionales.extra.forEach((p) => base.add(p))
  }
  if (permisosAdicionales?.denied) {
    permisosAdicionales.denied.forEach((p) => base.delete(p))
  }

  if (base.has('*')) {
    base.add('*')
  }

  return base
}