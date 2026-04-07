"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2, Save, Upload, Palette, Globe, MapPin, CreditCard, Users, Crown, Check
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Empresa {
  id: string;
  slug: string;
  nombre: string;
  nombre_legal: string | null;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  color_primario: string;
  color_secundario: string;
  color_acento: string;
  moneda_base: string;
  monedas_activas: string[];
  idioma: string;
  zona_horaria: string;
  pais_fiscal: string;
  ruc: string | null;
  razon_social: string | null;
  direccion_fiscal: string | null;
  dominio_principal: string | null;
  dominios_alias: string[];
  activo: boolean;
  plan: string;
  plan_limite_usuarios: number;
  plan_limite_productos: number;
  plan_limite_almacenamiento: number;
}

interface EmpresaConfig {
  id: string;
  empresa_id: string;
  blog_activo: boolean;
  tienda_activa: boolean;
  academia_activa: boolean;
  referidos_activo: boolean;
  bliscoins_activo: boolean;
  envios_activo: boolean;
  envios_gratis_monto: number | null;
  coins_por_lectura: number;
  segundos_lectura: number;
  coins_registro: number;
  coins_referido: number;
}

const PAISES = [
  { codigo: 'PE', nombre: 'Perú 🇵🇪' },
  { codigo: 'MX', nombre: 'México 🇲🇽' },
  { codigo: 'CO', nombre: 'Colombia 🇨🇴' },
  { codigo: 'CL', nombre: 'Chile 🇨🇱' },
  { codigo: 'EC', nombre: 'Ecuador 🇪🇨' },
  { codigo: 'AR', nombre: 'Argentina 🇦🇷' },
  { codigo: 'ES', nombre: 'España 🇪🇸' },
  { codigo: 'US', nombre: 'Estados Unidos 🇺🇸' }
];

const MONEDAS = [
  { codigo: 'USD', nombre: 'USD - Dólar estadounidense' },
  { codigo: 'PEN', nombre: 'PEN - Sol peruano' },
  { codigo: 'MXN', nombre: 'MXN - Peso mexicano' },
  { codigo: 'COP', nombre: 'COP - Peso colombiano' },
  { codigo: 'CLP', nombre: 'CLP - Peso chileno' },
  { codigo: 'EUR', nombre: 'EUR - Euro' }
];

const PLANES = [
  { id: 'free', nombre: 'Free', limite_usuarios: 5, limite_productos: 50 },
  { id: 'starter', nombre: 'Starter', limite_usuarios: 20, limite_productos: 200 },
  { id: 'pro', nombre: 'Pro', limite_usuarios: 100, limite_productos: 1000 },
  { id: 'enterprise', nombre: 'Enterprise', limite_usuarios: 500, limite_productos: 5000 }
];

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 shadow-4xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          {icon}
        </div>
        <h2 className="text-lg font-black text-white uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

export default function EmpresasPage() {
  const { showToast } = useToast();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [config, setConfig] = useState<EmpresaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmpresa();
  }, []);

  const fetchEmpresa = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/empresa');
      const data = await response.json();
      if (data.success) {
        setEmpresa(data.empresa);
        setConfig(data.config);
      }
    } catch {
      showToast('Error al cargar datos de la empresa', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!empresa) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, config })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Cambios guardados exitosamente', 'success');
      } else {
        showToast(data.error || 'Error al guardar', 'error');
      }
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full mx-auto pb-20 px-4 md:px-8 pt-8 bg-black min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">
            Empresas
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">
            Configura los datos de tu empresa, branding y funcionalidades.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-blis-red text-white px-8 py-4 sm:py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center shrink-0 gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)] mt-4 sm:mt-0 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Identidad" icon={<Building2 className="w-5 h-5 text-blue-500" />}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Nombre Comercial">
                <input
                  type="text"
                  value={empresa?.nombre || ''}
                  onChange={(e) => setEmpresa(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50"
                />
              </Field>
              <Field label="Nombre Legal">
                <input
                  type="text"
                  value={empresa?.nombre_legal || ''}
                  onChange={(e) => setEmpresa(prev => prev ? { ...prev, nombre_legal: e.target.value } : null)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50"
                />
              </Field>
            </div>
            <Field label="Slug (URL)">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm whitespace-nowrap">misitio.com/</span>
                <input
                  type="text"
                  value={empresa?.slug || ''}
                  onChange={(e) => setEmpresa(prev => prev ? { ...prev, slug: e.target.value } : null)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Logo Principal">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                    {empresa?.logo_url ? (
                      <img src={empresa.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={empresa?.logo_url || ''}
                    onChange={(e) => setEmpresa(prev => prev ? { ...prev, logo_url: e.target.value } : null)}
                    placeholder="URL del logo..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </Field>
              <Field label="Logo Dark">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                    {empresa?.logo_dark_url ? (
                      <img src={empresa.logo_dark_url} alt="Logo Dark" className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={empresa?.logo_dark_url || ''}
                    onChange={(e) => setEmpresa(prev => prev ? { ...prev, logo_dark_url: e.target.value } : null)}
                    placeholder="URL del logo dark..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </Field>
              <Field label="Favicon">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                    {empresa?.favicon_url ? (
                      <img src={empresa.favicon_url} alt="Favicon" className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={empresa?.favicon_url || ''}
                    onChange={(e) => setEmpresa(prev => prev ? { ...prev, favicon_url: e.target.value } : null)}
                    placeholder="URL del favicon..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Colores" icon={<Palette className="w-5 h-5 text-purple-500" />}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Color Primario">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={empresa?.color_primario || '#B10D24'}
                    onChange={(e) => setEmpresa(prev => prev ? { ...prev, color_primario: e.target.value } : null)}
                    className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={empresa?.color_primario || ''}
                    onChange={(e) => setEmpresa(prev => prev ? { ...prev, color_primario: e.target.value } : null)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </Field>
              <Field label="Color Secundario">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={empresa?.color_secundario || '#000000'}
                    onChange={(e) => setEmpresa(prev => prev ? { ...prev, color_secundario: e.target.value } : null)}
                    className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={empresa?.color_secundario || ''}
                    onChange={(e) => setEmpresa(prev => prev ? { ...prev, color_secundario: e.target.value } : null)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </Field>
              <Field label="Color Acento">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={empresa?.color_acento || '#10B981'}
                    onChange={(e) => setEmpresa(prev => prev ? { ...prev, color_acento: e.target.value } : null)}
                    className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={empresa?.color_acento || ''}
                    onChange={(e) => setEmpresa(prev => prev ? { ...prev, color_acento: e.target.value } : null)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </Field>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-white/5">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Vista Previa</div>
              <div className="flex items-center gap-4">
                <div className="px-6 py-3 rounded-xl font-black text-sm" style={{ backgroundColor: empresa?.color_primario, color: '#fff' }}>
                  Botón Primario
                </div>
                <div className="px-6 py-3 rounded-xl font-black text-sm border" style={{ backgroundColor: empresa?.color_secundario, borderColor: empresa?.color_primario }}>
                  Botón Secundario
                </div>
                <div className="px-6 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: empresa?.color_acento, color: '#fff' }}>
                  Acento
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Regional" icon={<Globe className="w-5 h-5 text-green-500" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="País Fiscal">
              <select
                value={empresa?.pais_fiscal || 'PE'}
                onChange={(e) => setEmpresa(prev => prev ? { ...prev, pais_fiscal: e.target.value } : null)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
              >
                {PAISES.map(pais => (
                  <option key={pais.codigo} value={pais.codigo}>{pais.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Idioma">
              <select
                value={empresa?.idioma || 'es'}
                onChange={(e) => setEmpresa(prev => prev ? { ...prev, idioma: e.target.value } : null)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </Field>
            <Field label="Moneda Base">
              <select
                value={empresa?.moneda_base || 'USD'}
                onChange={(e) => setEmpresa(prev => prev ? { ...prev, moneda_base: e.target.value } : null)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
              >
                {MONEDAS.map(moneda => (
                  <option key={moneda.codigo} value={moneda.codigo}>{moneda.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Zona Horaria">
              <select
                value={empresa?.zona_horaria || 'America/Lima'}
                onChange={(e) => setEmpresa(prev => prev ? { ...prev, zona_horaria: e.target.value } : null)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
              >
                <option value="America/Lima">Lima (UTC-5)</option>
                <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                <option value="America/Bogota">Bogotá (UTC-5)</option>
                <option value="America/Santiago">Santiago (UTC-4)</option>
                <option value="America/Guayaquil">Guayaquil (UTC-5)</option>
                <option value="America/New_York">New York (UTC-5)</option>
                <option value="Europe/Madrid">Madrid (UTC+1)</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Datos Fiscales" icon={<CreditCard className="w-5 h-5 text-amber-500" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="RUC / NIT / RFC">
              <input
                type="text"
                value={empresa?.ruc || ''}
                onChange={(e) => setEmpresa(prev => prev ? { ...prev, ruc: e.target.value } : null)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50"
              />
            </Field>
            <Field label="Razón Social">
              <input
                type="text"
                value={empresa?.razon_social || ''}
                onChange={(e) => setEmpresa(prev => prev ? { ...prev, razon_social: e.target.value } : null)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50"
              />
            </Field>
            <Field label="Dirección Fiscal" className="md:col-span-2">
              <input
                type="text"
                value={empresa?.direccion_fiscal || ''}
                onChange={(e) => setEmpresa(prev => prev ? { ...prev, direccion_fiscal: e.target.value } : null)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50"
              />
            </Field>
          </div>
        </Section>

        <Section title="Plan y Límites" icon={<Crown className="w-5 h-5 text-amber-500" />}>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-white/5">
              <div className="px-4 py-2 rounded-xl bg-blis-red/20 text-blis-red font-bold uppercase tracking-wider text-sm">
                {PLANES.find(p => p.id === empresa?.plan)?.nombre || empresa?.plan}
              </div>
              <div className="text-gray-400 text-sm">
                Plan actual
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="text-2xl font-black text-white">{empresa?.plan_limite_usuarios || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Usuarios</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="text-2xl font-black text-white">{empresa?.plan_limite_productos || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Productos</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="text-2xl font-black text-white">{((empresa?.plan_limite_almacenamiento || 0) / 1024 / 1024 / 1024).toFixed(1)} GB</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Almacenamiento</div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Funcionalidades" icon={<Users className="w-5 h-5 text-purple-500" />}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'blog_activo', label: 'Blog' },
              { key: 'tienda_activa', label: 'Tienda' },
              { key: 'academia_activa', label: 'Academia' },
              { key: 'referidos_activo', label: 'Referidos' },
              { key: 'bliscoins_activo', label: 'BlisCoins' },
              { key: 'envios_activo', label: 'Envíos' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 cursor-pointer transition-colors">
                <span className="text-white text-sm font-medium">{label}</span>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${config?.[key as keyof EmpresaConfig] ? 'bg-blis-red border-blis-red' : 'border-white/20'}`}>
                  {config?.[key as keyof EmpresaConfig] && <Check className="w-3 h-3 text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={config?.[key as keyof EmpresaConfig] as boolean || false}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, [key]: e.target.checked } : null)}
                  className="hidden"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">BlisCoins</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Coins por Lectura">
                <input
                  type="number"
                  value={config?.coins_por_lectura || 0}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, coins_por_lectura: parseInt(e.target.value) || 0 } : null)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                />
              </Field>
              <Field label="Segundos Lectura">
                <input
                  type="number"
                  value={config?.segundos_lectura || 0}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, segundos_lectura: parseInt(e.target.value) || 0 } : null)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                />
              </Field>
              <Field label="Coins Registro">
                <input
                  type="number"
                  value={config?.coins_registro || 0}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, coins_registro: parseInt(e.target.value) || 0 } : null)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                />
              </Field>
              <Field label="Coins Referido">
                <input
                  type="number"
                  value={config?.coins_referido || 0}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, coins_referido: parseInt(e.target.value) || 0 } : null)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                />
              </Field>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}