'use client'

import { Globe } from 'lucide-react'
import { SectionCard, InputField } from './FormFields'
import type { SiteConfig } from '../_types'

interface FooterPanelProps {
  config: SiteConfig
  updateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void
}

export function FooterPanel({ config, updateField }: FooterPanelProps) {
  return (
    <SectionCard title="Footer" icon={Globe}>
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Descripción del Footer</label>
        <textarea
          value={config.footer_description}
          onChange={(e) => updateField('footer_description', e.target.value)}
          placeholder="Somos la firma élite en desarrollo de software y tecnología real estate."
          rows={2}
          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blis-red focus:outline-none transition-colors resize-none"
        />
      </div>
      <InputField
        label="Copyright"
        value={config.footer_copyright}
        onChange={(v) => updateField('footer_copyright', v)}
        placeholder="© 2026 Xpand Capital. Todos los derechos reservados."
      />
      <InputField
        label="Texto de Ubicación"
        value={config.footer_location_text}
        onChange={(v) => updateField('footer_location_text', v)}
        placeholder="Diseñado con visión en 🇪🇨 Ecuador · 🇵🇪 Perú"
      />

      {/* VIP Section */}
      <div className="pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold text-white mb-4">Sección VIP (Suscripción)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Título VIP"
            value={config.footer_vip_title}
            onChange={(v) => updateField('footer_vip_title', v)}
            placeholder="Acceso VIP"
          />
          <InputField
            label="Texto Botón"
            value={config.footer_vip_button}
            onChange={(v) => updateField('footer_vip_button', v)}
            placeholder="Suscribirme"
          />
        </div>
        <div className="space-y-1.5 mt-4">
          <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Descripción VIP</label>
          <textarea
            value={config.footer_vip_description}
            onChange={(e) => updateField('footer_vip_description', e.target.value)}
            placeholder="Únete a la lista de inversores selectos..."
            rows={2}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blis-red focus:outline-none transition-colors resize-none"
          />
        </div>
        <InputField
          label="Placeholder del Email"
          value={config.footer_vip_placeholder}
          onChange={(v) => updateField('footer_vip_placeholder', v)}
          placeholder="Tu correo corporativo"
        />
      </div>

      {/* Projects & Legal */}
      <div className="pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold text-white mb-4">Proyectos y Legal</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Título Proyectos"
            value={config.footer_projects_title}
            onChange={(v) => updateField('footer_projects_title', v)}
            placeholder="Proyectos"
          />
          <InputField
            label="Título Legal"
            value={config.footer_legal_title}
            onChange={(v) => updateField('footer_legal_title', v)}
            placeholder="Legal"
          />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <input
            type="checkbox"
            id="showProjects"
            checked={config.footer_show_projects}
            onChange={(e) => updateField('footer_show_projects', e.target.checked)}
            className="w-4 h-4 accent-blis-red"
          />
          <label htmlFor="showProjects" className="text-sm text-gray-300">Mostrar proyectos dinámicamente (desde base de datos)</label>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">Los proyectos se cargan automáticamente desde la base de datos del sitio.</p>
      </div>
    </SectionCard>
  )
}

