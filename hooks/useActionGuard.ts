"use client"

import { useCallback } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/components/ui/Toast'

const ACTION_LABELS: Record<string, string> = {
  crear: 'crear',
  editar: 'editar',
  eliminar: 'eliminar',
  ver: 'ver',
}

export function useActionGuard() {
  const { canDoAction, isAdmin } = usePermissions()
  const { showToast } = useToast()

  const guard = useCallback(
    (section: string, action: string, label?: string): boolean => {
      if (isAdmin) return true
      if (canDoAction(section, action)) return true
      const actionLabel = label || ACTION_LABELS[action] || action
      showToast(`No tienes permiso para ${actionLabel} este elemento`, 'error')
      return false
    },
    [canDoAction, isAdmin, showToast]
  )

  const canCreate = useCallback(
    (section: string): boolean => canDoAction(section, 'crear'),
    [canDoAction]
  )

  const canEdit = useCallback(
    (section: string): boolean => canDoAction(section, 'editar'),
    [canDoAction]
  )

  const canDelete = useCallback(
    (section: string): boolean => canDoAction(section, 'eliminar'),
    [canDoAction]
  )

  return { guard, canCreate, canEdit, canDelete, canDoAction }
}