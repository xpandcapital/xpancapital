"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, Loader2, Menu, X } from "lucide-react";
import { useTemplateEditor } from "./_hooks";
import { getSectionsForType } from "./_types";
import { TemplateSidebar, ConfigPanel, EditorRouter } from "./_components";

export default function TemplateEditorPage() {
  const {
    template,
    setTemplate,
    loading,
    saving,
    activeSection,
    setActiveSection,
    sectionOrder,
    projects,
    templateConfig,
    setTemplateConfig,
    campanas,
    loadingCampanas,
    asesores,
    loadingAsesores,
    showToast,
    handleSave,
    updateSection,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    moveSectionUp,
    moveSectionDown,
    toggleSectionVisibility,
    isSectionVisible,
  } = useTemplateEditor();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      {/* Desktop sidebar: always visible */}
      <div className="hidden lg:block fixed left-0 top-20 bottom-0 z-30">
        <TemplateSidebar
          template={template}
          sectionsConfig={sectionsConfig}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sectionOrder={sectionOrder}
          moveSectionUp={moveSectionUp}
          moveSectionDown={moveSectionDown}
          toggleSectionVisibility={toggleSectionVisibility}
          isSectionVisible={isSectionVisible}
          mobileOpen={false}
          onClose={() => {}}
        />
      </div>

      {/* Mobile sidebar: overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <TemplateSidebar
              template={template}
              sectionsConfig={sectionsConfig}
              activeSection={activeSection}
              setActiveSection={(s) => { setActiveSection(s); setMobileSidebarOpen(false); }}
              sectionOrder={sectionOrder}
              moveSectionUp={moveSectionUp}
              moveSectionDown={moveSectionDown}
              toggleSectionVisibility={toggleSectionVisibility}
              isSectionVisible={isSectionVisible}
              mobileOpen={true}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 lg:ml-56">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <span>{sectionsConfig.find(s => s.key === activeSection)?.label}</span>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blis-red text-white text-sm font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar</>}
          </button>
        </div>

        <div className="p-4 lg:p-6">
          {activeSection === 'config' && (
            <ConfigPanel
              template={template}
              templateConfig={templateConfig}
              setTemplateConfig={setTemplateConfig}
              setTemplate={setTemplate}
              showToast={showToast}
            />
          )}

          {activeSection !== 'config' && (
            <EditorRouter
              activeSection={activeSection}
              sections={sections}
              updateSection={updateSection}
              updateArrayItem={updateArrayItem}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              toggleSectionVisibility={toggleSectionVisibility}
              isSectionVisible={isSectionVisible}
              projects={projects}
              campanas={campanas}
              loadingCampanas={loadingCampanas}
              asesores={asesores}
              loadingAsesores={loadingAsesores}
            />
          )}
        </div>
      </div>
    </div>
  );
}
