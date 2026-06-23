"use client"

import { useEffect } from "react"

export function RecoveryRedirect() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes("type=recovery")) {
      window.location.replace("/reset-password" + hash)
    }
  }, [])

  return null
}
