"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, Loader2, Image as ImageIcon, Palette, Globe, Share2, 
  Mail, Phone, MapPin, ChevronLeft, Upload
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { ImageUpload } from "@/components/editor/ImageUpload";

interface SiteConfig {
  id: string;
  site_name: string;
  site_tagline: string;
  logo_horizontal: string;
  logo_vertical: string;
  logo_horizontal_light: string;
  logo_vertical_light: string;
  favicon: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  og_image: string;
  social_instagram: string;
  social_facebook: string;
  social_youtube: string;
  social_tiktok: string;
  social_linkedin: string;
  social_twitter: string;
  social_whatsapp: string;
  footer_description: string;
  footer_copyright: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

const defaultConfig: SiteConfig = {
  id: '',
  site_name: 'BLIS Corp',
  site_tagline: 'Luxury Tech Real Estate',
  logo_horizontal: '',
  logo_vertical: '',
  logo_horizontal_light: '',
  logo_vertical_light: '',
  favicon: '',
  primary_color: '#B10D24',
  secondary_color: '#10B981',
  background_color: '#000000',
  text_color: '#FFFFFF',
  accent_color: '#B10D24',
  meta_title: '',
  meta_description: '',
  meta_keywords: [],
  og_image: '',
  social_instagram: '',
  social_facebook: '',
  social_youtube: '',
  social_tiktok: '',
  social_linkedin: '',
  social_twitter: '',
  social_whatsapp: '',
  footer_description: '',
  footer_copyright: '© 2026 BLIS Corp. Todos los derechos reservados.',
  contact_email: '',
  contact_phone: '',
  contact_address: ''
};

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blis-red focus:outline-none transition-colors"
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
        />
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <Icon className="w-5 h-5 text-blis-red" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6 space-y-5">
        {children}
      </div>
    </motion.div>
  );
}

export default function SiteConfigPage() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    setKeywordsInput((config.meta_keywords || []).join(', '));
  }, [config.meta_keywords]);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/site-config');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig({ ...defaultConfig, ...data.data });
      }
    } catch (error) {
      showToast('Error al cargar configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Configuración guardada', 'success');
      } else {
        showToast(data.error || 'Error al guardar', 'error');
      }
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof SiteConfig>(field: K, value: SiteConfig[K]) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/superadmin" className="text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">Configuración del Sitio</h1>
              <p className="text-xs text-gray-500">Logos, colores, SEO y redes sociales</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blis-red text-white text-sm font-bold rounded-xl hover:bg-blis-red/80 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* Branding - Logos */}
        <SectionCard title="Logos y Branding" icon={ImageIcon}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Logo Horizontal (Header)</h4>
              <ImageUpload
                value={config.logo_horizontal}
                onChange={(v) => updateField('logo_horizontal', v)}
                folder="cms/branding"
              />
              <p className="text-[10px] text-gray-500">Logo principal para fondo oscuro (header)</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Logo Vertical (Footer)</h4>
              <ImageUpload
                value={config.logo_vertical}
                onChange={(v) => updateField('logo_vertical', v)}
                folder="cms/branding"
              />
              <p className="text-[10px] text-gray-500">Logo para footer y fondos claros</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Favicon</h4>
              <ImageUpload
                value={config.favicon}
                onChange={(v) => updateField('favicon', v)}
                folder="cms/branding"
              />
              <p className="text-[10px] text-gray-500">32x32 o 64x64px</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Logo Horizontal Light</h4>
              <ImageUpload
                value={config.logo_horizontal_light}
                onChange={(v) => updateField('logo_horizontal_light', v)}
                folder="cms/branding"
              />
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Logo Vertical Light</h4>
              <ImageUpload
                value={config.logo_vertical_light}
                onChange={(v) => updateField('logo_vertical_light', v)}
                folder="cms/branding"
              />
            </div>
          </div>
        </SectionCard>

        {/* Site Info */}
        <SectionCard title="Información del Sitio" icon={Globe}>
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

        {/* Colors */}
        <SectionCard title="Colores de Marca" icon={Palette}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <ColorField label="Primario" value={config.primary_color} onChange={(v) => updateField('primary_color', v)} />
            <ColorField label="Secundario" value={config.secondary_color} onChange={(v) => updateField('secondary_color', v)} />
            <ColorField label="Fondo" value={config.background_color} onChange={(v) => updateField('background_color', v)} />
            <ColorField label="Texto" value={config.text_color} onChange={(v) => updateField('text_color', v)} />
            <ColorField label="Acento" value={config.accent_color} onChange={(v) => updateField('accent_color', v)} />
          </div>
        </SectionCard>

        {/* SEO */}
        <SectionCard title="SEO y Metadatos" icon={Globe}>
          <div className="space-y-6">
            <InputField
              label="Título (meta)"
              value={config.meta_title}
              onChange={(v) => updateField('meta_title', v)}
              placeholder="BLIS Corp | Luxury Tech Real Estate"
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
                setKeywordsInput(v);
                updateField('meta_keywords', v.split(',').map(k => k.trim()).filter(Boolean));
              }}
              placeholder="inmobiliaria, terrenos, inversiones, ecuador"
            />
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Imagen OG (Open Graph)</h4>
              <ImageUpload
                value={config.og_image}
                onChange={(v) => updateField('og_image', v)}
                folder="cms/seo"
              />
              <p className="text-[10px] text-gray-500">Imagen para compartir en redes sociales (1200x630px recomendado)</p>
            </div>
          </div>
        </SectionCard>

        {/* Social */}
        <SectionCard title="Redes Sociales" icon={Share2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InputField
              label="Instagram"
              value={config.social_instagram}
              onChange={(v) => updateField('social_instagram', v)}
              placeholder="https://instagram.com/bliscorp"
            />
            <InputField
              label="Facebook"
              value={config.social_facebook}
              onChange={(v) => updateField('social_facebook', v)}
              placeholder="https://facebook.com/bliscorp"
            />
            <InputField
              label="YouTube"
              value={config.social_youtube}
              onChange={(v) => updateField('social_youtube', v)}
              placeholder="https://youtube.com/@bliscorp"
            />
            <InputField
              label="TikTok"
              value={config.social_tiktok}
              onChange={(v) => updateField('social_tiktok', v)}
              placeholder="https://tiktok.com/@bliscorp"
            />
            <InputField
              label="LinkedIn"
              value={config.social_linkedin}
              onChange={(v) => updateField('social_linkedin', v)}
              placeholder="https://linkedin.com/company/bliscorp"
            />
            <InputField
              label="X (Twitter)"
              value={config.social_twitter}
              onChange={(v) => updateField('social_twitter', v)}
              placeholder="https://x.com/bliscorp"
            />
            <InputField
              label="WhatsApp"
              value={config.social_whatsapp}
              onChange={(v) => updateField('social_whatsapp', v)}
              placeholder="https://wa.me/593999999999"
            />
          </div>
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Contacto" icon={Mail}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="Email"
              type="email"
              value={config.contact_email}
              onChange={(v) => updateField('contact_email', v)}
              placeholder="contacto@bliscorp.com"
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

        {/* Footer */}
        <SectionCard title="Footer" icon={Globe}>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Descripción del Footer</label>
              <textarea
                value={config.footer_description}
                onChange={(e) => updateField('footer_description', e.target.value)}
                placeholder="Somos la firma élite en desarrollo de software y tecnología real estate."
                rows={3}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blis-red focus:outline-none transition-colors resize-none"
              />
            </div>
            <InputField
              label="Copyright"
              value={config.footer_copyright}
              onChange={(v) => updateField('footer_copyright', v)}
              placeholder="© 2026 BLIS Corp. Todos los derechos reservados."
            />
          </div>
        </SectionCard>

      </div>
    </div>
  );
}