'use client'

import { Share2 } from 'lucide-react'
import { SectionCard, InputField } from './FormFields'
import type { SiteConfig } from '../_types'

interface SocialPanelProps {
  config: SiteConfig
  updateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void
}

export function SocialPanel({ config, updateField }: SocialPanelProps) {
  return (
    <SectionCard title="Redes Sociales" icon={Share2}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InputField
          label="Instagram"
          value={config.social_instagram}
          onChange={(v) => updateField('social_instagram', v)}
          placeholder="https://instagram.com/xpancapital"
        />
        <InputField
          label="Facebook"
          value={config.social_facebook}
          onChange={(v) => updateField('social_facebook', v)}
          placeholder="https://facebook.com/xpancapital"
        />
        <InputField
          label="YouTube"
          value={config.social_youtube}
          onChange={(v) => updateField('social_youtube', v)}
          placeholder="https://youtube.com/@xpancapital"
        />
        <InputField
          label="TikTok"
          value={config.social_tiktok}
          onChange={(v) => updateField('social_tiktok', v)}
          placeholder="https://tiktok.com/@xpancapital"
        />
        <InputField
          label="LinkedIn"
          value={config.social_linkedin}
          onChange={(v) => updateField('social_linkedin', v)}
          placeholder="https://linkedin.com/company/xpancapital"
        />
        <InputField
          label="X (Twitter)"
          value={config.social_twitter}
          onChange={(v) => updateField('social_twitter', v)}
          placeholder="https://x.com/xpancapital"
        />
        <InputField
          label="WhatsApp"
          value={config.social_whatsapp}
          onChange={(v) => updateField('social_whatsapp', v)}
          placeholder="https://wa.me/593999999999"
        />
      </div>
    </SectionCard>
  )
}

