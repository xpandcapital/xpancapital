"use client";

import { useState } from "react";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { TemplateData } from "../_types";
import { InputField, TextAreaField, ColorPicker, SectionCard } from "./ui";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface ConfigPanelProps {
  template: TemplateData | null;
  templateConfig: TemplateData['config'];
  setTemplateConfig: React.Dispatch<React.SetStateAction<TemplateData['config']>>;
  setTemplate: React.Dispatch<React.SetStateAction<TemplateData | null>>;
  showToast: (message: string, type?: any) => void;
}

export function ConfigPanel({
  template,
  templateConfig,
  setTemplateConfig,
  setTemplate,
  showToast,
}: ConfigPanelProps) {
  return (
    <div className="space-y-6">
      {/* STATUS CARD */}
      <SectionCard title="Estado del Template">
        <div className="flex flex-wrap gap-3">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
            template?.estado === 'activo' 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {template?.estado === 'activo' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {template?.estado === 'activo' ? 'Activo' : template?.estado || 'Borrador'}
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
            template?.es_principal 
              ? 'bg-blis-red/20 text-blis-red border border-blis-red/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            <Star className="w-3 h-3" />
            {template?.es_principal ? 'Principal' : 'No es Principal'}
          </div>
        </div>
        {!template?.es_principal && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-xs font-medium mb-2">⚠️ Este template NO es el principal</p>
            <p className="text-gray-400 text-xs mb-3">Los cambios que hagas aquí NO se verán en la landing page pública. Solo el template marcado como "Principal" se muestra en el sitio.</p>
            <button 
              onClick={async () => {
                if (!template) return;
                try {
                  const res = await fetch(`/api/templates/${template.id}/principal`, { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    setTemplate(prev => prev ? { ...prev, es_principal: true } : prev);
                    showToast('Template establecido como Principal. Ahora los cambios se verán en la landing.', 'success');
                  } else {
                    showToast(data.error || 'Error al establecer como principal', 'error');
                  }
                } catch {
                  showToast('Error al establecer como principal', 'error');
                }
              }}
              className="px-4 py-2 bg-blis-red text-white text-xs font-bold rounded-lg hover:bg-blis-red/80 transition-colors"
            >
              🌟 Establecer como Principal
            </button>
          </div>
        )}
        {template?.es_principal && (
          <p className="mt-3 text-emerald-400 text-xs">✓ Los cambios que hagas aquí se verán en la landing page pública.</p>
        )}
      </SectionCard>

      <SectionCard title="Configuración General">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Marca / Branding</h4>
          
          <InputField 
            label="Nombre de la Marca" 
            value={templateConfig?.branding?.name || ''} 
            onChange={(v) => setTemplateConfig(prev => ({
              ...prev,
              branding: { ...prev?.branding, name: v }
            }))} 
            placeholder="BLIS Corp" 
          />
          
          <h5 className="text-xs font-medium text-gray-500 mt-4 mb-2">Logos</h5>
          <p className="text-[10px] text-gray-600 mb-3">Sube los logos para diferentes fondos y orientaciones</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-2 block">Logo Horizontal (Fondo Oscuro)</label>
              <ImageUpload 
                value={templateConfig?.branding?.logoHorizontal || ''} 
                onChange={(v) => setTemplateConfig(prev => ({
                  ...prev,
                  branding: { ...prev?.branding, logoHorizontal: v }
                }))} 
                folder="cms/branding" 
              />
              <p className="text-[9px] text-gray-600 mt-1">Para header y fondo negro</p>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-2 block">Logo Horizontal Claro</label>
              <ImageUpload 
                value={templateConfig?.branding?.logoHorizontalLight || ''} 
                onChange={(v) => setTemplateConfig(prev => ({
                  ...prev,
                  branding: { ...prev?.branding, logoHorizontalLight: v }
                }))} 
                folder="cms/branding" 
              />
              <p className="text-[9px] text-gray-600 mt-1">Para footer y fondo claro</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-2 block">Logo Vertical (Fondo Oscuro)</label>
              <ImageUpload 
                value={templateConfig?.branding?.logoVertical || ''} 
                onChange={(v) => setTemplateConfig(prev => ({
                  ...prev,
                  branding: { ...prev?.branding, logoVertical: v }
                }))} 
                folder="cms/branding" 
              />
              <p className="text-[9px] text-gray-600 mt-1">Para menú móvil y modal</p>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-2 block">Logo Vertical Claro</label>
              <ImageUpload 
                value={templateConfig?.branding?.logoVerticalLight || ''} 
                onChange={(v) => setTemplateConfig(prev => ({
                  ...prev,
                  branding: { ...prev?.branding, logoVerticalLight: v }
                }))} 
                folder="cms/branding" 
              />
              <p className="text-[9px] text-gray-600 mt-1">Para fondos claros</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
            <ColorPicker 
              label="Color Primario" 
              value={templateConfig?.branding?.primaryColor || '#B10D24'} 
              onChange={(v) => setTemplateConfig(prev => ({
                ...prev,
                branding: { ...prev?.branding, primaryColor: v }
              }))} 
            />
            <ColorPicker 
              label="Color Secundario" 
              value={templateConfig?.branding?.secondaryColor || '#10B981'} 
              onChange={(v) => setTemplateConfig(prev => ({
                ...prev,
                branding: { ...prev?.branding, secondaryColor: v }
              }))} 
            />
            <ColorPicker 
              label="Color de Fondo" 
              value={templateConfig?.branding?.backgroundColor || '#000000'} 
              onChange={(v) => setTemplateConfig(prev => ({
                ...prev,
                branding: { ...prev?.branding, backgroundColor: v }
              }))} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker 
              label="Color de Texto" 
              value={templateConfig?.branding?.textColor || '#ffffff'} 
              onChange={(v) => setTemplateConfig(prev => ({
                ...prev,
                branding: { ...prev?.branding, textColor: v }
              }))} 
            />
            <ColorPicker 
              label="Color de Acento" 
              value={templateConfig?.branding?.accentColor || '#B10D24'} 
              onChange={(v) => setTemplateConfig(prev => ({
                ...prev,
                branding: { ...prev?.branding, accentColor: v }
              }))} 
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Header / Navegación">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={templateConfig?.showHeader !== false} 
                onChange={(e) => setTemplateConfig(prev => ({
                  ...prev,
                  showHeader: e.target.checked
                }))} 
                className="w-4 h-4" 
              />
              <span className="text-sm text-white">Mostrar Header</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={templateConfig?.customHeader?.enabled === true} 
                onChange={(e) => setTemplateConfig(prev => ({
                  ...prev,
                  customHeader: { ...prev?.customHeader, enabled: e.target.checked }
                }))} 
                className="w-4 h-4" 
              />
              <span className="text-sm text-white">Usar Header Personalizado</span>
            </label>
          </div>
          
          {templateConfig?.customHeader?.enabled && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <ImageUpload 
                value={templateConfig?.customHeader?.logo || ''} 
                onChange={(v) => setTemplateConfig(prev => ({
                  ...prev,
                  customHeader: { ...prev?.customHeader, logo: v }
                }))} 
                folder="cms/branding" 
              />
              
              <InputField 
                label="Link del Logo" 
                value={templateConfig?.customHeader?.logoLink || ''} 
                onChange={(v) => setTemplateConfig(prev => ({
                  ...prev,
                  customHeader: { ...prev?.customHeader, logoLink: v }
                }))} 
                placeholder="/" 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker 
                  label="Color de Fondo" 
                  value={templateConfig?.customHeader?.backgroundColor || '#000000'} 
                  onChange={(v) => setTemplateConfig(prev => ({
                    ...prev,
                    customHeader: { ...prev?.customHeader, backgroundColor: v }
                  }))} 
                />
                <ColorPicker 
                  label="Color de Texto" 
                  value={templateConfig?.customHeader?.textColor || '#ffffff'} 
                  onChange={(v) => setTemplateConfig(prev => ({
                    ...prev,
                    customHeader: { ...prev?.customHeader, textColor: v }
                  }))} 
                />
              </div>
              
              <h4 className="text-xs font-bold text-gray-400 uppercase mt-4 mb-3">Enlaces de Navegación</h4>
              {(templateConfig?.customHeader?.links || []).map((link, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
                  <InputField 
                    label="Texto" 
                    value={link.text} 
                    onChange={(v) => {
                      const newLinks = [...(templateConfig?.customHeader?.links || [])];
                      newLinks[idx] = { ...newLinks[idx], text: v };
                      setTemplateConfig(prev => ({
                        ...prev,
                        customHeader: { ...prev?.customHeader, links: newLinks }
                      }));
                    }} 
                  />
                  <InputField 
                    label="URL" 
                    value={link.href} 
                    onChange={(v) => {
                      const newLinks = [...(templateConfig?.customHeader?.links || [])];
                      newLinks[idx] = { ...newLinks[idx], href: v };
                      setTemplateConfig(prev => ({
                        ...prev,
                        customHeader: { ...prev?.customHeader, links: newLinks }
                      }));
                    }} 
                  />
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-1 mb-2">
                      <input 
                        type="checkbox" 
                        checked={link.external || false} 
                        onChange={(e) => {
                          const newLinks = [...(templateConfig?.customHeader?.links || [])];
                          newLinks[idx] = { ...newLinks[idx], external: e.target.checked };
                          setTemplateConfig(prev => ({
                            ...prev,
                            customHeader: { ...prev?.customHeader, links: newLinks }
                          }));
                        }} 
                        className="w-3 h-3" 
                      />
                      <span className="text-xs text-gray-400">Ext.</span>
                    </label>
                    <button 
                      onClick={() => {
                        const newLinks = [...(templateConfig?.customHeader?.links || [])];
                        newLinks.splice(idx, 1);
                        setTemplateConfig(prev => ({
                          ...prev,
                          customHeader: { ...prev?.customHeader, links: newLinks }
                        }));
                      }} 
                      className="text-red-400 hover:text-red-300 mb-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newLinks = [...(templateConfig?.customHeader?.links || []), { text: '', href: '' }];
                  setTemplateConfig(prev => ({
                    ...prev,
                    customHeader: { ...prev?.customHeader, links: newLinks }
                  }));
                }} 
                className="w-full py-2 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white text-xs"
              >
                + Agregar Enlace
              </button>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 mt-4">
                <InputField 
                  label="Texto CTA" 
                  value={templateConfig?.customHeader?.cta?.text || ''} 
                  onChange={(v) => setTemplateConfig(prev => ({
                    ...prev,
                    customHeader: { ...prev?.customHeader, cta: { ...prev?.customHeader?.cta, text: v } as any }
                  }))} 
                  placeholder="Contacto" 
                />
                <InputField 
                  label="URL CTA" 
                  value={templateConfig?.customHeader?.cta?.href || ''} 
                  onChange={(v) => setTemplateConfig(prev => ({
                    ...prev,
                    customHeader: { ...prev?.customHeader, cta: { ...prev?.customHeader?.cta, href: v } as any }
                  }))} 
                  placeholder="/contacto" 
                />
                <div>
                  <label className="text-[10px] text-gray-400 uppercase mb-1 block">Estilo</label>
                  <SearchableSelect
                    value={templateConfig?.customHeader?.cta?.style || 'primary'}
                    onChange={(v) => setTemplateConfig(prev => ({
                      ...prev,
                      customHeader: { ...prev?.customHeader, cta: { ...prev?.customHeader?.cta, style: v as 'primary' | 'secondary' } as any }
                    }))}
                    options={[
                      { value: 'primary', label: 'Primario' },
                      { value: 'secondary', label: 'Secundario' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Footer">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={templateConfig?.showFooter !== false} 
                onChange={(e) => setTemplateConfig(prev => ({
                  ...prev,
                  showFooter: e.target.checked
                }))} 
                className="w-4 h-4" 
              />
              <span className="text-sm text-white">Mostrar Footer</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={templateConfig?.customFooter?.enabled === true} 
                onChange={(e) => setTemplateConfig(prev => ({
                  ...prev,
                  customFooter: { ...prev?.customFooter, enabled: e.target.checked }
                }))} 
                className="w-4 h-4" 
              />
              <span className="text-sm text-white">Usar Footer Personalizado</span>
            </label>
          </div>
          
          {templateConfig?.customFooter?.enabled && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <ImageUpload 
                value={templateConfig?.customFooter?.logo || ''} 
                onChange={(v) => setTemplateConfig(prev => ({
                  ...prev,
                  customFooter: { ...prev?.customFooter, logo: v }
                }))} 
                folder="cms/branding" 
              />
              
              <TextAreaField 
                label="Descripción" 
                value={templateConfig?.customFooter?.description || ''} 
                onChange={(v) => setTemplateConfig(prev => ({
                  ...prev,
                  customFooter: { ...prev?.customFooter, description: v }
                }))} 
                rows={2} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker 
                  label="Color de Fondo" 
                  value={templateConfig?.customFooter?.backgroundColor || '#000000'} 
                  onChange={(v) => setTemplateConfig(prev => ({
                    ...prev,
                    customFooter: { ...prev?.customFooter, backgroundColor: v }
                  }))} 
                />
                <ColorPicker 
                  label="Color de Texto" 
                  value={templateConfig?.customFooter?.textColor || '#ffffff'} 
                  onChange={(v) => setTemplateConfig(prev => ({
                    ...prev,
                    customFooter: { ...prev?.customFooter, textColor: v }
                  }))} 
                />
              </div>
              
              <InputField 
                label="Copyright" 
                value={templateConfig?.customFooter?.copyright || ''} 
                onChange={(v) => setTemplateConfig(prev => ({
                  ...prev,
                  customFooter: { ...prev?.customFooter, copyright: v }
                }))} 
                placeholder="© 2026 Mi Marca. Todos los derechos reservados." 
              />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}


