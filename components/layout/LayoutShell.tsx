import { getCachedLandingTemplate } from '@/lib/cache/template'
import { LayoutProviders } from './LayoutProviders'

export async function LayoutShell({ children }: { children: React.ReactNode }) {
  const template = await getCachedLandingTemplate()

  return (
    <LayoutProviders
      logoHorizontal={template?.config?.branding?.logoHorizontal}
      logoVertical={template?.config?.branding?.logoVertical}
      initialTemplate={template}
    >
      {children}
    </LayoutProviders>
  )
}
