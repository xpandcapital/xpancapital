"use client"

import { AuthProvider } from "@/hooks/useAuth"
import { ShopProvider } from "@/context/ShopContext"
import { SalesProvider } from "@/context/SalesContext"
import { ToastProvider } from "@/components/ui/Toast"
import { LandingCMSProvider } from "@/context/LandingCMSContext"
import { Header } from "@/components/sections/Header"
import { CursorWrapper } from "@/components/ui/CursorWrapper"
import { PWARegistrar } from "@/components/utils/PWARegistrar"
import { DynamicMetadata } from "@/components/utils/DynamicMetadata"
import { FaviconBadge } from "@/components/layout/FaviconBadge"

interface LayoutProvidersProps {
  children: React.ReactNode
  logoHorizontal?: string
  logoVertical?: string
  initialTemplate?: any
}

export function LayoutProviders({
  children,
  logoHorizontal,
  logoVertical,
  initialTemplate,
}: LayoutProvidersProps) {
  return (
    <LandingCMSProvider
      initialData={
        initialTemplate
          ? {
              templateData: initialTemplate,
            }
          : undefined
      }
    >
      <DynamicMetadata />
      <AuthProvider>
        <ToastProvider>
          <ShopProvider>
            <SalesProvider>
              <CursorWrapper />
              <PWARegistrar />
              <FaviconBadge />
              <Header
                logoHorizontal={logoHorizontal}
                logoVertical={logoVertical}
              />
              {children}
            </SalesProvider>
          </ShopProvider>
        </ToastProvider>
      </AuthProvider>
    </LandingCMSProvider>
  )
}
