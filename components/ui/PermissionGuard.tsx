"use client"

import { usePermissions } from '@/hooks/usePermissions'
import { Shield, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { PERMISSIONS, type Permission } from '@/lib/auth/permissions'

interface PermissionGuardProps {
  section: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ section, children, fallback }: PermissionGuardProps) {
  const { canAccessSection, loading, defaultRoute } = usePermissions()

  useEffect(() => {
    if (!loading && !canAccessSection(section) && defaultRoute) {
      window.location.href = defaultRoute
    }
  }, [loading, canAccessSection, section, defaultRoute])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blis-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!canAccessSection(section)) {
    if (fallback) return <>{fallback}</>

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-8 text-center">
        <div className="p-6 rounded-3xl bg-zinc-950 border border-white/5 mb-6">
          <Shield className="w-16 h-16 text-blis-red opacity-40" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Acceso restringido</h2>
        <p className="text-gray-500 text-sm max-w-md mb-6">
            No tienes permisos para acceder a esta sección. Contacta al administrador si crees que deberías tener acceso.
          </p>
        <a
          href={defaultRoute || '/superadmin'}
          className="px-6 py-2.5 bg-blis-red text-white text-sm font-bold rounded-xl hover:bg-blis-red/80 transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
            Ir a mi página de inicio
          </a>
      </div>
    )
  }

  return <>{children}</>
}

export function useSectionPermission(section: string): { allowed: boolean; loading: boolean } {
  const { canAccessSection, loading } = usePermissions()
  return { allowed: canAccessSection(section), loading }
}

export function usePermissionCheck(permission: Permission | string): { allowed: boolean; loading: boolean } {
  const { hasPermission, loading } = usePermissions()
  return { allowed: hasPermission(permission), loading }
}