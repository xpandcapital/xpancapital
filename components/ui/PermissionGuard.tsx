"use client"

import { usePermissions } from '@/hooks/usePermissions'
import { useRouter } from 'next/navigation'
import { PERMISSIONS, type Permission } from '@/lib/auth/permissions'

interface PermissionGuardProps {
  section: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ section, children, fallback }: PermissionGuardProps) {
  const { canAccessSection, loading, defaultRoute } = usePermissions()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blis-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!canAccessSection(section)) {
    const redirectUrl = defaultRoute || '/superadmin'
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl
    }
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