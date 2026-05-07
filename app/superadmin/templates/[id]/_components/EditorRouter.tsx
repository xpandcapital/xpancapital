"use client";

import { Plus, Trash2 } from "lucide-react";
import { ICON_OPTIONS, ICON_OPTIONS_SPANISH } from "../_types";
import { InputField, TextAreaField, LinkField, ColorPicker, SectionCard, VisibilityToggle } from "./ui";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { MapEditor } from "@/components/editor/MapEditor";
import { CaptureHeroEditor } from "./editors/CaptureHeroEditor";

interface EditorRouterProps {
  activeSection: string;
  sections: Record<string, any>;
  updateSection: (section: string, data: any) => void;
  updateArrayItem: (section: string, arrayKey: string, index: number, data: any) => void;
  addArrayItem: (section: string, arrayKey: string, defaultItem: any) => void;
  removeArrayItem: (section: string, arrayKey: string, index: number) => void;
  toggleSectionVisibility: (key: string) => void;
  isSectionVisible: (key: string) => boolean;
  projects: Array<{ id: string; name: string; primary_color?: string; status?: string }>;
  campanas: any[];
  loadingCampanas: boolean;
  asesores: any[];
  loadingAsesores: boolean;
}

export function EditorRouter({
  activeSection,
  sections,
  updateSection,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  toggleSectionVisibility,
  isSectionVisible,
  projects,
  campanas,
  loadingCampanas,
  asesores,
  loadingAsesores,
}: EditorRouterProps) {
  return (
    <div className="space-y-6">
      {/* THANkyou SECTIONS */}
      {activeSection === 'thankYouHero' && (
        <SectionCard title="Hero de Gracias">
          <VisibilityToggle section="thankYouHero" isVisible={isSectionVisible('thankYouHero')} onToggle={() => toggleSectionVisibility('thankYouHero')} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Título 1" value={sections.thankYouHero?.title1 || ''} onChange={(v) => updateSection('thankYouHero', { title1: v })} placeholder="¡Gracias!" />
            <InputField label="Título 2" value={sections.thankYouHero?.title2 || ''} onChange={(v) => updateSection('thankYouHero', { title2: v })} placeholder="Tu operación fue exitosa" />
          </div>
          <TextAreaField label="Subtítulo" value={sections.thankYouHero?.subtitle || ''} onChange={(v) => updateSection('thankYouHero', { subtitle: v })} rows={1} placeholder="Tu operación ha sido procesada correctamente" />
          <TextAreaField label="Descripción" value={sections.thankYouHero?.description || ''} onChange={(v) => updateSection('thankYouHero', { description: v })} rows={2} placeholder="Descripción detallada..." />
          <ColorPicker label="Color de Acento" value={sections.thankYouHero?.accentColor || '#10B981'} onChange={(v) => updateSection('thankYouHero', { accentColor: v })} />
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto Botón Principal" value={sections.thankYouHero?.primaryBtnText || ''} onChange={(v) => updateSection('thankYouHero', { primaryBtnText: v })} placeholder="Ir al Dashboard" />
            <LinkField label="Enlace Botón Principal" value={sections.thankYouHero?.primaryBtnLink || ''} onChange={(v) => updateSection('thankYouHero', { primaryBtnLink: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Texto Botón Secundario" value={sections.thankYouHero?.secondaryBtnText || ''} onChange={(v) => updateSection('thankYouHero', { secondaryBtnText: v })} placeholder="Ver Mis Compras" />
            <LinkField label="Enlace Botón Secundario" value={sections.thankYouHero?.secondaryBtnLink || ''} onChange={(v) => updateSection('thankYouHero', { secondaryBtnLink: v })} />
          </div>
        </SectionCard>
      )}

      {activeSection === 'thankYouNextSteps' && (
        <SectionCard title="Próximos Pasos">
          <VisibilityToggle section="thankYouNextSteps" isVisible={isSectionVisible('thankYouNextSteps')} onToggle={() => toggleSectionVisibility('thankYouNextSteps')} />
          <InputField label="Título" value={sections.thankYouNextSteps?.title || ''} onChange={(v) => updateSection('thankYouNextSteps', { title: v })} placeholder="¿Qué sigue?" />
          <InputField label="Subtítulo" value={sections.thankYouNextSteps?.subtitle || ''} onChange={(v) => updateSection('thankYouNextSteps', { subtitle: v })} placeholder="Próximos Pasos" />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Pasos</h4>
          <div className="space-y-3">
            {(sections.thankYouNextSteps?.steps || []).map((step: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Paso {idx + 1}</span>
                  <button onClick={() => removeArrayItem('thankYouNextSteps', 'steps', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase mb-1 block">Ícono</label>
                    <select value={step.icon || 'Mail'} onChange={(e) => updateArrayItem('thankYouNextSteps', 'steps', idx, { icon: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-white">
                      {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{ICON_OPTIONS_SPANISH[icon]}</option>)}
                    </select>
                  </div>
                  <InputField label="Título" value={step.title || ''} onChange={(v) => updateArrayItem('thankYouNextSteps', 'steps', idx, { title: v })} />
                </div>
                <InputField label="Descripción" value={step.description || ''} onChange={(v) => updateArrayItem('thankYouNextSteps', 'steps', idx, { description: v })} />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <InputField label="Texto Acción" value={step.action || ''} onChange={(v) => updateArrayItem('thankYouNextSteps', 'steps', idx, { action: v })} placeholder="Opcional" />
                  <LinkField label="Enlace" value={step.link || ''} onChange={(v) => updateArrayItem('thankYouNextSteps', 'steps', idx, { link: v })} />
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('thankYouNextSteps', 'steps', { icon: 'Mail', title: '', description: '', action: '', link: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Paso
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Información de Contacto</h4>
            <div className="grid grid-cols-3 gap-3">
              <InputField label="Teléfono" value={sections.thankYouNextSteps?.contactInfo?.phone || ''} onChange={(v) => updateSection('thankYouNextSteps', { contactInfo: { ...(sections.thankYouNextSteps?.contactInfo || {}), phone: v } })} />
              <InputField label="Email" value={sections.thankYouNextSteps?.contactInfo?.email || ''} onChange={(v) => updateSection('thankYouNextSteps', { contactInfo: { ...(sections.thankYouNextSteps?.contactInfo || {}), email: v } })} />
              <InputField label="WhatsApp" value={sections.thankYouNextSteps?.contactInfo?.whatsapp || ''} onChange={(v) => updateSection('thankYouNextSteps', { contactInfo: { ...(sections.thankYouNextSteps?.contactInfo || {}), whatsapp: v } })} />
            </div>
          </div>
        </SectionCard>
      )}

      {/* FUNNEL HERO */}
      {activeSection === 'funnelHero' && (
        <SectionCard title="Hero Principal">
          <VisibilityToggle section="funnelHero" isVisible={isSectionVisible('funnelHero')} onToggle={() => toggleSectionVisibility('funnelHero')} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Título 1" value={sections.funnelHero?.title1 || ''} onChange={(v) => updateSection('funnelHero', { title1: v })} placeholder="Transforma tu" />
            <InputField label="Título 2" value={sections.funnelHero?.title2 || ''} onChange={(v) => updateSection('funnelHero', { title2: v })} placeholder="Patrimonio" />
          </div>
          <TextAreaField label="Subtítulo" value={sections.funnelHero?.subtitle || ''} onChange={(v) => updateSection('funnelHero', { subtitle: v })} rows={1} />
          <TextAreaField label="Descripción" value={sections.funnelHero?.description || ''} onChange={(v) => updateSection('funnelHero', { description: v })} rows={2} />
          <ColorPicker label="Color de Acento" value={sections.funnelHero?.accentColor || '#B10D24'} onChange={(v) => updateSection('funnelHero', { accentColor: v })} />
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="URL Video (Embed)" value={sections.funnelHero?.videoUrl || ''} onChange={(v) => updateSection('funnelHero', { videoUrl: v })} placeholder="https://youtube.com/embed/..." />
            <ImageUpload value={sections.funnelHero?.backgroundImage || ''} onChange={(v) => updateSection('funnelHero', { backgroundImage: v })} folder="cms/funnel" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto Botón" value={sections.funnelHero?.primaryBtnText || ''} onChange={(v) => updateSection('funnelHero', { primaryBtnText: v })} placeholder="Quiero Participar" />
            <LinkField label="Enlace Botón" value={sections.funnelHero?.primaryBtnLink || ''} onChange={(v) => updateSection('funnelHero', { primaryBtnLink: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto de Urgencia" value={sections.funnelHero?.urgencyText || ''} onChange={(v) => updateSection('funnelHero', { urgencyText: v })} placeholder="Cupos Limitados" />
            <InputField label="Cantidad" value={sections.funnelHero?.urgencyCount?.toString() || ''} onChange={(v) => updateSection('funnelHero', { urgencyCount: parseInt(v) || 0 })} type="number" />
          </div>
        </SectionCard>
      )}

      {/* FUNNEL COUNTDOWN */}
      {activeSection === 'funnelCountdown' && (
        <SectionCard title="Contador de Urgencia">
          <VisibilityToggle section="funnelCountdown" isVisible={isSectionVisible('funnelCountdown')} onToggle={() => toggleSectionVisibility('funnelCountdown')} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Título" value={sections.funnelCountdown?.title || ''} onChange={(v) => updateSection('funnelCountdown', { title: v })} placeholder="Tiempo Restante" />
            <InputField label="Subtítulo" value={sections.funnelCountdown?.subtitle || ''} onChange={(v) => updateSection('funnelCountdown', { subtitle: v })} placeholder="Oferta Limitada" />
          </div>
          <TextAreaField label="Descripción" value={sections.funnelCountdown?.description || ''} onChange={(v) => updateSection('funnelCountdown', { description: v })} rows={2} />
          <InputField label="Fecha Fin (ISO)" value={sections.funnelCountdown?.endDate || ''} onChange={(v) => updateSection('funnelCountdown', { endDate: v })} placeholder="2026-12-31T23:59:59" />
          <InputField label="Mensaje Fin" value={sections.funnelCountdown?.endMessage || ''} onChange={(v) => updateSection('funnelCountdown', { endMessage: v })} placeholder="¡La oferta ha terminado!" />
          <InputField label="Mensaje Urgente" value={sections.funnelCountdown?.urgentMessage || ''} onChange={(v) => updateSection('funnelCountdown', { urgentMessage: v })} placeholder="¡Últimos lugares!" />
          <ColorPicker label="Color de Acento" value={sections.funnelCountdown?.accentColor || '#B10D24'} onChange={(v) => updateSection('funnelCountdown', { accentColor: v })} />
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/10">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.funnelCountdown?.showDays !== false} onChange={(e) => updateSection('funnelCountdown', { showDays: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Días</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.funnelCountdown?.showHours !== false} onChange={(e) => updateSection('funnelCountdown', { showHours: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Horas</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.funnelCountdown?.showMinutes !== false} onChange={(e) => updateSection('funnelCountdown', { showMinutes: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Minutos</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.funnelCountdown?.showSeconds !== false} onChange={(e) => updateSection('funnelCountdown', { showSeconds: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Segundos</span>
            </label>
          </div>
          <div className="mt-4">
            <label className="text-[10px] text-gray-400 uppercase mb-1 block">Layout</label>
            <select value={sections.funnelCountdown?.layout || 'card'} onChange={(e) => updateSection('funnelCountdown', { layout: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="card">Tarjeta</option>
              <option value="inline">En línea</option>
              <option value="banner">Banner</option>
            </select>
          </div>
        </SectionCard>
      )}

      {/* FUNNEL VIDEO */}
      {activeSection === 'funnelVideo' && (
        <SectionCard title="Video">
          <VisibilityToggle section="funnelVideo" isVisible={isSectionVisible('funnelVideo')} onToggle={() => toggleSectionVisibility('funnelVideo')} />
          <InputField label="Título" value={sections.funnelVideo?.title || ''} onChange={(v) => updateSection('funnelVideo', { title: v })} />
          <InputField label="Subtítulo" value={sections.funnelVideo?.subtitle || ''} onChange={(v) => updateSection('funnelVideo', { subtitle: v })} />
          <TextAreaField label="Descripción" value={sections.funnelVideo?.description || ''} onChange={(v) => updateSection('funnelVideo', { description: v })} rows={2} />
          <InputField label="URL Video (Embed)" value={sections.funnelVideo?.videoUrl || ''} onChange={(v) => updateSection('funnelVideo', { videoUrl: v })} placeholder="https://youtube.com/embed/..." />
          <ImageUpload value={sections.funnelVideo?.videoThumbnail || ''} onChange={(v) => updateSection('funnelVideo', { videoThumbnail: v })} folder="cms/funnel" />
          <ColorPicker label="Color de Acento" value={sections.funnelVideo?.accentColor || '#B10D24'} onChange={(v) => updateSection('funnelVideo', { accentColor: v })} />
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto Overlay" value={sections.funnelVideo?.overlayText || ''} onChange={(v) => updateSection('funnelVideo', { overlayText: v })} placeholder="Duración: 5 min" />
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-1 block">Layout</label>
              <select value={sections.funnelVideo?.layout || 'boxed'} onChange={(e) => updateSection('funnelVideo', { layout: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                <option value="boxed">Caja</option>
                <option value="split">Dividido</option>
                <option value="full">Pantalla Completa</option>
              </select>
            </div>
          </div>
        </SectionCard>
      )}

      {/* FUNNEL BENEFITS */}
      {activeSection === 'funnelBenefits' && (
        <SectionCard title="Beneficios">
          <VisibilityToggle section="funnelBenefits" isVisible={isSectionVisible('funnelBenefits')} onToggle={() => toggleSectionVisibility('funnelBenefits')} />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputField label="Título" value={sections.funnelBenefits?.title || ''} onChange={(v) => updateSection('funnelBenefits', { title: v })} />
            <InputField label="Subtítulo" value={sections.funnelBenefits?.subtitle || ''} onChange={(v) => updateSection('funnelBenefits', { subtitle: v })} />
          </div>
          <ColorPicker label="Color de Acento" value={sections.funnelBenefits?.accentColor || '#B10D24'} onChange={(v) => updateSection('funnelBenefits', { accentColor: v })} />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Beneficios ({(sections.funnelBenefits?.benefits || []).length})</h4>
          <div className="space-y-3">
            {(sections.funnelBenefits?.benefits || []).map((benefit: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Beneficio {idx + 1}</span>
                  <button onClick={() => removeArrayItem('funnelBenefits', 'benefits', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase mb-1 block">Ícono</label>
                    <select value={benefit.icon || 'TrendingUp'} onChange={(e) => updateArrayItem('funnelBenefits', 'benefits', idx, { icon: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-white">
                      {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{ICON_OPTIONS_SPANISH[icon]}</option>)}
                    </select>
                  </div>
                  <InputField label="Título" value={benefit.title || ''} onChange={(v) => updateArrayItem('funnelBenefits', 'benefits', idx, { title: v })} />
                </div>
                <TextAreaField label="Descripción" value={benefit.description || ''} onChange={(v) => updateArrayItem('funnelBenefits', 'benefits', idx, { description: v })} rows={1} />
              </div>
            ))}
            <button onClick={() => addArrayItem('funnelBenefits', 'benefits', { icon: 'TrendingUp', title: '', description: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Beneficio
            </button>
          </div>
          <div className="mt-4">
            <label className="text-[10px] text-gray-400 uppercase mb-1 block">Layout</label>
            <select value={sections.funnelBenefits?.layout || 'grid'} onChange={(e) => updateSection('funnelBenefits', { layout: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="grid">Grilla</option>
              <option value="list">Lista</option>
            </select>
          </div>
        </SectionCard>
      )}

      {/* STATS */}
      {activeSection === 'stats' && (
        <SectionCard title="Estadísticas">
          <VisibilityToggle section="stats" isVisible={isSectionVisible('stats')} onToggle={() => toggleSectionVisibility('stats')} />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputField label="Título" value={sections.stats?.title || ''} onChange={(v) => updateSection('stats', { title: v })} placeholder="Nuestra Trayectoria" />
            <InputField label="Subtítulo" value={sections.stats?.subtitle || ''} onChange={(v) => updateSection('stats', { subtitle: v })} placeholder="En Números" />
          </div>
          <TextAreaField label="Descripción" value={sections.stats?.description || ''} onChange={(v) => updateSection('stats', { description: v })} rows={1} />
          <ColorPicker label="Color de Acento" value={sections.stats?.accentColor || '#B10D24'} onChange={(v) => updateSection('stats', { accentColor: v })} />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Estadísticas ({(sections.stats?.stats || []).length})</h4>
          <div className="space-y-3">
            {(sections.stats?.stats || []).map((stat: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Stat {idx + 1}</span>
                  <button onClick={() => removeArrayItem('stats', 'stats', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <InputField label="Valor" value={stat.value?.toString() || ''} onChange={(v) => updateArrayItem('stats', 'stats', idx, { value: parseFloat(v) || 0 })} type="number" />
                  <InputField label="Prefijo" value={stat.prefix || ''} onChange={(v) => updateArrayItem('stats', 'stats', idx, { prefix: v })} placeholder="$" />
                  <InputField label="Sufijo" value={stat.suffix || ''} onChange={(v) => updateArrayItem('stats', 'stats', idx, { suffix: v })} placeholder="+" />
                  <InputField label="Label" value={stat.label || ''} onChange={(v) => updateArrayItem('stats', 'stats', idx, { label: v })} />
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase mb-1 block">Ícono</label>
                    <select value={stat.icon || 'Building2'} onChange={(e) => updateArrayItem('stats', 'stats', idx, { icon: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-white">
                      {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{ICON_OPTIONS_SPANISH[icon]}</option>)}
                    </select>
                  </div>
                </div>
                <TextAreaField label="Descripción" value={stat.description || ''} onChange={(v) => updateArrayItem('stats', 'stats', idx, { description: v })} rows={1} />
              </div>
            ))}
            <button onClick={() => addArrayItem('stats', 'stats', { value: 0, prefix: '', suffix: '', label: '', icon: 'Building2', description: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Stat
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.stats?.animated !== false} onChange={(e) => updateSection('stats', { animated: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Animado</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.stats?.showIcons !== false} onChange={(e) => updateSection('stats', { showIcons: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Mostrar Íconos</span>
            </label>
          </div>
          <div className="mt-4">
            <label className="text-[10px] text-gray-400 uppercase mb-1 block">Layout</label>
            <select value={sections.stats?.layout || 'grid'} onChange={(e) => updateSection('stats', { layout: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="grid">Grilla</option>
              <option value="horizontal">Horizontal</option>
              <option value="featured">Destacado</option>
            </select>
          </div>
        </SectionCard>
      )}

      {/* FUNNEL TESTIMONIALS */}
      {activeSection === 'funnelTestimonials' && (
        <SectionCard title="Testimonios">
          <VisibilityToggle section="funnelTestimonials" isVisible={isSectionVisible('funnelTestimonials')} onToggle={() => toggleSectionVisibility('funnelTestimonials')} />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputField label="Título" value={sections.funnelTestimonials?.title || ''} onChange={(v) => updateSection('funnelTestimonials', { title: v })} />
            <InputField label="Subtítulo" value={sections.funnelTestimonials?.subtitle || ''} onChange={(v) => updateSection('funnelTestimonials', { subtitle: v })} />
          </div>
          <ColorPicker label="Color de Acento" value={sections.funnelTestimonials?.accentColor || '#B10D24'} onChange={(v) => updateSection('funnelTestimonials', { accentColor: v })} />
          
          <div className="mt-4">
            <label className="text-[10px] text-gray-400 uppercase mb-1 block">Layout</label>
            <select value={sections.funnelTestimonials?.layout || 'carousel'} onChange={(e) => updateSection('funnelTestimonials', { layout: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="carousel">Carrusel</option>
              <option value="grid">Grilla</option>
              <option value="featured">Destacado</option>
            </select>
          </div>
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Testimonios ({(sections.funnelTestimonials?.testimonials || []).length})</h4>
          <div className="space-y-3">
            {(sections.funnelTestimonials?.testimonials || []).map((testimonial: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Testimonio {idx + 1}</span>
                  <button onClick={() => removeArrayItem('funnelTestimonials', 'testimonials', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <TextAreaField label="Cita" value={testimonial.quote || ''} onChange={(v) => updateArrayItem('funnelTestimonials', 'testimonials', idx, { quote: v })} rows={2} />
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <InputField label="Autor" value={testimonial.author || ''} onChange={(v) => updateArrayItem('funnelTestimonials', 'testimonials', idx, { author: v })} />
                  <InputField label="Rol" value={testimonial.role || ''} onChange={(v) => updateArrayItem('funnelTestimonials', 'testimonials', idx, { role: v })} />
                  <ImageUpload value={testimonial.image || ''} onChange={(v) => updateArrayItem('funnelTestimonials', 'testimonials', idx, { image: v })} folder="cms/testimonials" />
                </div>
                <div className="mt-2">
                  <label className="text-[10px] text-gray-400 uppercase mb-1 block">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={testimonial.rating || 5} onChange={(e) => updateArrayItem('funnelTestimonials', 'testimonials', idx, { rating: parseInt(e.target.value) || 5 })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('funnelTestimonials', 'testimonials', { quote: '', author: '', role: '', image: '', rating: 5 })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Testimonio
            </button>
          </div>
        </SectionCard>
      )}

      {/* FUNNEL PRICING */}
      {activeSection === 'funnelPricing' && (
        <SectionCard title="Tabla de Precios">
          <VisibilityToggle section="funnelPricing" isVisible={isSectionVisible('funnelPricing')} onToggle={() => toggleSectionVisibility('funnelPricing')} />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputField label="Título" value={sections.funnelPricing?.title || ''} onChange={(v) => updateSection('funnelPricing', { title: v })} />
            <InputField label="Subtítulo" value={sections.funnelPricing?.subtitle || ''} onChange={(v) => updateSection('funnelPricing', { subtitle: v })} />
          </div>
          <TextAreaField label="Descripción" value={sections.funnelPricing?.description || ''} onChange={(v) => updateSection('funnelPricing', { description: v })} rows={1} />
          <ColorPicker label="Color de Acento" value={sections.funnelPricing?.accentColor || '#B10D24'} onChange={(v) => updateSection('funnelPricing', { accentColor: v })} />
          <div className="mt-4">
            <label className="text-[10px] text-gray-400 uppercase mb-1 block">Layout</label>
            <select value={sections.funnelPricing?.layout || 'cards'} onChange={(e) => updateSection('funnelPricing', { layout: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="cards">Tarjetas</option>
              <option value="table">Tabla</option>
            </select>
          </div>
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Planes ({(sections.funnelPricing?.tiers || []).length})</h4>
          <div className="space-y-4">
            {(sections.funnelPricing?.tiers || []).map((tier: any, idx: number) => (
              <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-sm">{tier.name || `Plan ${idx + 1}`}</span>
                  <button onClick={() => removeArrayItem('funnelPricing', 'tiers', idx)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <InputField label="Nombre" value={tier.name || ''} onChange={(v) => updateArrayItem('funnelPricing', 'tiers', idx, { name: v })} />
                  <InputField label="Precio" value={tier.price || ''} onChange={(v) => updateArrayItem('funnelPricing', 'tiers', idx, { price: v })} placeholder="$25,000" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <InputField label="Nota del Precio" value={tier.priceNote || ''} onChange={(v) => updateArrayItem('funnelPricing', 'tiers', idx, { priceNote: v })} placeholder="desde" />
                  <InputField label="Descripción" value={tier.description || ''} onChange={(v) => updateArrayItem('funnelPricing', 'tiers', idx, { description: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <InputField label="Texto Botón" value={tier.buttonText || ''} onChange={(v) => updateArrayItem('funnelPricing', 'tiers', idx, { buttonText: v })} />
                  <LinkField label="Enlace Botón" value={tier.buttonLink || ''} onChange={(v) => updateArrayItem('funnelPricing', 'tiers', idx, { buttonLink: v })} />
                </div>
                <div className="mb-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={tier.highlighted || false} onChange={(e) => updateArrayItem('funnelPricing', 'tiers', idx, { highlighted: e.target.checked })} className="w-4 h-4" />
                    <span className="text-sm text-white">Destacado (Más Popular)</span>
                  </label>
                </div>
                <div>
                  <h5 className="text-[10px] text-gray-400 uppercase mb-2">Características</h5>
                  <div className="space-y-2">
                    {(tier.features || []).map((feature: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <input type="text" value={feature} onChange={(e) => {
                          const newFeatures = [...(tier.features || [])];
                          newFeatures[fIdx] = e.target.value;
                          updateArrayItem('funnelPricing', 'tiers', idx, { features: newFeatures });
                        }} className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-white" />
                        <button onClick={() => {
                          const newFeatures = [...(tier.features || [])];
                          newFeatures.splice(fIdx, 1);
                          updateArrayItem('funnelPricing', 'tiers', idx, { features: newFeatures });
                        }} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const newFeatures = [...(tier.features || []), ''];
                      updateArrayItem('funnelPricing', 'tiers', idx, { features: newFeatures });
                    }} className="w-full py-1 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white text-xs">
                      + Agregar Característica
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('funnelPricing', 'tiers', { name: '', price: '', priceNote: '', description: '', features: [], buttonText: '', buttonLink: '', highlighted: false })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Plan
            </button>
          </div>
        </SectionCard>
      )}

      {/* FUNNEL CTA */}
      {activeSection === 'funnelCTA' && (
        <SectionCard title="CTA Final">
          <VisibilityToggle section="funnelCTA" isVisible={isSectionVisible('funnelCTA')} onToggle={() => toggleSectionVisibility('funnelCTA')} />
          <InputField label="Título" value={sections.funnelCTA?.title || ''} onChange={(v) => updateSection('funnelCTA', { title: v })} placeholder="¿Listo para multiplicar tu patrimonio?" />
          <InputField label="Subtítulo" value={sections.funnelCTA?.subtitle || ''} onChange={(v) => updateSection('funnelCTA', { subtitle: v })} placeholder="Acción Inmediata" />
          <TextAreaField label="Descripción" value={sections.funnelCTA?.description || ''} onChange={(v) => updateSection('funnelCTA', { description: v })} rows={2} />
          <ColorPicker label="Color de Acento" value={sections.funnelCTA?.accentColor || '#B10D24'} onChange={(v) => updateSection('funnelCTA', { accentColor: v })} />
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto Botón Principal" value={sections.funnelCTA?.primaryBtnText || ''} onChange={(v) => updateSection('funnelCTA', { primaryBtnText: v })} placeholder="Inscribirme Ahora" />
            <LinkField label="Enlace Botón Principal" value={sections.funnelCTA?.primaryBtnLink || ''} onChange={(v) => updateSection('funnelCTA', { primaryBtnLink: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto Botón Secundario" value={sections.funnelCTA?.secondaryBtnText || ''} onChange={(v) => updateSection('funnelCTA', { secondaryBtnText: v })} placeholder="Ver Proyectos" />
            <LinkField label="Enlace Botón Secundario" value={sections.funnelCTA?.secondaryBtnLink || ''} onChange={(v) => updateSection('funnelCTA', { secondaryBtnLink: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Mensaje de Urgencia" value={sections.funnelCTA?.urgencyText || ''} onChange={(v) => updateSection('funnelCTA', { urgencyText: v })} placeholder="Solo quedan 12 lugares" />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.funnelCTA?.showUrgency !== false} onChange={(e) => updateSection('funnelCTA', { showUrgency: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Mostrar urgencia</span>
            </label>
          </div>
        </SectionCard>
      )}

      {/* CAPTURE HERO */}
      {activeSection === 'captureHero' && (
        <CaptureHeroEditor
          sections={sections}
          campanas={campanas}
          loadingCampanas={loadingCampanas}
          asesores={asesores}
          loadingAsesores={loadingAsesores}
          updateSection={updateSection}
          toggleSectionVisibility={toggleSectionVisibility}
          isSectionVisible={isSectionVisible}
        />
      )}

      {/* CONTENT SECTION */}
      {activeSection === 'content' && (
        <SectionCard title="Sección de Contenido">
          <VisibilityToggle section="content" isVisible={isSectionVisible('content')} onToggle={() => toggleSectionVisibility('content')} />
          <InputField label="Título" value={sections.content?.title || ''} onChange={(v) => updateSection('content', { title: v })} />
          <InputField label="Subtítulo" value={sections.content?.subtitle || ''} onChange={(v) => updateSection('content', { subtitle: v })} />
          <TextAreaField label="Descripción" value={sections.content?.description || ''} onChange={(v) => updateSection('content', { description: v })} rows={2} />
          <ColorPicker label="Color de Acento" value={sections.content?.accentColor || '#B10D24'} onChange={(v) => updateSection('content', { accentColor: v })} />
          <ImageUpload value={sections.content?.image || ''} onChange={(v) => updateSection('content', { image: v })} folder="cms/content" />
          <div className="mt-4">
            <label className="text-[10px] text-gray-400 uppercase mb-1 block">Posición de Imagen</label>
            <select value={sections.content?.imagePosition || 'right'} onChange={(e) => updateSection('content', { imagePosition: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
              <option value="left">Izquierda</option>
              <option value="right">Derecha</option>
              <option value="top">Arriba</option>
              <option value="bottom">Abajo</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto Botón Principal" value={sections.content?.ctaText || ''} onChange={(v) => updateSection('content', { ctaText: v })} />
            <LinkField label="Enlace Botón Principal" value={sections.content?.ctaLink || ''} onChange={(v) => updateSection('content', { ctaLink: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto Botón Secundario" value={sections.content?.secondaryCtaText || ''} onChange={(v) => updateSection('content', { secondaryCtaText: v })} />
            <LinkField label="Enlace Botón Secundario" value={sections.content?.secondaryCtaLink || ''} onChange={(v) => updateSection('content', { secondaryCtaLink: v })} />
          </div>
        </SectionCard>
      )}

      {/* BLOG SECTIONS */}
      {activeSection === 'blogHero' && (
        <SectionCard title="Hero de Blog">
          <VisibilityToggle section="blogHero" isVisible={isSectionVisible('blogHero')} onToggle={() => toggleSectionVisibility('blogHero')} />
          <InputField label="Título" value={sections.blogHero?.title || ''} onChange={(v) => updateSection('blogHero', { title: v })} placeholder="BlisBlog" />
          <InputField label="Subtítulo" value={sections.blogHero?.subtitle || ''} onChange={(v) => updateSection('blogHero', { subtitle: v })} placeholder="Noticias y Actualidad" />
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
            <InputField label="Máx. Artículos" value={sections.blogHero?.maxPosts?.toString() || '6'} onChange={(v) => updateSection('blogHero', { maxPosts: parseInt(v) || 6 })} type="number" />
            <InputField label="Intervalo (seg)" value={sections.blogHero?.intervalSeconds?.toString() || '5'} onChange={(v) => updateSection('blogHero', { intervalSeconds: parseInt(v) || 5 })} type="number" />
            <label className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={sections.blogHero?.autoRotate !== false} onChange={(e) => updateSection('blogHero', { autoRotate: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Rotación Automática</span>
            </label>
          </div>
          <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-gray-500">Los artículos destacados aparecerán automáticamente en el Slider del Hero según tus configuraciones de Blog.</p>
          </div>
        </SectionCard>
      )}

      {activeSection === 'blogPosts' && (
        <SectionCard title="Grilla de Artículos">
          <VisibilityToggle section="blogPosts" isVisible={isSectionVisible('blogPosts')} onToggle={() => toggleSectionVisibility('blogPosts')} />
          <InputField label="Título" value={sections.blogPosts?.title || ''} onChange={(v) => updateSection('blogPosts', { title: v })} placeholder="Artículos" />
          <InputField label="Descripción" value={sections.blogPosts?.description || ''} onChange={(v) => updateSection('blogPosts', { description: v })} />
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-1 block">Variante</label>
              <select value={sections.blogPosts?.variant || 'light'} onChange={(e) => updateSection('blogPosts', { variant: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                <option value="light">Claro (Estándar)</option>
                <option value="dark">Oscuro (Noche)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-1 block">Diseño</label>
              <select value={sections.blogPosts?.layout || 'grid'} onChange={(e) => updateSection('blogPosts', { layout: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                <option value="grid">Grilla Tradicional</option>
                <option value="slider">Autoplay Slider</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
            <InputField label="Máx. Artículos" value={sections.blogPosts?.maxPosts?.toString() || '9'} onChange={(v) => updateSection('blogPosts', { maxPosts: parseInt(v) || 9 })} type="number" />
            <label className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={sections.blogPosts?.showCategory !== false} onChange={(e) => updateSection('blogPosts', { showCategory: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Mostrar Categoría</span>
            </label>
            <label className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={sections.blogPosts?.showDate !== false} onChange={(e) => updateSection('blogPosts', { showDate: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Mostrar Fecha</span>
            </label>
          </div>
        </SectionCard>
      )}

      {/* TIENDA SECTIONS */}
      {activeSection === 'shopHero' && (
        <SectionCard title="Hero Carrusel Tienda">
          <VisibilityToggle section="shopHero" isVisible={isSectionVisible('shopHero')} onToggle={() => toggleSectionVisibility('shopHero')} />
          <p className="text-xs text-gray-400 mb-4">Configura los slides del carrusel principal de tu tienda.</p>
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Slides ({(sections.shopHero?.slides || []).length})</h4>
          <div className="space-y-3">
            {(sections.shopHero?.slides || []).map((slide: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Slide {idx + 1}</span>
                  <button onClick={() => removeArrayItem('shopHero', 'slides', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Título" value={slide.titulo || ''} onChange={(v) => updateArrayItem('shopHero', 'slides', idx, { titulo: v })} placeholder="Oferta Especial" />
                  <InputField label="Subtítulo" value={slide.subtitulo || ''} onChange={(v) => updateArrayItem('shopHero', 'slides', idx, { subtitulo: v })} placeholder="Descripción corta" />
                </div>
                <InputField label="Precio" value={slide.precio || ''} onChange={(v) => updateArrayItem('shopHero', 'slides', idx, { precio: v })} placeholder="$99.99" />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Tag / Badge" value={slide.tag || ''} onChange={(v) => updateArrayItem('shopHero', 'slides', idx, { tag: v })} placeholder="NUEVO" />
                  <InputField label="Enlace" value={slide.link || ''} onChange={(v) => updateArrayItem('shopHero', 'slides', idx, { link: v })} placeholder="/producto/ejemplo" />
                </div>
                <ImageUpload value={slide.imagen || ''} onChange={(v) => updateArrayItem('shopHero', 'slides', idx, { imagen: v })} folder="cms/tienda/hero" />
              </div>
            ))}
            <button onClick={() => addArrayItem('shopHero', 'slides', { titulo: '', subtitulo: '', precio: '', imagen: '', tag: '', link: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Slide
            </button>
          </div>
        </SectionCard>
      )}

      {activeSection === 'shopCategories' && (
        <SectionCard title="Deslizador de Categorías">
          <VisibilityToggle section="shopCategories" isVisible={isSectionVisible('shopCategories')} onToggle={() => toggleSectionVisibility('shopCategories')} />
          <InputField label="Título" value={sections.shopCategories?.title || ''} onChange={(v) => updateSection('shopCategories', { title: v })} placeholder="Categorías" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <InputField label="Máx. Categorías" value={sections.shopCategories?.maxCategories?.toString() || '10'} onChange={(v) => updateSection('shopCategories', { maxCategories: parseInt(v) || 10 })} type="number" />
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-1 block">Layout</label>
              <select value={sections.shopCategories?.layout || 'slider'} onChange={(e) => updateSection('shopCategories', { layout: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                <option value="grid">Grilla</option>
                <option value="slider">Slider</option>
              </select>
            </div>
            <label className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={sections.shopCategories?.showFilter !== false} onChange={(e) => updateSection('shopCategories', { showFilter: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Mostrar Filtro</span>
            </label>
          </div>
          <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-gray-500">Extrae y desliza automáticamente por tus categorías de productos activas.</p>
          </div>
        </SectionCard>
      )}

      {activeSection === 'shopSidebar' && (
        <SectionCard title="Sidebar / Filtros">
          <VisibilityToggle section="shopSidebar" isVisible={isSectionVisible('shopSidebar')} onToggle={() => toggleSectionVisibility('shopSidebar')} />
          <p className="text-xs text-gray-400 mb-4">Configura los filtros y opciones de la barra lateral de la tienda.</p>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.shopSidebar?.showPriceRange !== false} onChange={(e) => updateSection('shopSidebar', { showPriceRange: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Rango de Precio</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.shopSidebar?.showCategories !== false} onChange={(e) => updateSection('shopSidebar', { showCategories: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Categorías</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sections.shopSidebar?.showSearch !== false} onChange={(e) => updateSection('shopSidebar', { showSearch: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Búsqueda</span>
            </label>
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-1 block">Orden por Defecto</label>
              <select value={sections.shopSidebar?.defaultSort || 'recent'} onChange={(e) => updateSection('shopSidebar', { defaultSort: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                <option value="recent">Más Recientes</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="name_asc">Nombre: A-Z</option>
                <option value="popular">Más Populares</option>
              </select>
            </div>
          </div>
        </SectionCard>
      )}

      {activeSection === 'shopProducts' && (
        <SectionCard title="Grilla de Productos">
          <VisibilityToggle section="shopProducts" isVisible={isSectionVisible('shopProducts')} onToggle={() => toggleSectionVisibility('shopProducts')} />
          <InputField label="Título" value={sections.shopProducts?.title || ''} onChange={(v) => updateSection('shopProducts', { title: v })} placeholder="Productos Destacados" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <InputField label="Máx. Productos" value={sections.shopProducts?.maxProducts?.toString() || '12'} onChange={(v) => updateSection('shopProducts', { maxProducts: parseInt(v) || 12 })} type="number" />
            <div>
              <label className="text-[10px] text-gray-400 uppercase mb-1 block">Layout</label>
              <select value={sections.shopProducts?.layout || 'grid'} onChange={(e) => updateSection('shopProducts', { layout: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                <option value="grid">Grilla</option>
                <option value="list">Lista</option>
              </select>
            </div>
            <label className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={sections.shopProducts?.showFilters !== false} onChange={(e) => updateSection('shopProducts', { showFilters: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white">Mostrar Filtros</span>
            </label>
          </div>
          <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-gray-500">Se integra con tu inventario de productos de forma automática.</p>
          </div>
        </SectionCard>
      )}

      {activeSection === 'shopUrgency' && (
        <SectionCard title="Barra de Urgencia">
          <VisibilityToggle section="shopUrgency" isVisible={isSectionVisible('shopUrgency')} onToggle={() => toggleSectionVisibility('shopUrgency')} />
          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={sections.shopUrgency?.enabled !== false} onChange={(e) => updateSection('shopUrgency', { enabled: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm text-white">Habilitar Barra de Urgencia</span>
          </label>
          <InputField label="Mensaje" value={sections.shopUrgency?.message || ''} onChange={(v) => updateSection('shopUrgency', { message: v })} placeholder="Aprovecha las ofertas por tiempo limitado" />
          <InputField label="Texto Finaliza En" value={sections.shopUrgency?.endText || ''} onChange={(v) => updateSection('shopUrgency', { endText: v })} placeholder="La oferta finaliza en:" />
          <InputField label="Fecha de Cierre" value={sections.shopUrgency?.endDate || ''} onChange={(v) => updateSection('shopUrgency', { endDate: v })} placeholder="2026-12-31T23:59:59" />
          <ColorPicker label="Color de Fondo" value={sections.shopUrgency?.backgroundColor || '#B10D24'} onChange={(v) => updateSection('shopUrgency', { backgroundColor: v })} />
        </SectionCard>
      )}

      {activeSection === 'shopNotifications' && (
        <SectionCard title="Notificación Social (Popups)">
          <VisibilityToggle section="shopNotifications" isVisible={isSectionVisible('shopNotifications')} onToggle={() => toggleSectionVisibility('shopNotifications')} />
          <p className="text-xs text-gray-400 mb-4">Muestra pequeñas ventanas emulando compras en tiempo real para generar social proof.</p>
          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={sections.shopNotifications?.enabled !== false} onChange={(e) => updateSection('shopNotifications', { enabled: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm text-white">Habilitar Notificaciones</span>
          </label>
          <InputField label="Frecuencia (segundos)" value={sections.shopNotifications?.frequency?.toString() || '15'} onChange={(v) => updateSection('shopNotifications', { frequency: parseInt(v) || 15 })} type="number" />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Mensajes ({(sections.shopNotifications?.messages || []).length})</h4>
          <div className="space-y-2">
            {(sections.shopNotifications?.messages || []).map((msg: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="text" value={msg} onChange={(e) => updateArrayItem('shopNotifications', 'messages', idx, e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-sm text-white" placeholder="Alguien compró [Producto] hace 5 min" />
                <button onClick={() => removeArrayItem('shopNotifications', 'messages', idx)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={() => addArrayItem('shopNotifications', 'messages', '')} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Mensaje
            </button>
          </div>
        </SectionCard>
      )}

      {/* HERO - Landing Principal */}
      {activeSection === 'hero' && (
        <SectionCard title="Inicio / Hero">
          <VisibilityToggle section="hero" isVisible={isSectionVisible('hero')} onToggle={() => toggleSectionVisibility('hero')} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Título 1" value={sections.hero?.title1 || ''} onChange={(v) => updateSection('hero', { title1: v })} placeholder="BLIS" />
            <InputField label="Título 2" value={sections.hero?.title2 || ''} onChange={(v) => updateSection('hero', { title2: v })} placeholder="CORP" />
          </div>
          <InputField label="Subtítulo" value={sections.hero?.subtitle || ''} onChange={(v) => updateSection('hero', { subtitle: v })} placeholder="Tu Próximo Gran Patrimonio" />
          <TextAreaField label="Descripción" value={sections.hero?.description || ''} onChange={(v) => updateSection('hero', { description: v })} rows={2} placeholder="Desarrollamos Macro-Lotes y Terrenos con alta plusvalía." />
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto Botón Principal" value={sections.hero?.primaryBtnText || ''} onChange={(v) => updateSection('hero', { primaryBtnText: v })} placeholder="Comprar Terrenos" />
            <LinkField label="Enlace Botón Principal" value={sections.hero?.primaryBtnLink || ''} onChange={(v) => updateSection('hero', { primaryBtnLink: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <InputField label="Texto Botón Secundario" value={sections.hero?.secondaryBtnText || ''} onChange={(v) => updateSection('hero', { secondaryBtnText: v })} placeholder="Trayectoria" />
            <LinkField label="Enlace Botón Secundario" value={sections.hero?.secondaryBtnLink || ''} onChange={(v) => updateSection('hero', { secondaryBtnLink: v })} />
          </div>
          <div className="pt-4 border-t border-white/10">
            <ImageUpload value={sections.hero?.videoBackground || ''} onChange={(v) => updateSection('hero', { videoBackground: v })} folder="cms/hero" />
          </div>
        </SectionCard>
      )}

      {/* ABOUT - Trayectoria */}
      {activeSection === 'about' && (
        <SectionCard title="Trayectoria / About">
          <VisibilityToggle section="about" isVisible={isSectionVisible('about')} onToggle={() => toggleSectionVisibility('about')} />
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputField label="Años de Experiencia" value={sections.about?.yearsExperience || ''} onChange={(v) => updateSection('about', { yearsExperience: v })} placeholder="10+" />
            <InputField label="Label Años" value={sections.about?.yearsLabel || ''} onChange={(v) => updateSection('about', { yearsLabel: v })} placeholder="Años Exp." />
            <div></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputField label="Stat 1 Valor" value={sections.about?.stat1Value || ''} onChange={(v) => updateSection('about', { stat1Value: v })} placeholder="100%" />
            <InputField label="Stat 1 Label" value={sections.about?.stat1Label || ''} onChange={(v) => updateSection('about', { stat1Label: v })} placeholder="Certeza Legal" />
            <div></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputField label="Stat 2 Valor" value={sections.about?.stat2Value || ''} onChange={(v) => updateSection('about', { stat2Value: v })} placeholder="+350" />
            <InputField label="Stat 2 Label" value={sections.about?.stat2Label || ''} onChange={(v) => updateSection('about', { stat2Label: v })} placeholder="Lotes Entregados" />
            <div></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <InputField label="Stat 3 Valor" value={sections.about?.stat3Value || ''} onChange={(v) => updateSection('about', { stat3Value: v })} placeholder="+2500" />
            <InputField label="Stat 3 Label" value={sections.about?.stat3Label || ''} onChange={(v) => updateSection('about', { stat3Label: v })} placeholder="Entregas" />
            <div></div>
          </div>
          <InputField label="Título Sección" value={sections.about?.missionTitle || ''} onChange={(v) => updateSection('about', { missionTitle: v })} placeholder="Trayectoria y Solidez" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Título 1 (Línea 1)" value={sections.about?.title1 || ''} onChange={(v) => updateSection('about', { title1: v })} placeholder="Varios Años Creando" />
            <InputField label="Título 2 (Línea 2)" value={sections.about?.title2 || ''} onChange={(v) => updateSection('about', { title2: v })} placeholder="Valor Patrimonial" />
          </div>
          <TextAreaField label="Texto Misión" value={sections.about?.missionText || ''} onChange={(v) => updateSection('about', { missionText: v })} rows={2} placeholder="Transformar el horizonte inmobiliario." />
          <InputField label="URL Video (Embed)" value={sections.about?.videoUrl || ''} onChange={(v) => updateSection('about', { videoUrl: v })} placeholder="https://youtube.com/embed/..." />
          <ImageUpload value={sections.about?.videoThumbnail || ''} onChange={(v) => updateSection('about', { videoThumbnail: v })} folder="cms/about" />
        </SectionCard>
      )}

      {/* VIDEO - Nuestra Visión */}
      {activeSection === 'video' && (
        <SectionCard title="Nuestra Visión / Video">
          <VisibilityToggle section="video" isVisible={isSectionVisible('video')} onToggle={() => toggleSectionVisibility('video')} />
          <InputField label="Título" value={sections.video?.title || ''} onChange={(v) => updateSection('video', { title: v })} placeholder="Nuestra Visión" />
          <InputField label="Subtítulo" value={sections.video?.subtitle || ''} onChange={(v) => updateSection('video', { subtitle: v })} placeholder="en Movimiento" />
          <TextAreaField label="Descripción" value={sections.video?.description || ''} onChange={(v) => updateSection('video', { description: v })} rows={2} placeholder="Explora nuestros proyectos a través de un lente cinematográfico" />
          <InputField label="URL Video (Embed)" value={sections.video?.embedUrl || ''} onChange={(v) => updateSection('video', { embedUrl: v })} placeholder="https://youtube.com/embed/..." />
          <ImageUpload value={sections.video?.thumbnail || ''} onChange={(v) => updateSection('video', { thumbnail: v })} folder="cms/video" />
          <InputField label="Contador de Vistas" value={sections.video?.viewsCount || ''} onChange={(v) => updateSection('video', { viewsCount: v })} placeholder="12450" />
        </SectionCard>
      )}

      {/* PROCESS - Metodología */}
      {activeSection === 'process' && (
        <SectionCard title="Metodología / Proceso">
          <VisibilityToggle section="process" isVisible={isSectionVisible('process')} onToggle={() => toggleSectionVisibility('process')} />
          <InputField label="Título" value={sections.process?.title || ''} onChange={(v) => updateSection('process', { title: v })} placeholder="Metodología" />
          <InputField label="Subtítulo" value={sections.process?.subtitle || ''} onChange={(v) => updateSection('process', { subtitle: v })} placeholder="Nuestra Ruta de Éxito" />
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Pasos ({(sections.process?.steps || []).length})</h4>
          <div className="space-y-3">
            {(sections.process?.steps || []).map((step: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Paso {idx + 1}</span>
                  <button onClick={() => removeArrayItem('process', 'steps', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <InputField label="Título" value={step.title || ''} onChange={(v) => updateArrayItem('process', 'steps', idx, { title: v })} />
                <TextAreaField label="Descripción" value={step.description || ''} onChange={(v) => updateArrayItem('process', 'steps', idx, { description: v })} rows={1} />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase mb-1 block">Ícono</label>
                    <select value={step.icon || 'Check'} onChange={(e) => updateArrayItem('process', 'steps', idx, { icon: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-white">
                      {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{ICON_OPTIONS_SPANISH[icon]}</option>)}
                    </select>
                  </div>
                  <ImageUpload value={step.image || ''} onChange={(v) => updateArrayItem('process', 'steps', idx, { image: v })} folder="cms/process" />
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('process', 'steps', { icon: 'Check', title: '', description: '', image: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Paso
            </button>
          </div>
        </SectionCard>
      )}

      {/* OPERATIONS - Backstage */}
      {activeSection === 'operations' && (
        <SectionCard title="Backstage / Operaciones">
          <VisibilityToggle section="operations" isVisible={isSectionVisible('operations')} onToggle={() => toggleSectionVisibility('operations')} />
          <InputField label="Título" value={sections.operations?.title || ''} onChange={(v) => updateSection('operations', { title: v })} placeholder="Backstage" />
          <InputField label="Subtítulo" value={sections.operations?.subtitle || ''} onChange={(v) => updateSection('operations', { subtitle: v })} placeholder="Operaciones en Campo" />
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Imágenes del Slider (arrastra para reordenar)</h4>
          <div className="space-y-2">
            {(sections.operations?.sliderImages || []).map((img: string, idx: number) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/10"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', idx.toString());
                  (e.target as HTMLElement).classList.add('opacity-50');
                }}
                onDragEnd={(e) => {
                  (e.target as HTMLElement).classList.remove('opacity-50');
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  (e.target as HTMLElement).closest('[draggable]')?.classList.add('border-blis-red');
                }}
                onDragLeave={(e) => {
                  (e.target as HTMLElement).closest('[draggable]')?.classList.remove('border-blis-red');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                  const toIdx = idx;
                  if (fromIdx !== toIdx) {
                    const newImages = [...(sections.operations?.sliderImages || [])];
                    const [moved] = newImages.splice(fromIdx, 1);
                    newImages.splice(toIdx, 0, moved);
                    updateSection('operations', { sliderImages: newImages });
                  }
                  (e.target as HTMLElement).closest('[draggable]')?.classList.remove('border-blis-red');
                }}
              >
                <span className="text-gray-500 text-xs w-6 cursor-move">⠿</span>
                <ImageUpload value={img} onChange={(v) => updateArrayItem('operations', 'sliderImages', idx, v)} folder="cms/operations" enableCrop aspectRatio={4/3} />
                <button onClick={() => removeArrayItem('operations', 'sliderImages', idx)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={() => addArrayItem('operations', 'sliderImages', '')} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Imagen
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <InputField label="Ventas" value={sections.operations?.stats?.sales || ''} onChange={(v) => updateSection('operations', { stats: { ...(sections.operations?.stats || {}), sales: v } })} placeholder="5M" />
            <InputField label="Urbanizaciones" value={sections.operations?.stats?.urbanizations || ''} onChange={(v) => updateSection('operations', { stats: { ...(sections.operations?.stats || {}), urbanizations: v } })} placeholder="12" />
            <InputField label="Clientes" value={sections.operations?.stats?.clients || ''} onChange={(v) => updateSection('operations', { stats: { ...(sections.operations?.stats || {}), clients: v } })} placeholder="850" />
            <InputField label="Conferencias" value={sections.operations?.stats?.conferences || ''} onChange={(v) => updateSection('operations', { stats: { ...(sections.operations?.stats || {}), conferences: v } })} placeholder="45" />
          </div>
        </SectionCard>
      )}

      {/* MARKET - Inteligencia Inmobiliaria */}
      {activeSection === 'market' && (
        <SectionCard title="Mercado / Inteligencia">
          <VisibilityToggle section="market" isVisible={isSectionVisible('market')} onToggle={() => toggleSectionVisibility('market')} />
          <InputField label="Título" value={sections.market?.title || ''} onChange={(v) => updateSection('market', { title: v })} placeholder="Mercado" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Subtítulo 1" value={sections.market?.subtitle1 || ''} onChange={(v) => updateSection('market', { subtitle1: v })} placeholder="Inteligencia Inmobiliaria" />
            <InputField label="Subtítulo 2" value={sections.market?.subtitle2 || ''} onChange={(v) => updateSection('market', { subtitle2: v })} placeholder="Datos" />
          </div>
          <TextAreaField label="Descripción" value={sections.market?.description || ''} onChange={(v) => updateSection('market', { description: v })} rows={2} />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Insights ({(sections.market?.insights || []).length})</h4>
          <div className="space-y-3">
            {(sections.market?.insights || []).map((insight: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Insight {idx + 1}</span>
                  <button onClick={() => removeArrayItem('market', 'insights', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Tipo" value={insight.type || ''} onChange={(v) => updateArrayItem('market', 'insights', idx, { type: v })} placeholder="mercado" />
                  <InputField label="Título" value={insight.title || ''} onChange={(v) => updateArrayItem('market', 'insights', idx, { title: v })} placeholder="Tendencia" />
                </div>
                <TextAreaField label="Texto" value={insight.text || ''} onChange={(v) => updateArrayItem('market', 'insights', idx, { text: v })} rows={2} placeholder="Texto del insight..." />
              </div>
            ))}
            <button onClick={() => addArrayItem('market', 'insights', { type: '', title: '', text: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Insight
            </button>
          </div>
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Estadísticas ({(sections.market?.stats || []).length})</h4>
          <div className="space-y-3">
            {(sections.market?.stats || []).map((stat: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Stat {idx + 1}</span>
                  <button onClick={() => removeArrayItem('market', 'stats', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Título" value={stat.title || ''} onChange={(v) => updateArrayItem('market', 'stats', idx, { title: v })} placeholder="Título" />
                  <InputField label="Valor" value={stat.value || ''} onChange={(v) => updateArrayItem('market', 'stats', idx, { value: v })} placeholder="+25%" />
                </div>
                <InputField label="Descripción" value={stat.desc || ''} onChange={(v) => updateArrayItem('market', 'stats', idx, { desc: v })} placeholder="Descripción corta" />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase mb-1 block">Ícono</label>
                    <select value={stat.icon || 'TrendingUp'} onChange={(e) => updateArrayItem('market', 'stats', idx, { icon: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-white">
                      <option value="TrendingUp">TrendingUp</option>
                      <option value="BarChart3">BarChart3</option>
                      <option value="Zap">Zap</option>
                      <option value="DollarSign">DollarSign</option>
                      <option value="Users">Users</option>
                      <option value="Building">Building</option>
                    </select>
                  </div>
                  <ColorPicker label="Color" value={stat.color || '#be0b3c'} onChange={(v) => updateArrayItem('market', 'stats', idx, { color: v })} />
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('market', 'stats', { title: '', value: '', desc: '', icon: 'TrendingUp', color: '#be0b3c' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Estadística
            </button>
          </div>
        </SectionCard>
      )}

      {/* CALCULATOR - Simulador de Plusvalía */}
      {activeSection === 'calculator' && (
        <SectionCard title="Calculadora de Plusvalía">
          <VisibilityToggle section="calculator" isVisible={isSectionVisible('calculator')} onToggle={() => toggleSectionVisibility('calculator')} />
          <InputField label="Título" value={sections.calculator?.title || ''} onChange={(v) => updateSection('calculator', { title: v })} placeholder="Plusvalía" />
          <InputField label="Subtítulo" value={sections.calculator?.subtitle || ''} onChange={(v) => updateSection('calculator', { subtitle: v })} placeholder="Simulador" />
          <TextAreaField label="Descripción" value={sections.calculator?.description || ''} onChange={(v) => updateSection('calculator', { description: v })} rows={2} placeholder="Calcula la plusvalía proyectada de tu inversión." />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <InputField label="Ratio Planos" value={sections.calculator?.planosRatio || ''} onChange={(v) => updateSection('calculator', { planosRatio: v })} placeholder="50" />
            <InputField label="Ratio Preventa" value={sections.calculator?.preventaRatio || ''} onChange={(v) => updateSection('calculator', { preventaRatio: v })} placeholder="75" />
            <InputField label="Ratio Escritura" value={sections.calculator?.escrituraRatio || ''} onChange={(v) => updateSection('calculator', { escrituraRatio: v })} placeholder="91" />
          </div>
          <InputField label="TIR" value={sections.calculator?.tirValue || ''} onChange={(v) => updateSection('calculator', { tirValue: v })} placeholder="22" />
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Etiquetas de Etapas</h4>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Planos Label" value={sections.calculator?.planosLabel || ''} onChange={(v) => updateSection('calculator', { planosLabel: v })} placeholder="En Planos" />
            <InputField label="Preventa Label" value={sections.calculator?.preventaLabel || ''} onChange={(v) => updateSection('calculator', { preventaLabel: v })} placeholder="Preventa" />
            <InputField label="Escritura Label" value={sections.calculator?.escrituraLabel || ''} onChange={(v) => updateSection('calculator', { escrituraLabel: v })} placeholder="Escritura en Mano" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <TextAreaField label="Desc Planos" value={sections.calculator?.planosDesc || ''} onChange={(v) => updateSection('calculator', { planosDesc: v })} rows={2} placeholder="Máxima rentabilidad..." />
            <TextAreaField label="Desc Preventa" value={sections.calculator?.preventaDesc || ''} onChange={(v) => updateSection('calculator', { preventaDesc: v })} rows={2} placeholder="Trazado visible..." />
            <TextAreaField label="Desc Escritura" value={sections.calculator?.escrituraDesc || ''} onChange={(v) => updateSection('calculator', { escrituraDesc: v })} rows={2} placeholder="Saneamiento completo..." />
          </div>
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Botones CTA</h4>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Texto Botón Principal" value={sections.calculator?.primaryBtnText || ''} onChange={(v) => updateSection('calculator', { primaryBtnText: v })} placeholder="Ver Proyectos" />
            <LinkField label="Enlace Botón Principal" value={sections.calculator?.primaryBtnLink || ''} onChange={(v) => updateSection('calculator', { primaryBtnLink: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <InputField label="Texto Botón Secundario" value={sections.calculator?.secondaryBtnText || ''} onChange={(v) => updateSection('calculator', { secondaryBtnText: v })} placeholder="Contactar" />
            <LinkField label="Enlace Botón Secundario" value={sections.calculator?.secondaryBtnLink || ''} onChange={(v) => updateSection('calculator', { secondaryBtnLink: v })} />
          </div>
        </SectionCard>
      )}

      {/* MAP - Dominio Territorial */}
      {activeSection === 'map' && (
        <div className="space-y-6">
          <SectionCard title="Configuración del Mapa">
            <VisibilityToggle section="map" isVisible={isSectionVisible('map')} onToggle={() => toggleSectionVisibility('map')} />
            <InputField label="Título" value={sections.map?.title || ''} onChange={(v) => updateSection('map', { title: v })} placeholder="Dominio Territorial" />
            <InputField label="Subtítulo" value={sections.map?.subtitle || ''} onChange={(v) => updateSection('map', { subtitle: v })} placeholder="Mapa Interactivo" />
            <TextAreaField label="Descripción" value={sections.map?.description || ''} onChange={(v) => updateSection('map', { description: v })} rows={2} />
          </SectionCard>
          
          <SectionCard title="Editor de Ubicaciones">
            <p className="text-xs text-gray-400 mb-4">
              Sube una imagen de fondo del mapa y arrastra los puntos para posicionar cada proyecto. 
              Haz clic en "Agregar en Mapa" para añadir ubicaciones haciendo clic en el mapa, 
              o selecciona un proyecto existente.
            </p>
            <MapEditor
              backgroundImage={sections.map?.backgroundImage || ''}
              locations={sections.map?.locations || []}
              onChange={(data) => {
                if (data.backgroundImage !== undefined) {
                  updateSection('map', { backgroundImage: data.backgroundImage });
                }
                if (data.locations) {
                  updateSection('map', { locations: data.locations });
                }
              }}
              projects={projects}
            />
          </SectionCard>
        </div>
      )}

      {/* PROJECTS - Portafolio */}
      {activeSection === 'projects' && (
        <SectionCard title="Portafolio / Proyectos">
          <VisibilityToggle section="projects" isVisible={isSectionVisible('projects')} onToggle={() => toggleSectionVisibility('projects')} />
          <InputField label="Título" value={sections.projects?.title || ''} onChange={(v) => updateSection('projects', { title: v })} placeholder="Portafolio" />
          <InputField label="Subtítulo" value={sections.projects?.subtitle || ''} onChange={(v) => updateSection('projects', { subtitle: v })} placeholder="Nuestros Proyectos" />
          <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-gray-500">Los proyectos se muestran automáticamente desde la base de datos.</p>
          </div>
        </SectionCard>
      )}

      {/* CATALOG - Tienda */}
      {activeSection === 'catalog' && (
        <SectionCard title="Catálogo / Tienda">
          <VisibilityToggle section="catalog" isVisible={isSectionVisible('catalog')} onToggle={() => toggleSectionVisibility('catalog')} />
          <InputField label="Título" value={sections.catalog?.title || ''} onChange={(v) => updateSection('catalog', { title: v })} placeholder="Tienda" />
          <InputField label="Subtítulo" value={sections.catalog?.subtitle || ''} onChange={(v) => updateSection('catalog', { subtitle: v })} placeholder="Productos" />
          <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-gray-500">Los productos se muestran automáticamente desde la base de datos.</p>
          </div>
        </SectionCard>
      )}

      {/* TEAM - Equipo */}
      {activeSection === 'team' && (
        <SectionCard title="Equipo">
          <VisibilityToggle section="team" isVisible={isSectionVisible('team')} onToggle={() => toggleSectionVisibility('team')} />
          <InputField label="Título" value={sections.team?.title || ''} onChange={(v) => updateSection('team', { title: v })} placeholder="Equipo" />
          <InputField label="Nombre CEO" value={sections.team?.ceoName || ''} onChange={(v) => updateSection('team', { ceoName: v })} placeholder="Kevin Valdez" />
          <InputField label="Rol CEO" value={sections.team?.ceoRole || ''} onChange={(v) => updateSection('team', { ceoRole: v })} placeholder="CEO" />
          <InputField label="Frase CEO" value={sections.team?.ceoQuote || ''} onChange={(v) => updateSection('team', { ceoQuote: v })} placeholder="El éxito se construye con visión y perseverancia." />
          <TextAreaField label="Descripción CEO 1" value={sections.team?.ceoDescription1 || ''} onChange={(v) => updateSection('team', { ceoDescription1: v })} rows={2} />
          <TextAreaField label="Descripción CEO 2" value={sections.team?.ceoDescription2 || ''} onChange={(v) => updateSection('team', { ceoDescription2: v })} rows={2} />
          <ImageUpload value={sections.team?.ceoImage || ''} onChange={(v) => updateSection('team', { ceoImage: v })} folder="cms/team" />
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Widgets</h4>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Label Widget 1" value={sections.team?.widget1Label || ''} onChange={(v) => updateSection('team', { widget1Label: v })} placeholder="Cap. Administrado" />
            <InputField label="Valor Widget 1" value={sections.team?.widget1Value || ''} onChange={(v) => updateSection('team', { widget1Value: v })} placeholder="+$10M" />
            <InputField label="Label Widget 2" value={sections.team?.widget2Label || ''} onChange={(v) => updateSection('team', { widget2Label: v })} placeholder="Garantía Fiduciaria" />
            <InputField label="Valor Widget 2" value={sections.team?.widget2Value || ''} onChange={(v) => updateSection('team', { widget2Value: v })} placeholder="Cero Litigios" />
          </div>
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Miembros ({(sections.team?.members || []).length})</h4>
          <div className="space-y-3">
            {(sections.team?.members || []).map((member: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Miembro {idx + 1}</span>
                  <button onClick={() => removeArrayItem('team', 'members', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <InputField label="Nombre" value={member.name || ''} onChange={(v) => updateArrayItem('team', 'members', idx, { name: v })} />
                <InputField label="Rol" value={member.role || ''} onChange={(v) => updateArrayItem('team', 'members', idx, { role: v })} />
                <ImageUpload value={member.image || ''} onChange={(v) => updateArrayItem('team', 'members', idx, { image: v })} folder="cms/team" />
              </div>
            ))}
            <button onClick={() => addArrayItem('team', 'members', { name: '', role: '', image: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Miembro
            </button>
          </div>
        </SectionCard>
      )}

      {/* TESTIMONIALS */}
      {activeSection === 'testimonials' && (
        <SectionCard title="Testimonios">
          <VisibilityToggle section="testimonials" isVisible={isSectionVisible('testimonials')} onToggle={() => toggleSectionVisibility('testimonials')} />
          <InputField label="Título" value={sections.testimonials?.title || ''} onChange={(v) => updateSection('testimonials', { title: v })} placeholder="Testimonios" />
          <InputField label="Subtítulo" value={sections.testimonials?.subtitle || ''} onChange={(v) => updateSection('testimonials', { subtitle: v })} placeholder="Experiencias" />
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Testimonios ({(sections.testimonials?.items || []).length})</h4>
          <div className="space-y-3">
            {(sections.testimonials?.items || []).map((testimonial: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Testimonio {idx + 1}</span>
                  <button onClick={() => removeArrayItem('testimonials', 'items', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <TextAreaField label="Cita" value={testimonial.quote || ''} onChange={(v) => updateArrayItem('testimonials', 'items', idx, { quote: v })} rows={2} />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <InputField label="Autor" value={testimonial.author || ''} onChange={(v) => updateArrayItem('testimonials', 'items', idx, { author: v })} />
                  <InputField label="Rol" value={testimonial.role || ''} onChange={(v) => updateArrayItem('testimonials', 'items', idx, { role: v })} />
                </div>
                <div className="mt-2">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Foto</label>
                  <ImageUpload value={testimonial.image || ''} onChange={(v) => updateArrayItem('testimonials', 'items', idx, { image: v })} folder="cms/testimonials" />
                </div>
              </div>
            ))}
            <button onClick={() => addArrayItem('testimonials', 'items', { quote: '', author: '', role: '', image: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Testimonio
            </button>
          </div>
        </SectionCard>
      )}

      {/* FAQ */}
      {activeSection === 'faq' && (
        <SectionCard title="Preguntas Frecuentes">
          <VisibilityToggle section="faq" isVisible={isSectionVisible('faq')} onToggle={() => toggleSectionVisibility('faq')} />
          <InputField label="Título" value={sections.faq?.title || ''} onChange={(v) => updateSection('faq', { title: v })} placeholder="Preguntas Frecuentes" />
          <InputField label="Subtítulo" value={sections.faq?.subtitle || ''} onChange={(v) => updateSection('faq', { subtitle: v })} placeholder="Transparencia" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Satisfacción" value={sections.faq?.satisfactionRate || ''} onChange={(v) => updateSection('faq', { satisfactionRate: v })} placeholder="4.9" />
            <InputField label="Texto CTA" value={sections.faq?.ctaText || ''} onChange={(v) => updateSection('faq', { ctaText: v })} placeholder="Habla con un Asesor" />
          </div>
          <LinkField label="Enlace CTA" value={sections.faq?.ctaLink || ''} onChange={(v) => updateSection('faq', { ctaLink: v })} />
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Preguntas ({(sections.faq?.items || []).length})</h4>
          <div className="space-y-3">
            {(sections.faq?.items || []).map((q: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Pregunta {idx + 1}</span>
                  <button onClick={() => removeArrayItem('faq', 'items', idx)} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <InputField label="Pregunta" value={q.question || ''} onChange={(v) => updateArrayItem('faq', 'items', idx, { question: v })} />
                <TextAreaField label="Respuesta" value={q.answer || ''} onChange={(v) => updateArrayItem('faq', 'items', idx, { answer: v })} rows={2} />
              </div>
            ))}
            <button onClick={() => addArrayItem('faq', 'items', { question: '', answer: '' })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Pregunta
            </button>
          </div>
        </SectionCard>
      )}

      {/* BLOG */}
      {activeSection === 'blog' && (
        <SectionCard title="Blog">
          <VisibilityToggle section="blog" isVisible={isSectionVisible('blog')} onToggle={() => toggleSectionVisibility('blog')} />
          <InputField label="Título" value={sections.blog?.title || ''} onChange={(v) => updateSection('blog', { title: v })} placeholder="Blog" />
          <InputField label="Subtítulo" value={sections.blog?.subtitle || ''} onChange={(v) => updateSection('blog', { subtitle: v })} placeholder="Artículos" />
          <TextAreaField label="Descripción" value={sections.blog?.description || ''} onChange={(v) => updateSection('blog', { description: v })} rows={2} />
          <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
            <p className="text-xs text-gray-500">Los artículos se muestran automáticamente desde la base de datos.</p>
          </div>
        </SectionCard>
      )}

      {/* FOOTER */}
      {activeSection === 'footer' && (
        <SectionCard title="Footer">
          <VisibilityToggle section="footer" isVisible={isSectionVisible('footer')} onToggle={() => toggleSectionVisibility('footer')} />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-4 mb-3">Contenido</h4>
          <TextAreaField label="Descripción" value={sections.footer?.description || ''} onChange={(v) => updateSection('footer', { description: v })} rows={2} placeholder="Descripción de la empresa..." />
          <InputField label="Copyright" value={sections.footer?.copyright || ''} onChange={(v) => updateSection('footer', { copyright: v })} placeholder="© 2026 Blis Corp." />
          <InputField label="Texto de Ubicación" value={sections.footer?.locationText || ''} onChange={(v) => updateSection('footer', { locationText: v })} placeholder="Diseñado con visión en 🇪🇨 Ecuador · 🇵🇪 Perú" />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Acceso VIP</h4>
          <InputField label="Título VIP" value={sections.footer?.vipTitle || ''} onChange={(v) => updateSection('footer', { vipTitle: v })} placeholder="Acceso VIP" />
          <TextAreaField label="Descripción VIP" value={sections.footer?.vipDescription || ''} onChange={(v) => updateSection('footer', { vipDescription: v })} rows={2} placeholder="Únete a la lista de inversores..." />
          <InputField label="Placeholder Email" value={sections.footer?.vipPlaceholder || ''} onChange={(v) => updateSection('footer', { vipPlaceholder: v })} placeholder="Tu correo corporativo" />
          <InputField label="Texto Botón" value={sections.footer?.vipButtonText || ''} onChange={(v) => updateSection('footer', { vipButtonText: v })} placeholder="Suscribirme" />
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Proyectos</h4>
          <InputField label="Título Sección" value={sections.footer?.projectsTitle || ''} onChange={(v) => updateSection('footer', { projectsTitle: v })} placeholder="Proyectos" />
          <div className="flex items-center gap-3 mb-4">
            <input type="checkbox" id="showProjects" checked={sections.footer?.showProjects !== false} onChange={(e) => updateSection('footer', { showProjects: e.target.checked })} className="w-4 h-4 accent-blis-red" />
            <label htmlFor="showProjects" className="text-sm text-gray-300">Mostrar proyectos dinámicamente</label>
          </div>
          <p className="text-[10px] text-gray-500">Los proyectos se cargan automáticamente desde la base de datos.</p>
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Legal</h4>
          <InputField label="Título Sección" value={sections.footer?.legalTitle || ''} onChange={(v) => updateSection('footer', { legalTitle: v })} placeholder="Legal" />
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500 mb-2">Links legales ({(sections.footer?.legalLinks || []).length})</p>
            {(sections.footer?.legalLinks || []).map((link: any, idx: number) => (
              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blis-red font-bold text-xs">Link {idx + 1}</span>
                  <button onClick={() => {
                    const links = [...(sections.footer?.legalLinks || [])];
                    links.splice(idx, 1);
                    updateSection('footer', { legalLinks: links });
                  }} className="text-red-400 hover:text-red-300 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Texto" value={link.text || ''} onChange={(v) => {
                    const links = [...(sections.footer?.legalLinks || [])];
                    links[idx] = { ...links[idx], text: v };
                    updateSection('footer', { legalLinks: links });
                  }} placeholder="Privacidad" />
                  <InputField label="URL" value={link.href || ''} onChange={(v) => {
                    const links = [...(sections.footer?.legalLinks || [])];
                    links[idx] = { ...links[idx], href: v };
                    updateSection('footer', { legalLinks: links });
                  }} placeholder="/privacidad" />
                </div>
              </div>
            ))}
            <button onClick={() => updateSection('footer', { legalLinks: [...(sections.footer?.legalLinks || []), { text: '', href: '' }] })} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white text-xs flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar Link Legal
            </button>
          </div>

          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Redes Sociales</h4>
          <p className="text-[10px] text-gray-500 mb-3">Deja vacío para ocultar el ícono. También puedes configurarlas en Ajustes → Configuración del Sitio.</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="WhatsApp" value={sections.footer?.socials?.whatsapp || ''} onChange={(v) => updateSection('footer', { socials: { ...(sections.footer?.socials || {}), whatsapp: v } })} placeholder="https://wa.me/51999999999" />
            <InputField label="Instagram" value={sections.footer?.socials?.instagram || ''} onChange={(v) => updateSection('footer', { socials: { ...(sections.footer?.socials || {}), instagram: v } })} placeholder="https://instagram.com/bliscorp" />
            <InputField label="Facebook" value={sections.footer?.socials?.facebook || ''} onChange={(v) => updateSection('footer', { socials: { ...(sections.footer?.socials || {}), facebook: v } })} placeholder="https://facebook.com/bliscorp" />
            <InputField label="YouTube" value={sections.footer?.socials?.youtube || ''} onChange={(v) => updateSection('footer', { socials: { ...(sections.footer?.socials || {}), youtube: v } })} placeholder="https://youtube.com/@bliscorp" />
            <InputField label="TikTok" value={sections.footer?.socials?.tiktok || ''} onChange={(v) => updateSection('footer', { socials: { ...(sections.footer?.socials || {}), tiktok: v } })} placeholder="https://tiktok.com/@bliscorp" />
            <InputField label="LinkedIn" value={sections.footer?.socials?.linkedin || ''} onChange={(v) => updateSection('footer', { socials: { ...(sections.footer?.socials || {}), linkedin: v } })} placeholder="https://linkedin.com/company/bliscorp" />
            <InputField label="X (Twitter)" value={sections.footer?.socials?.twitter || ''} onChange={(v) => updateSection('footer', { socials: { ...(sections.footer?.socials || {}), twitter: v } })} placeholder="https://x.com/bliscorp" />
          </div>
          
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Video (Dentro de la Fábrica)</h4>
          <InputField label="Título del Video" value={sections.footer?.videoTitle || ''} onChange={(v) => updateSection('footer', { videoTitle: v })} placeholder="Dentro de la Fábrica" />
          <InputField label="Subtítulo" value={sections.footer?.videoSubtitle || ''} onChange={(v) => updateSection('footer', { videoSubtitle: v })} placeholder="Conoce nuestro rigor metodológico" />
          <InputField label="URL del Video (Embed)" value={sections.footer?.videoUrl || ''} onChange={(v) => updateSection('footer', { videoUrl: v })} placeholder="https://youtube.com/embed/..." />
          <p className="text-[10px] text-gray-500 mb-2">Usa URL de embed: YouTube embed, Vimeo player, etc.</p>
          <ImageUpload value={sections.footer?.videoThumbnail || ''} onChange={(v) => updateSection('footer', { videoThumbnail: v })} folder="cms/footer" />
        </SectionCard>
      )}
    </div>
  );
}
