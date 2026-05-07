'use client'

import { ImageIcon } from 'lucide-react'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { SectionCard } from './FormFields'
import type { SiteConfig } from '../_types'

interface BrandingPanelProps {
  config: SiteConfig
  updateField: <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => void
}

export function BrandingPanel({ config, updateField }: BrandingPanelProps) {
  return (
    <SectionCard title="Logos y Branding" icon={ImageIcon}>
      {/* Primary Logos */}
      <div className="mb-8">
        <h4 className="text-sm font-bold text-white mb-1">Logos Principales</h4>
        <p className="text-xs text-gray-500 mb-6">Logos utilizados en el header y footer del sitio</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo Horizontal */}
          <div className="bg-zinc-900/50 rounded-xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block">Logo Horizontal</label>
                <span className="text-[10px] text-gray-500">Header, fondo oscuro</span>
              </div>
              {config.logo_horizontal && (
                <button
                  onClick={() => updateField('logo_horizontal', '')}
                  className="text-[10px] text-red-400 hover:text-red-300"
                >
                  Eliminar
                </button>
              )}
            </div>
            <div className="aspect-[3/1] bg-black/50 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
              {config.logo_horizontal ? (
                <img src={config.logo_horizontal} alt="Logo Horizontal" className="max-w-[80%] max-h-[80%] object-contain" />
              ) : (
                <div className="text-gray-600 text-xs">Vista previa</div>
              )}
            </div>
            <div className="mt-3">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Subir imagen</label>
              <ImageUpload
                value={config.logo_horizontal}
                onChange={(v) => updateField('logo_horizontal', v)}
                folder="cms/branding"
              />
            </div>
          </div>

          {/* Logo Vertical */}
          <div className="bg-zinc-900/50 rounded-xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block">Logo Vertical</label>
                <span className="text-[10px] text-gray-500">Footer, fondos claros</span>
              </div>
              {config.logo_vertical && (
                <button
                  onClick={() => updateField('logo_vertical', '')}
                  className="text-[10px] text-red-400 hover:text-red-300"
                >
                  Eliminar
                </button>
              )}
            </div>
            <div className="aspect-[1/2] max-h-[200px] bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden mx-auto w-32">
              {config.logo_vertical ? (
                <img src={config.logo_vertical} alt="Logo Vertical" className="max-w-[80%] max-h-[80%] object-contain" />
              ) : (
                <div className="text-gray-600 text-xs">Vista previa</div>
              )}
            </div>
            <div className="mt-3">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Subir imagen</label>
              <ImageUpload
                value={config.logo_vertical}
                onChange={(v) => updateField('logo_vertical', v)}
                folder="cms/branding"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Variant Logos */}
      <div className="pt-6 border-t border-white/5">
        <h4 className="text-sm font-bold text-white mb-1">Logos Alternativos</h4>
        <p className="text-xs text-gray-500 mb-6">Versiones para fondos claros y otros usos</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Horizontal Light */}
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-gray-300">Logo Horizontal Light</label>
              {config.logo_horizontal_light && (
                <button onClick={() => updateField('logo_horizontal_light', '')} className="text-[10px] text-red-400 hover:text-red-300">Eliminar</button>
              )}
            </div>
            <div className="aspect-[3/1] bg-white rounded-lg border border-white/10 flex items-center justify-center overflow-hidden mb-3">
              {config.logo_horizontal_light ? (
                <img src={config.logo_horizontal_light} alt="Logo Horizontal Light" className="max-w-[80%] max-h-[80%] object-contain" />
              ) : (
                <div className="text-gray-400 text-xs">Para fondo claro</div>
              )}
            </div>
            <ImageUpload
              value={config.logo_horizontal_light}
              onChange={(v) => updateField('logo_horizontal_light', v)}
              folder="cms/branding"
            />
          </div>

          {/* Logo Vertical Light */}
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-gray-300">Logo Vertical Light</label>
              {config.logo_vertical_light && (
                <button onClick={() => updateField('logo_vertical_light', '')} className="text-[10px] text-red-400 hover:text-red-300">Eliminar</button>
              )}
            </div>
            <div className="aspect-[1/2] max-h-[120px] bg-white rounded-lg border border-white/10 flex items-center justify-center overflow-hidden mb-3 mx-auto w-20">
              {config.logo_vertical_light ? (
                <img src={config.logo_vertical_light} alt="Logo Vertical Light" className="max-w-[80%] max-h-[80%] object-contain" />
              ) : (
                <div className="text-gray-400 text-xs text-center">Para fondo claro</div>
              )}
            </div>
            <ImageUpload
              value={config.logo_vertical_light}
              onChange={(v) => updateField('logo_vertical_light', v)}
              folder="cms/branding"
            />
          </div>
        </div>
      </div>

      {/* Favicon */}
      <div className="pt-6 border-t border-white/5 mt-6">
        <h4 className="text-sm font-bold text-white mb-1">Favicon</h4>
        <p className="text-xs text-gray-500 mb-4">Icono mostrado en pestañas del navegador</p>

        <div className="flex items-start gap-6">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 flex-1">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-black rounded-lg border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {config.favicon ? (
                  <img src={config.favicon} alt="Favicon" className="w-12 h-12 object-contain" />
                ) : (
                  <div className="text-gray-600 text-[8px] text-center">32x32</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 mb-2">Formato recomendado: PNG o ICO, 32x32 o 64x64 píxeles</p>
                <ImageUpload
                  value={config.favicon}
                  onChange={(v) => updateField('favicon', v)}
                  folder="cms/branding"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
