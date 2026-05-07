"use client";

import Link from "next/link";
import { Save, Loader2 } from "lucide-react";
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
      />

      <div className="flex-1 ml-56">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>{sectionsConfig.find(s => s.key === activeSection)?.label}</span>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blis-red text-white text-sm font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar</>}
          </button>
        </div>

        <div className="p-6">
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
