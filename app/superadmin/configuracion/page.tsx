"use client";

import { Loader2, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSiteConfig } from "./_hooks";
import {
  BrandingPanel,
  SiteInfoPanel,
  ColorsPanel,
  SeoPanel,
  SocialPanel,
  ContactPanel,
  FooterPanel,
} from "./_components";

export default function SiteConfigPage() {
  const {
    config,
    loading,
    saving,
    keywordsInput,
    setKeywordsInput,
    saveConfig,
    updateField,
  } = useSiteConfig();

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
            onClick={saveConfig}
            disabled={saving}
            className="px-5 py-2.5 bg-blis-red text-white text-sm font-bold rounded-xl hover:bg-blis-red/80 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <BrandingPanel config={config} updateField={updateField} />
        <SiteInfoPanel config={config} updateField={updateField} />
        <ColorsPanel config={config} updateField={updateField} />
        <SeoPanel config={config} updateField={updateField} keywordsInput={keywordsInput} setKeywordsInput={setKeywordsInput} />
        <SocialPanel config={config} updateField={updateField} />
        <ContactPanel config={config} updateField={updateField} />
        <FooterPanel config={config} updateField={updateField} />
      </div>
    </div>
  );
}
