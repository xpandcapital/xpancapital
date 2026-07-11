'use client'

import { Mail } from 'lucide-react'
import { SectionCard, InputField } from './FormFields'
import type { SiteConfig } from '../_types'

interface ContactPanelProps {
  config: SiteConfig
  updateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void
}

export function ContactPanel({ config, updateField }: ContactPanelProps) {
  return (
    <SectionCard title="Contacto" icon={Mail}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField
          label="Email"
          type="email"
          value={config.contact_email}
          onChange={(v) => updateField('contact_email', v)}
          placeholder="contacto@xpancapital.com"
        />
        <InputField
          label="Teléfono"
          value={config.contact_phone}
          onChange={(v) => updateField('contact_phone', v)}
          placeholder="+593 99 999 9999"
        />
        <InputField
          label="Dirección"
          value={config.contact_address}
          onChange={(v) => updateField('contact_address', v)}
          placeholder="Quito, Ecuador"
        />
      </div>
    </SectionCard>
  )
}

