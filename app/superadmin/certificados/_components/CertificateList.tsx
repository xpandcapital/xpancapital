import { Plus, Award } from "lucide-react";
import { CertificateCard } from "./CertificateCard";
import type { CertificateTemplate } from "../_types";

interface Props {
  templates: CertificateTemplate[];
  onNew: () => void;
  onEdit: (template: CertificateTemplate) => void;
  onDelete: (id: string) => void;
}

export function CertificateList({ templates, onNew, onEdit, onDelete }: Props) {
  return (
    <div className="w-full space-y-8 pb-10 select-none animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4 md:px-8 pt-8 md:pt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-1 bg-blis-red rounded-full" />
            <span className="text-[10px] font-black text-blis-red uppercase tracking-[0.4em]">
              Motor de Certificados
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">
            Certificados
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">
            Diseña interfaces de certificación con precisión milimétrica y sincronización en tiempo real.
          </p>
        </div>
        <button
          onClick={onNew}
          className="group relative bg-blis-red text-white w-full sm:w-auto px-8 py-4 sm:px-8 sm:py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(190,11,60,0.3)] mt-4 sm:mt-0"
        >
          <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          Nueva Plantilla
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-12 text-center">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No hay plantillas configuradas</p>
          <p className="text-sm text-gray-500">Crea tu primera plantilla de certificado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map(template => (
            <CertificateCard
              key={template.id}
              template={template}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
