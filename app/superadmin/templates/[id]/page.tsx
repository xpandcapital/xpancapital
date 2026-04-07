"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Save, ArrowLeft, Loader2, ChevronRight, ChevronUp, ChevronDown, Palette, Users, MapPin, 
  MessageSquare, HelpCircle, Briefcase, DollarSign, Image as ImageIcon,
  Layout, TrendingUp, Calculator, FileText, Globe, Folder,
  Link as LinkIcon, Video, Eye, EyeOff, Plus, Trash2, VideoIcon, FolderOpen,
  CheckCircle, Clock, Star, Award, Building2, Calendar, Sparkles, Settings, Type, Megaphone, Bell, Package
} from "lucide-react";
import { useTemplates, TipoContenido } from "@/lib/hooks/useTemplates";
import { useCampanas, useAsesores } from "@/lib/hooks/useCampanas";
import { useToast } from "@/components/ui/Toast";
import { ImageUpload } from "@/components/editor/ImageUpload";

interface SectionConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const LANDING_SECTIONS: SectionConfig[] = [
  { key: 'hero', label: 'Inicio', icon: <Layout className="w-4 h-4" /> },
  { key: 'about', label: 'Trayectoria', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'video', label: 'Nuestra Visión', icon: <Video className="w-4 h-4" /> },
  { key: 'process', label: 'Metodología', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'operations', label: 'Backstage', icon: <Globe className="w-4 h-4" /> },
  { key: 'market', label: 'Mercado', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'calculator', label: 'Calculadora', icon: <Calculator className="w-4 h-4" /> },
  { key: 'map', label: 'Dominio Territorial', icon: <MapPin className="w-4 h-4" /> },
  { key: 'projects', label: 'Portafolio', icon: <Folder className="w-4 h-4" /> },
  { key: 'catalog', label: 'Tienda', icon: <FileText className="w-4 h-4" /> },
  { key: 'team', label: 'Equipo', icon: <Users className="w-4 h-4" /> },
  { key: 'testimonials', label: 'Testimonios', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
  { key: 'blog', label: 'Blog', icon: <FileText className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

const THANKYOU_SECTIONS: SectionConfig[] = [
  { key: 'thankYouHero', label: 'Hero de Gracias', icon: <CheckCircle className="w-4 h-4" /> },
  { key: 'thankYouNextSteps', label: 'Próximos Pasos', icon: <ArrowLeft className="w-4 h-4" /> },
  { key: 'funnelCTA', label: 'CTA Final', icon: <Sparkles className="w-4 h-4" /> },
  { key: 'stats', label: 'Estadísticas', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

const FUNNEL_SECTIONS: SectionConfig[] = [
  { key: 'funnelHero', label: 'Hero Principal', icon: <Layout className="w-4 h-4" /> },
  { key: 'funnelCountdown', label: 'Contador', icon: <Clock className="w-4 h-4" /> },
  { key: 'funnelVideo', label: 'Video', icon: <Video className="w-4 h-4" /> },
  { key: 'funnelBenefits', label: 'Beneficios', icon: <Star className="w-4 h-4" /> },
  { key: 'stats', label: 'Estadísticas', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'funnelTestimonials', label: 'Testimonios', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'funnelPricing', label: 'Precios', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'funnelCTA', label: 'CTA Final', icon: <Sparkles className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

const CAPTURE_SECTIONS: SectionConfig[] = [
  { key: 'captureHero', label: 'Hero con Formulario', icon: <Layout className="w-4 h-4" /> },
  { key: 'funnelVideo', label: 'Video', icon: <Video className="w-4 h-4" /> },
  { key: 'funnelBenefits', label: 'Beneficios', icon: <Star className="w-4 h-4" /> },
  { key: 'stats', label: 'Estadísticas', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'funnelTestimonials', label: 'Testimonios', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'content', label: 'Contenido', icon: <FileText className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

const BLOG_SECTIONS: SectionConfig[] = [
  { key: 'blogHero', label: 'Hero de Blog', icon: <Layout className="w-4 h-4" /> },
  { key: 'blogPosts', label: 'Últimos Artículos', icon: <FileText className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

const TIENDA_SECTIONS: SectionConfig[] = [
  { key: 'shopHero', label: 'Hero de Tienda', icon: <Layout className="w-4 h-4" /> },
  { key: 'shopCategories', label: 'Categorías', icon: <Folder className="w-4 h-4" /> },
  { key: 'shopSidebar', label: 'Sidebar (Filtros)', icon: <Layout className="w-4 h-4" /> },
  { key: 'shopProducts', label: 'Productos', icon: <Package className="w-4 h-4" /> },
  { key: 'shopUrgency', label: 'Barra de Urgencia', icon: <Clock className="w-4 h-4" /> },
  { key: 'shopNotifications', label: 'Notificaciones Live', icon: <Bell className="w-4 h-4" /> },
  { key: 'footer', label: 'Footer', icon: <Palette className="w-4 h-4" /> },
];

const SECTIONS_BY_TYPE: Record<string, SectionConfig[]> = {
  landing: LANDING_SECTIONS,
  thankyou: THANKYOU_SECTIONS,
  funnel: FUNNEL_SECTIONS,
  captura: CAPTURE_SECTIONS,
  blog: LANDING_SECTIONS,
  blog_post: LANDING_SECTIONS,
  tienda: LANDING_SECTIONS,
  producto: LANDING_SECTIONS,
  curso: LANDING_SECTIONS,
  leccion: LANDING_SECTIONS,
  proyecto: LANDING_SECTIONS,
  checkout: LANDING_SECTIONS,
};

const CONFIG_SECTION: SectionConfig = { key: 'config', label: 'Configuración', icon: <Settings className="w-4 h-4" /> };

const ICON_OPTIONS_SPANISH: Record<string, string> = {
  'TrendingUp': 'Tendencia Al alza',
  'Shield': 'Escudo',
  'Users': 'Usuarios',
  'Clock': 'Reloj',
  'Zap': 'Rayo',
  'Award': 'Premio',
  'Star': 'Estrella',
  'Check': 'Check',
  'Mail': 'Email',
  'Phone': 'Teléfono',
  'Calendar': 'Calendario',
  'MapPin': 'Ubicación',
  'Building2': 'Edificio',
  'Target': 'Objetivo',
};

const ICON_OPTIONS = Object.keys(ICON_OPTIONS_SPANISH);

interface TemplateData {
  id: string;
  nombre: string;
  slug: string;
  tipo_contenido: string;
  estado: string;
  secciones: Record<string, any>;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  config?: {
    showHeader?: boolean;
    customHeader?: {
      enabled?: boolean;
      logo?: string;
      logoLink?: string;
      backgroundColor?: string;
      textColor?: string;
      links?: Array<{ text: string; href: string; external?: boolean }>;
      cta?: { text: string; href: string; style: 'primary' | 'secondary' };
    };
    showFooter?: boolean;
    customFooter?: {
      enabled?: boolean;
      logo?: string;
      description?: string;
      backgroundColor?: string;
      textColor?: string;
      links?: Array<{ label: string; href: string }>;
      socials?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
        tiktok?: string;
      };
      copyright?: string;
    };
    branding?: {
      name?: string;
      primaryColor?: string;
      secondaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      accentColor?: string;
    };
  };
}

function getSectionsForType(tipo: string): SectionConfig[] {
  return SECTIONS_BY_TYPE[tipo] || LANDING_SECTIONS;
}

function InputField({ label, value, onChange, placeholder = '', type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blis-red outline-none transition-colors"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 3, placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div className="mt-2">
      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blis-red outline-none transition-colors resize-none"
      />
    </div>
  );
}

function LinkField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/ruta o https://..."
        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blis-red outline-none transition-colors"
      />
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blis-red outline-none"
        />
      </div>
    </div>
  );
}

function SectionCard({ title, dimension, children }: { title: string; dimension?: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {dimension && <span className="text-xs text-gray-500">{dimension}</span>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function VisibilityToggle({ section, isVisible, onToggle }: { section: string; isVisible: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isVisible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}
      >
        {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        {isVisible ? 'Visible' : 'Oculto'}
      </button>
    </div>
  );
}

export default function TemplateEditorPage() {
  const params = useParams();
  const { showToast } = useToast();
  const { getTemplate, updateTemplate } = useTemplates();
  const { campanas, loading: loadingCampanas } = useCampanas();
  const { asesores, loading: loadingAsesores } = useAsesores();
  
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('config');
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  const [templateConfig, setTemplateConfig] = useState<TemplateData['config']>({
    showHeader: true,
    showFooter: true,
    branding: {
      name: 'BLIS Corp',
      primaryColor: '#B10D24',
      secondaryColor: '#10B981',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#B10D24',
    }
  });

  useEffect(() => {
    loadTemplate();
  }, [params.id]);

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTemplate(params.id as string);
      if (data) {
        setTemplate(data as TemplateData);
        const sectionsForType = getSectionsForType((data as any).tipo_contenido);
        const defaultOrder = sectionsForType.map(s => s.key);
        setSectionOrder((data as any).sectionOrder || defaultOrder);
        setSectionVisibility((data as any).sectionVisibility || {});
        if ((data as any).config) {
          setTemplateConfig((data as any).config);
        }
        if (sectionsForType.length > 0) {
          setActiveSection('config');
        }
      }
    } catch {
      showToast('Error al cargar el template', 'error');
    } finally {
      setLoading(false);
    }
  }, [params.id, getTemplate]);

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      await updateTemplate(template.id, { 
        secciones: template.secciones,
        sectionOrder,
        sectionVisibility,
        config: templateConfig
      });
      showToast('Template guardado correctamente', 'success');
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section: string, data: any) => {
    setTemplate((prev: TemplateData | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        secciones: {
          ...prev.secciones,
          [section]: {
            ...(prev.secciones?.[section] || {}),
            ...data
          }
        }
      };
    });
  };

  const updateArrayItem = (section: string, arrayKey: string, index: number, data: any) => {
    setTemplate((prev: TemplateData | null) => {
      if (!prev) return prev;
      const sectionData = prev.secciones?.[section] || {};
      const array = [...(sectionData[arrayKey] || [])];
      array[index] = { ...array[index], ...data };
      return {
        ...prev,
        secciones: { ...prev.secciones, [section]: { ...sectionData, [arrayKey]: array } }
      };
    });
  };

  const addArrayItem = (section: string, arrayKey: string, defaultItem: any) => {
    setTemplate((prev: TemplateData | null) => {
      if (!prev) return prev;
      const sectionData = prev.secciones?.[section] || {};
      const array = [...(sectionData[arrayKey] || []), defaultItem];
      return {
        ...prev,
        secciones: { ...prev.secciones, [section]: { ...sectionData, [arrayKey]: array } }
      };
    });
  };

  const removeArrayItem = (section: string, arrayKey: string, index: number) => {
    setTemplate((prev: TemplateData | null) => {
      if (!prev) return prev;
      const sectionData = prev.secciones?.[section] || {};
      const array = [...(sectionData[arrayKey] || [])];
      array.splice(index, 1);
      return {
        ...prev,
        secciones: { ...prev.secciones, [section]: { ...sectionData, [arrayKey]: array } }
      };
    });
  };

  const moveSectionUp = (sectionKey: string) => {
    const currentIndex = sectionOrder.indexOf(sectionKey);
    if (currentIndex > 0) {
      const newOrder = [...sectionOrder];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      setSectionOrder(newOrder);
    }
  };

  const moveSectionDown = (sectionKey: string) => {
    const currentIndex = sectionOrder.indexOf(sectionKey);
    if (currentIndex < sectionOrder.length - 1) {
      const newOrder = [...sectionOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      setSectionOrder(newOrder);
    }
  };

  const toggleSectionVisibility = (sectionKey: string) => {
    setSectionVisibility(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === false ? true : false
    }));
  };

  const isSectionVisible = (sectionKey: string) => {
    return sectionVisibility[sectionKey] !== false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
        <p className="text-gray-400">Template no encontrado</p>
        <Link href="/superadmin/templates" className="px-4 py-2 bg-blis-red text-white rounded-xl">Volver</Link>
      </div>
    );
  }

  const sections = template.secciones || {};
  const sectionsConfig = getSectionsForType(template.tipo_contenido);

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <div className="w-56 bg-zinc-950 border-r border-white/5 fixed h-screen overflow-y-auto">
        <div className="p-4 border-b border-white/5">
          <Link href="/superadmin/templates" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
        
        <div className="p-4">
          <h2 className="text-white font-bold text-sm truncate">{template.nombre}</h2>
          <p className="text-gray-500 text-xs">{template.tipo_contenido}</p>
        </div>
        
        <div className="p-2">
          <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2">Configuración</div>
          <button
            onClick={() => setActiveSection('config')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeSection === 'config' ? 'bg-blis-red/20 text-white' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Branding y Layout</span>
          </button>
          
          <div className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2 mt-6">Secciones</div>
          {sectionOrder.map((key, index) => {
            const config = sectionsConfig.find(s => s.key === key);
            if (!config) return null;
            const isVisible = isSectionVisible(key);
            const isActive = activeSection === key;
            
            return (
              <div key={key} className={`group flex items-center gap-1 rounded-lg mb-0.5 ${isActive ? 'bg-blis-red/20' : 'hover:bg-white/5'}`}>
                <button
                  onClick={() => setActiveSection(key)}
                  className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isActive ? 'text-white' : !isVisible ? 'text-gray-600 line-through' : 'text-gray-400'
                  }`}
                >
                  {config.icon}
                  <span className="flex-1 text-left truncate">{config.label}</span>
                </button>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                  <button onClick={() => moveSectionUp(key)} disabled={index === 0} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => moveSectionDown(key)} disabled={index === sectionOrder.length - 1} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button onClick={() => toggleSectionVisibility(key)} className={`p-1 hover:bg-white/10 rounded ${!isVisible ? 'text-red-400' : ''}`}>
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 ml-56">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>{sectionsConfig.find(s => s.key === activeSection)?.label}</span>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blis-red text-white text-sm font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar</>}
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* CONFIG PANEL */}
          {activeSection === 'config' && (
            <div className="space-y-6">
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
                  
                  <div className="grid grid-cols-3 gap-4">
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
                          <select 
                            value={templateConfig?.customHeader?.cta?.style || 'primary'} 
                            onChange={(e) => setTemplateConfig(prev => ({
                              ...prev,
                              customHeader: { ...prev?.customHeader, cta: { ...prev?.customHeader?.cta, style: e.target.value as 'primary' | 'secondary' } as any }
                            }))} 
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                          >
                            <option value="primary">Primario</option>
                            <option value="secondary">Secundario</option>
                          </select>
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
          )}
          
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
                    <select 
                      value={sections.captureHero?.form?.campana_id || ''} 
                      onChange={(e) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), campana_id: e.target.value } })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                      disabled={loadingCampanas}
                    >
                      <option value="">{loadingCampanas ? 'Cargando...' : 'Seleccionar campaña...'}</option>
                      {campanas?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">La campaña define a quién se notifica</p>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase mb-1 block">
                      <Users className="w-3 h-3 inline mr-1" />
                      Asesor Asignado
                    </label>
                    <select 
                      value={sections.captureHero?.form?.asesor_id || ''} 
                      onChange={(e) => updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), asesor_id: e.target.value } })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                      disabled={loadingAsesores}
                    >
                      <option value="">{loadingAsesores ? 'Cargando...' : 'Sin asesor específico'}</option>
                      {asesores?.filter((a: any) => a.activo !== false).map((a: any) => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                      ))}
                    </select>
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
                              <select value={field.type || 'text'} onChange={(e) => {
                                const newFields = [...(sections.captureHero?.form?.fields || [])];
                                newFields[idx] = { ...newFields[idx], type: e.target.value };
                                updateSection('captureHero', { form: { ...(sections.captureHero?.form || {}), fields: newFields } });
                              }} className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-2 text-xs text-white">
                                <option value="text">Texto</option>
                                <option value="email">Email</option>
                                <option value="tel">Teléfono</option>
                                <option value="select">Selección</option>
                                <option value="textarea">Área de Texto</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="radio">Radio</option>
                              </select>
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
            </SectionCard>
          )}

          {/* TIENDA SECTIONS */}
          {activeSection === 'shopHero' && (
            <SectionCard title="Hero Carrusel Tienda">
              <VisibilityToggle section="shopHero" isVisible={isSectionVisible('shopHero')} onToggle={() => toggleSectionVisibility('shopHero')} />
              <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-gray-500">Este carrusel rota de forma automática para mostrar las ofertas más importantes de tu tienda.</p>
              </div>
            </SectionCard>
          )}

          {activeSection === 'shopCategories' && (
            <SectionCard title="Deslizador de Categorías">
              <VisibilityToggle section="shopCategories" isVisible={isSectionVisible('shopCategories')} onToggle={() => toggleSectionVisibility('shopCategories')} />
              <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-gray-500">Extrae y desliza automáticamente por tus categorías de productos activas.</p>
              </div>
            </SectionCard>
          )}

          {activeSection === 'shopSidebar' && (
            <SectionCard title="Sidebar / Filtros">
              <VisibilityToggle section="shopSidebar" isVisible={isSectionVisible('shopSidebar')} onToggle={() => toggleSectionVisibility('shopSidebar')} />
              <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-gray-500">Muestra listado de sub-categorías, rangos de precio, etc.</p>
              </div>
            </SectionCard>
          )}

          {activeSection === 'shopProducts' && (
            <SectionCard title="Grilla de Productos">
              <VisibilityToggle section="shopProducts" isVisible={isSectionVisible('shopProducts')} onToggle={() => toggleSectionVisibility('shopProducts')} />
              <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-gray-500">Se integra con tu inventario de productos de forma automática.</p>
              </div>
            </SectionCard>
          )}

          {activeSection === 'shopUrgency' && (
            <SectionCard title="Barra de Urgencia">
              <VisibilityToggle section="shopUrgency" isVisible={isSectionVisible('shopUrgency')} onToggle={() => toggleSectionVisibility('shopUrgency')} />
              <InputField label="Texto Finaliza En" value={sections.shopUrgency?.endText || ''} onChange={(v) => updateSection('shopUrgency', { endText: v })} placeholder="La oferta finaliza en:" />
              <InputField label="Fecha de Cierre" value={sections.shopUrgency?.endDate || ''} onChange={(v) => updateSection('shopUrgency', { endDate: v })} placeholder="2026-12-31T23:59:59" />
            </SectionCard>
          )}

          {activeSection === 'shopNotifications' && (
            <SectionCard title="Notificación Social (Popups)">
              <VisibilityToggle section="shopNotifications" isVisible={isSectionVisible('shopNotifications')} onToggle={() => toggleSectionVisibility('shopNotifications')} />
              <div className="mt-4 p-4 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-gray-500">Muestra pequeñas ventanas emulando compras en tiempo real de nuevos clientes para generar social proof.</p>
              </div>
            </SectionCard>
          )}

          {/* FOOTER */}
          {activeSection === 'footer' && (
            <SectionCard title="Footer">
              <VisibilityToggle section="footer" isVisible={isSectionVisible('footer')} onToggle={() => toggleSectionVisibility('footer')} />
              <TextAreaField label="Descripción" value={sections.footer?.description || ''} onChange={(v) => updateSection('footer', { description: v })} rows={2} />
              <InputField label="Copyright" value={sections.footer?.copyright || ''} onChange={(v) => updateSection('footer', { copyright: v })} placeholder="© 2026 Blis Corp." />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}