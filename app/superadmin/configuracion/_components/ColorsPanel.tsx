'use client'

import { Palette } from 'lucide-react'
import { SectionCard, ColorField } from './FormFields'
import type { SiteConfig } from '../_types'

interface ColorsPanelProps {
  config: SiteConfig
  updateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void
}

export function ColorsPanel({ config, updateField }: ColorsPanelProps) {
  return (
    <SectionCard title="Colores de Marca" icon={Palette}>
      {/* Preview */}
      <div className="mb-6 p-4 rounded-xl border border-white/10 bg-zinc-900/30">
        <p className="text-xs text-gray-400 mb-3">Vista previa</p>
        <div className="flex items-center gap-4">
          <div
            className="px-4 py-2 rounded-lg font-bold text-sm"
            style={{ backgroundColor: config.primary_color, color: config.text_color }}
          >
            Botón Primario
          </div>
          <div
            className="px-4 py-2 rounded-lg font-bold text-sm border-2"
            style={{ borderColor: config.secondary_color, color: config.text_color }}
          >
            Botón Secundario
          </div>
          <div
            className="px-4 py-2 rounded-lg font-bold text-sm"
            style={{ backgroundColor: config.accent_color, color: '#000' }}
          >
            Acento
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <ColorField label="Primario" value={config.primary_color} onChange={(v) => updateField('primary_color', v)} />
        <ColorField label="Secundario" value={config.secondary_color} onChange={(v) => updateField('secondary_color', v)} />
        <ColorField label="Fondo" value={config.background_color} onChange={(v) => updateField('background_color', v)} />
        <ColorField label="Texto" value={config.text_color} onChange={(v) => updateField('text_color', v)} />
        <ColorField label="Acento" value={config.accent_color} onChange={(v) => updateField('accent_color', v)} />
      </div>
    </SectionCard>
  )
}
