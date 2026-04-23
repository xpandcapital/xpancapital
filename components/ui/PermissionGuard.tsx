"use client"

import { useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { type Permission } from '@/lib/auth/permissions'

interface PermissionGuardProps {
  section: string
  children: React.ReactNode
}

export function PermissionGuard({ section, children }: PermissionGuardProps) {
  const { canAccessSection, loading, defaultRoute } = usePermissions()

  useEffect(() => {
    if (!loading && !canAccessSection(section)) {
      window.location.href = defaultRoute || '/superadmin'
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
    return null
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
