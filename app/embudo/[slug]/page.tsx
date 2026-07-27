"use client";

import { use } from "react";
import { useTemplateBySlug } from "@/lib/hooks/useTemplate";
import { DynamicSections } from "@/components/layout/DynamicSections";
import { Header } from "@/components/sections/Header";
import { XpandFooter } from "@/components/sections/xpand/XpandFooter";
import { CustomHeader } from "@/components/sections/CustomHeader";
import { CustomFooter } from "@/components/sections/CustomFooter";
import { ConstructionLoader } from "@/components/ui/ConstructionLoader";
import { notFound } from "next/navigation";

export default function EmbudoPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { template, loading, error, getConfig } = useTemplateBySlug(resolvedParams.slug);
  const config = getConfig();

  if (loading) {
    return <ConstructionLoader />;
  }

  if (error || !template) {
    return (
      <main className="bg-black min-h-screen text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-4xl font-black mb-4">Embudo no encontrado</h1>
            <p className="text-gray-400 mb-8">El contenido que buscas no existe o ha sido eliminado.</p>
            <a 
              href="/" 
              className="px-8 py-4 bg-blis-red text-white rounded-2xl font-bold"
            >
              Volver al inicio
            </a>
          </div>
        </div>
        <XpandFooter />
      </main>
    );
  }

  if (template.tipo_contenido !== "funnel") {
    notFound();
  }

  const branding = config.branding;
  const showHeader = config.showHeader !== false;
  const showFooter = config.showFooter !== false;
  const useCustomHeader = config.customHeader?.enabled === true;
  const useCustomFooter = config.customFooter?.enabled === true;

  return (
    <main 
      className="min-h-screen text-white"
      style={{ backgroundColor: branding?.backgroundColor || '#000000' }}
    >
      {showHeader && useCustomHeader && config.customHeader && (
        <CustomHeader config={config.customHeader} />
      )}
      {showHeader && !useCustomHeader && (
        <Header />
      )}
      
      <DynamicSections 
        templateType="funnel"
        sectionOrder={template.sectionOrder}
        sectionVisibility={template.sectionVisibility}
        sections={template.secciones}
      />
      
      {showFooter && useCustomFooter && config.customFooter && (
        <CustomFooter config={config.customFooter} />
      )}
      {showFooter && !useCustomFooter && (
        <XpandFooter />
      )}
    </main>
  );
}