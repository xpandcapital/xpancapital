// Hook para permisos granulares del usuario
// Combina el rol del perfil con permisos adicionales y permisos del rol en la BD
"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef<string>('')
  const effectivePermissionsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (authLoading) return

    const userId = user?.id || ''
    const userRole = user?.role || 'usuario'
    const refKey = `${userId}:${userRole}`
    if (fetchedRef.current === refKey) return
    fetchedRef.current = refKey

    async function fetchRolePermissions() {
      if (!userId) {
        setRolePermissions([])
        setRoleRutaInicio(null)
        effectivePermissionsRef.current = new Set()
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/admin/roles')
        if (res.ok) {
          const json = await res.json()
          const rolesArray = Array.isArray(json) ? json : (json.data || [])
          const roleData = rolesArray.find?.((r: { nombre: string }) => r.nombre === userRole)
          const permisos = roleData?.permisos || []
          setRolePermissions(permisos)
          effectivePermissionsRef.current = permisos.length > 0
            ? getEffectivePermissionsFromDB(userRole, permisos, null)
            : getEffectivePermissions(userRole, null)
          if (roleData?.ruta_inicio) {
            setRoleRutaInicio(roleData.ruta_inicio)
          }
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    fetchRolePermissions()
  }, [user?.id, user?.role, authLoading])

  // Calcular permisos efectivos: rol por defecto + BD + permisos adicionales
  const rol = (user?.role || 'usuario') as UserRole
  const permisosAdicionales = user?.permisos_adicionales as PermisosAdicionales | null | undefined

  // Usar ref para evitar problemas de timing - solo se actualiza cuando loading es false
  const effectivePermissions = loading
    ? new Set<string>()
    : (rolePermissions.length > 0
        ? getEffectivePermissionsFromDB(rol, rolePermissions, permisosAdicionales)
        : getEffectivePermissions(rol, permisosAdicionales))

  const isAdmin = checkIsAdmin(rol)
  const defaultRoute = getDefaultRouteForRole(rol, roleRutaInicio)
  const roleConfig = ROLE_CONFIG[rol] || ROLE_CONFIG.usuario

  return {
    // Permisos
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

    // Rol
    role: rol,
    isAdmin,
    defaultRoute,
    roleConfig,

    // Secciones del sidebar para las que tiene permiso
    allowedSections: Object.entries(SECTION_PERMISSIONS)
      .filter(([, perm]) => checkPermission(effectivePermissions, perm))
      .map(([section]) => section),

    // Estado
    loading: authLoading || loading,
  }
}

// Calcula permisos usando los de la BD como base
// Los roles con wildcard (*) en ROLE_DEFAULTS siempre mantienen acceso total
function getEffectivePermissionsFromDB(
  rol: string,
  dbPermissions: string[],
  permisosAdicionales?: PermisosAdicionales | null
): Set<string> {
  const defaults = ROLE_DEFAULTS[rol as UserRole] || ROLE_DEFAULTS.usuario
  const hasWildcardDefault = defaults.includes('*' as any)

  // Use DB permissions if available, otherwise fall back to defaults
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

  // Re-add wildcard if role requires it (denied list can't remove it)
  if (hasWildcardDefault) {
    base.add('*')
  }

  return base
}