"use client";

import { Plus, Trash2, Megaphone, Users } from "lucide-react";
import { InputField, TextAreaField, LinkField, ColorPicker, SectionCard, VisibilityToggle } from "../ui";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { NativeSelect, SearchableSelect } from "@/components/ui/SearchableSelect";

interface CaptureHeroEditorProps {
  sections: Record<string, any>;
  campanas: any[];
  loadingCampanas: boolean;
  asesores: any[];
  loadingAsesores: boolean;
  updateSection: (section: string, data: any) => void;
  toggleSectionVisibility: (key: string) => void;
  isSectionVisible: (key: string) => boolean;
}

export function CaptureHeroEditor({
  sections,
  campanas,
  loadingCampanas,
  asesores,
  loadingAsesores,
  updateSection,
  toggleSectionVisibility,
  isSectionVisible,
}: CaptureHeroEditorProps) {
  return (
    <div className="space-y-6">
      {/* Destino del Lead */}
      <SectionCard title="Destino del Lead">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
          <p className="text-xs text-amber-300">
            <strong>Importante:</strong> Selecciona a dónde irá el lead cuando se registre. 
            La campaña determina quién recibe las notificaciones.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-400 uppercase mb-1 block">
              <Megaphone className="w-3 h-3 inline mr-1" />
              Campaña
            </label>
            <SearchableSelect
              value={sections.captureHero?.form?.campana_id || ''}
              onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), campana_id: v } })}
              options={campanas?.map((c: any) => ({ value: c.id, label: c.nombre })) || []}
              placeholder={loadingCampanas ? 'Cargando...' : 'Seleccionar campaña...'}
              searchPlaceholder="Buscar campaña..."
            />
            <p className="text-[10px] text-gray-500 mt-1">La campaña define a quién se notifica</p>
          </div>
          
          <div>
            <label className="text-[10px] text-gray-400 uppercase mb-1 block">
              <Users className="w-3 h-3 inline mr-1" />
              Asesor Asignado
            </label>
            <SearchableSelect
              value={sections.captureHero?.form?.asesor_id || ''}
              onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), asesor_id: v } })}
              options={asesores?.filter((a: any) => a.activo !== false).map((a: any) => ({ value: a.id, label: a.nombre })) || []}
              placeholder={loadingAsesores ? 'Cargando...' : 'Sin asesor específico'}
              searchPlaceholder="Buscar asesor..."
            />
            <p className="text-[10px] text-gray-500 mt-1">Opcional: asigna un asesor específico</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
          <InputField 
            label="URL de Redirección" 
            value={sections.captureHero?.form?.redirectUrl || ''} 
            onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), redirectUrl: v } })} 
            placeholder="/gracias" 
          />
          <InputField 
            label="URL Externa (opcional)" 
            value={sections.captureHero?.form?.externalRedirectUrl || ''} 
            onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), externalRedirectUrl: v } })} 
            placeholder="https://otro-sitio.com/gracias" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField 
            label="Título de Éxito" 
            value={sections.captureHero?.form?.successTitle || ''} 
            onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), successTitle: v } })} 
            placeholder="¡Registro Exitoso!" 
          />
          <InputField 
            label="Mensaje de Éxito" 
            value={sections.captureHero?.form?.successMessage || ''} 
            onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), successMessage: v } })} 
            placeholder="Te contactaremos pronto" 
          />
        </div>
      </SectionCard>

      {/* Apariencia del Hero */}
      <SectionCard title="Apariencia del Hero">
        <VisibilityToggle section="captureHero" isVisible={isSectionVisible('captureHero')} onToggle={() => toggleSectionVisibility('captureHero')} />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Título 1" value={sections.captureHero?.title1 || ''} onChange={(v) => updateSection('captureHero', { title1: v })} placeholder="Únete a la" />
          <InputField label="Título 2" value={sections.captureHero?.title2 || ''} onChange={(v) => updateSection('captureHero', { title2: v })} placeholder="Élite Inmobiliaria" />
        </div>
        <InputField label="Subtítulo" value={sections.captureHero?.subtitle || ''} onChange={(v) => updateSection('captureHero', { subtitle: v })} />
        <TextAreaField label="Descripción" value={sections.captureHero?.description || ''} onChange={(v) => updateSection('captureHero', { description: v })} rows={2} />
        <ColorPicker label="Color de Acento" value={sections.captureHero?.accentColor || '#B10D24'} onChange={(v) => updateSection('captureHero', { accentColor: v })} />
        <ImageUpload value={sections.captureHero?.backgroundImage || ''} onChange={(v) => updateSection('captureHero', { backgroundImage: v })} folder="cms/capture" />
        
        <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Estadísticas del Hero</h4>
        <div className="space-y-2">
          {(sections.captureHero?.stats || []).map((stat: any, idx: number) => (
            <div key={idx} className="grid grid-cols-2 gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
              <InputField label="Valor" value={stat.value || ''} onChange={(v) => {
                const newStats = [...(sections.captureHero?.stats || [])];
                newStats[idx] = { ...newStats[idx], value: v };
                updateSection('captureHero', { stats: newStats });
              }} />
              <InputField label="Label" value={stat.label || ''} onChange={(v) => {
                const newStats = [...(sections.captureHero?.stats || [])];
                newStats[idx] = { ...newStats[idx], label: v };
                updateSection('captureHero', { stats: newStats });
              }} />
            </div>
          ))}
        </div>
        
        <h4 className="text-xs font-bold text-gray-400 uppercase mt-6 mb-3">Beneficios</h4>
        <div className="space-y-2">
          {(sections.captureHero?.benefits || []).map((benefit: any, idx: number) => (
            <div key={idx} className="flex gap-2">
              <input type="text" value={benefit.text || ''} onChange={(e) => {
                const newBenefits = [...(sections.captureHero?.benefits || [])];
                newBenefits[idx] = { text: e.target.value };
                updateSection('captureHero', { benefits: newBenefits });
              }} className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
              <button onClick={() => {
                const newBenefits = [...(sections.captureHero?.benefits || [])];
                newBenefits.splice(idx, 1);
                updateSection('captureHero', { benefits: newBenefits });
              }} className="text-red-400 hover:text-red-300 px-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={() => {
            const newBenefits = [...(sections.captureHero?.benefits || []), { text: '' }];
            updateSection('captureHero', { benefits: newBenefits });
          }} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white text-xs">
            + Agregar Beneficio
          </button>
        </div>
      </SectionCard>

      {/* Campos del Formulario */}
      <SectionCard title="Campos del Formulario">
        <div className="space-y-4">
          <InputField label="Título del Formulario" value={sections.captureHero?.form?.title || ''} onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), title: v } })} placeholder="Regístrate Ahora" />
          <InputField label="Subtítulo del Formulario" value={sections.captureHero?.form?.subtitle || ''} onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), subtitle: v } })} placeholder="Completa tus datos" />
          <InputField label="Texto del Botón" value={sections.captureHero?.form?.submitText || ''} onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), submitText: v } })} placeholder="Quiero Participar" />
          <TextAreaField label="Texto de Privacidad" value={sections.captureHero?.form?.privacyText || ''} onChange={(v) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), privacyText: v } })} rows={2} placeholder="Al enviar aceptas nuestros términos y condiciones..." />
          
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Campos</h4>
              <button 
                onClick={() => {
                  const newFields = [...(sections.captureHero?.form?.fields || []), { 
                    name: `campo_${Date.now()}`, 
                    type: 'text', 
                    label: 'Nuevo Campo', 
                    required: false 
                  }];
                  updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                }}
                className="px-3 py-1 bg-blis-red/20 text-blis-red text-xs font-bold rounded-lg hover:bg-blis-red/30 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Agregar Campo
              </button>
            </div>
            
            <div className="space-y-3">
              {(sections.captureHero?.form?.fields || []).map((field: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blis-red font-bold text-xs">Campo {idx + 1}</span>
                    <button onClick={() => {
                      const newFields = [...(sections.captureHero?.form?.fields || [])];
                      newFields.splice(idx, 1);
                      updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                    }} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Nombre (name)" value={field.name || ''} onChange={(v) => {
                      const newFields = [...(sections.captureHero?.form?.fields || [])];
                      newFields[idx] = { ...newFields[idx], name: v };
                      updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                    }} placeholder="nombre" />
                    <InputField label="Etiqueta (label)" value={field.label || ''} onChange={(v) => {
                      const newFields = [...(sections.captureHero?.form?.fields || [])];
                      newFields[idx] = { ...newFields[idx], label: v };
                      updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                    }} placeholder="Nombre Completo" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase mb-1 block">Tipo</label>
                      <NativeSelect
                        value={field.type || 'text'}
                        onChange={(v) => {
                          const newFields = [...(sections.captureHero?.form?.fields || [])];
                          newFields[idx] = { ...newFields[idx], type: v };
                          updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                        }}
                        options={[
                          { value: 'text', label: 'Texto' },
                          { value: 'email', label: 'Email' },
                          { value: 'tel', label: 'Teléfono' },
                          { value: 'select', label: 'Selección' },
                          { value: 'textarea', label: 'Área de Texto' },
                          { value: 'checkbox', label: 'Checkbox' },
                          { value: 'radio', label: 'Radio' },
                        ]}
                      />
                    </div>
                    <InputField label="Placeholder" value={field.placeholder || ''} onChange={(v) => {
                      const newFields = [...(sections.captureHero?.form?.fields || [])];
                      newFields[idx] = { ...newFields[idx], placeholder: v };
                      updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                    }} placeholder="Tu nombre..." />
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={field.required || false} 
                          onChange={(e) => {
                            const newFields = [...(sections.captureHero?.form?.fields || [])];
                            newFields[idx] = { ...newFields[idx], required: e.target.checked };
                            updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                          }} 
                          className="w-4 h-4" 
                        />
                        <span className="text-xs text-white">Requerido</span>
                      </label>
                    </div>
                  </div>
                  
                  {field.type === 'select' && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <label className="text-[10px] text-gray-400 uppercase mb-2 block">Opciones</label>
                      <div className="space-y-2">
                        {(field.options || []).map((opt: string, optIdx: number) => (
                          <div key={optIdx} className="flex gap-2">
                            <input 
                              type="text" 
                              value={opt} 
                              onChange={(e) => {
                                const newOptions = [...(field.options || [])];
                                newOptions[optIdx] = e.target.value;
                                const newFields = [...(sections.captureHero?.form?.fields || [])];
                                newFields[idx] = { ...newFields[idx], options: newOptions };
                                updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                              }}
                              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                            />
                            <button onClick={() => {
                              const newOptions = [...(field.options || [])];
                              newOptions.splice(optIdx, 1);
                              const newFields = [...(sections.captureHero?.form?.fields || [])];
                              newFields[idx] = { ...newFields[idx], options: newOptions };
                              updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                            }} className="text-red-400 hover:text-red-300 px-2">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const newOptions = [...(field.options || []), ''];
                            const newFields = [...(sections.captureHero?.form?.fields || [])];
                            newFields[idx] = { ...newFields[idx], options: newOptions };
                            updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                          }}
                          className="w-full py-1 border border-dashed border-white/20 rounded-lg text-gray-400 hover:text-white text-xs"
                        >
                          + Agregar Opción
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
