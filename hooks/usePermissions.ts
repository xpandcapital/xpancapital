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
  const [loading, setLoading] = useState(true)

  // Obtener permisos del rol desde la tabla `roles` en la BD
  useEffect(() => {
    async function fetchRolePermissions() {
      if (!user?.id) {
        setRolePermissions([])
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/admin/roles')
        if (res.ok) {
          const json = await res.json()
          const rolesArray = Array.isArray(json) ? json : (json.data || [])
          const userRole = user.role || 'usuario'
          const roleData = rolesArray.find?.((r: { nombre: string }) => r.nombre === userRole)
          if (roleData?.permisos) {
            setRolePermissions(roleData.permisos)
          }
        }
      } catch {
        // Si falla, usar los permisos por defecto del sistema
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchRolePermissions()
    }
  }, [user?.id, user?.role, authLoading])

  // Calcular permisos efectivos: rol por defecto + BD + permisos adicionales
  const rol = (user?.role || 'usuario') as UserRole
  const permisosAdicionales = user?.permisos_adicionales as PermisosAdicionales | null | undefined

  // Si tenemos permisos de la BD, usarlos como base; si no, usar los del sistema
  const effectivePermissions = rolePermissions.length > 0
    ? getEffectivePermissionsFromDB(rol, rolePermissions, permisosAdicionales)
    : getEffectivePermissions(rol, permisosAdicionales)

  const isAdmin = checkIsAdmin(rol)
  const defaultRoute = getDefaultRouteForRole(rol)
  const roleConfig = ROLE_CONFIG[rol] || ROLE_CONFIG.usuario

  return {
    // Permisos
    permissions: effectivePermissions,
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

  const base = new Set<string>(dbPermissions)

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