'use client'

import { Globe } from 'lucide-react'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { SectionCard, InputField } from './FormFields'
import type { SiteConfig } from '../_types'

interface SeoPanelProps {
  config: SiteConfig
  updateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void
  keywordsInput: string
  setKeywordsInput: (v: string) => void
}

export function SeoPanel({ config, updateField, keywordsInput, setKeywordsInput }: SeoPanelProps) {
  return (
    <SectionCard title="SEO y Metadatos" icon={Globe}>
      <InputField
        label="Título (meta)"
        value={config.meta_title}
        onChange={(v) => updateField('meta_title', v)}
        placeholder="Xpand Capital | Luxury Tech Real Estate"
      />
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Descripción (meta)</label>
        <textarea
          value={config.meta_description}
          onChange={(e) => updateField('meta_description', e.target.value)}
          placeholder="El futuro de las inversiones inmobiliarias..."
          rows={3}
          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blis-red focus:outline-none transition-colors resize-none"
        />
      </div>
      <InputField
        label="Keywords (separados por coma)"
        value={keywordsInput}
        onChange={(v) => {
          setKeywordsInput(v)
          updateField('meta_keywords', v.split(',').map(k => k.trim()).filter(Boolean))
        }}
        placeholder="inmobiliaria, terrenos, inversiones, ecuador"
      />
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Imagen OG (Open Graph)</h4>
        <ImageUpload
          value={config.og_image}
          onChange={(v) => updateField('og_image', v)}
          folder="cms/seo"
        />
        <p className="text-[10px] text-gray-500 mt-2">Imagen para compartir en redes sociales (1200x630px recomendado)</p>
      </div>
    </SectionCard>
  )
}

