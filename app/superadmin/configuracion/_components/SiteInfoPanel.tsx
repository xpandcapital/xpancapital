'use client'

import { Globe } from 'lucide-react'
import { SectionCard, InputField } from './FormFields'
import type { SiteConfig } from '../_types'

interface SiteInfoPanelProps {
  config: SiteConfig
  updateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void
}

export function SiteInfoPanel({ config, updateField }: SiteInfoPanelProps) {
  return (
    <SectionCard title="Información del Sitio" icon={Globe}>
      {/* Preview */}
      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-zinc-900/30">
        <p className="text-xs text-gray-400 mb-3">Vista previa en navegador</p>
        <div className="flex items-center gap-3">
          {config.favicon ? (
            <img src={config.favicon} alt="Favicon" className="w-6 h-6 object-contain" />
          ) : (
            <div className="w-6 h-6 bg-blis-red rounded flex items-center justify-center text-white text-[10px] font-bold">
              {config.site_name?.charAt(0) || 'B'}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-white">{config.site_name || 'Nombre del Sitio'}</p>
            <p className="text-[10px] text-gray-500">{config.site_tagline || 'Eslogan del sitio'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Nombre del Sitio"
          value={config.site_name}
          onChange={(v) => updateField('site_name', v)}
          placeholder="BLIS Corp"
        />
        <InputField
          label="Tagline / Eslogan"
          value={config.site_tagline}
          onChange={(v) => updateField('site_tagline', v)}
          placeholder="Luxury Tech Real Estate"
        />
      </div>
    </SectionCard>
  )
}
