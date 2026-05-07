"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"

export function FaviconBadge() {
  const { user } = useAuth()
  const pathname = usePathname()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const originalTitleRef = useRef<string>("")

  useEffect(() => {
    originalTitleRef.current = document.title || "BLIS Corp"

    return () => {
      document.title = originalTitleRef.current
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    const isAdminArea = pathname?.startsWith("/superadmin")
    const isAuthenticated = !!user

    if (!isAuthenticated || !isAdminArea) {
      document.title = originalTitleRef.current
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const checkUnread = async () => {
      try {
        const res = await fetch("/api/notificaciones?unread=true")
        const data = await res.json()
        if (data.success && typeof data.count === "number" && data.count > 0) {
          document.title = `(${data.count}) ${originalTitleRef.current}`
        } else {
          document.title = originalTitleRef.current
        }
      } catch {
        document.title = originalTitleRef.current
      }
    }

    checkUnread()
    intervalRef.current = setInterval(checkUnread, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [user, pathname])

  return null
}
