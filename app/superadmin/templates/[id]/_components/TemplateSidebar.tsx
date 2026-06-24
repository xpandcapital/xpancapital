"use client";

import Link from "next/link";
import {
  ArrowLeft, Settings, ChevronUp, ChevronDown, Eye, EyeOff, X
} from "lucide-react";
import { SectionConfig, TemplateData } from "../_types";

interface TemplateSidebarProps {
  template: TemplateData;
  sectionsConfig: SectionConfig[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  sectionOrder: string[];
  moveSectionUp: (key: string) => void;
  moveSectionDown: (key: string) => void;
  toggleSectionVisibility: (key: string) => void;
  isSectionVisible: (key: string) => boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

export function TemplateSidebar({
  template,
  sectionsConfig,
  activeSection,
  setActiveSection,
  sectionOrder,
  moveSectionUp,
  moveSectionDown,
  toggleSectionVisibility,
  isSectionVisible,
  mobileOpen,
  onClose,
}: TemplateSidebarProps) {
  return (
    <div className="w-56 bg-zinc-950 border-r border-white/5 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Close button (mobile only) */}
      {mobileOpen && (
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white lg:hidden">
          <X className="w-5 h-5" />
        </button>
      )}
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
            <div key={key} className="flex items-center gap-1 rounded-lg mb-0.5">
              <button
                onClick={() => setActiveSection(key)}
                className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm transition-colors min-w-0 ${
                  isActive ? 'text-white' : !isVisible ? 'text-gray-600 line-through' : 'text-gray-400'
                }`}
              >
                {config.icon}
                <span className="truncate">{config.label}</span>
              </button>
              <div className="flex items-center gap-0.5 pr-1">
                <button onClick={() => moveSectionUp(key)} disabled={index === 0} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button onClick={() => moveSectionDown(key)} disabled={index === sectionOrder.length - 1} className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button onClick={() => toggleSectionVisibility(key)} className={`p-1 hover:bg-white/10 rounded ${!isVisible ? 'text-red-400' : 'text-gray-400'}`}>
                  {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
