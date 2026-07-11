"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Layout, FileText, ShoppingBag, Package, GraduationCap, BookOpen, Building2, Funnel, Target, CreditCard, CheckCircle, Shield, ChevronDown } from "lucide-react";
import { Template, TipoContenido } from "@/lib/hooks/useTemplates";
import { TemplateCard } from "./TemplateCard";

interface TemplateGridProps {
  templates: Template[];
  loading: boolean;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string, esPrincipal: boolean) => void;
  onDeactivate: (id: string) => void;
  onSetPrincipal: (id: string) => void;
  onCreateNew: (tipo: TipoContenido) => void;
}

const TIPO_INFO: Record<TipoContenido, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  landing: { label: "Landings", icon: Layout },
  blog: { label: "Blog", icon: FileText },
  blog_post: { label: "Posts", icon: FileText },
  tienda: { label: "Tienda", icon: ShoppingBag },
  producto: { label: "Productos", icon: Package },
  curso: { label: "Cursos", icon: GraduationCap },
  leccion: { label: "Lecciones", icon: BookOpen },
  proyecto: { label: "Proyectos", icon: Building2 },
  funnel: { label: "Funnels", icon: Funnel },
  captura: { label: "Capturas", icon: Target },
  checkout: { label: "Checkout", icon: CreditCard },
  thankyou: { label: "Thank You", icon: CheckCircle },
  legal: { label: "Legal", icon: Shield }
};

const TIPO_ORDER: TipoContenido[] = ['landing', 'blog', 'tienda', 'curso', 'proyecto', 'funnel', 'captura'];

export function TemplateGrid({
  templates,
  loading,
  onDuplicate,
  onDelete,
  onActivate,
  onDeactivate,
  onSetPrincipal,
  onCreateNew
}: TemplateGridProps) {
  const [expandedTypes, setExpandedTypes] = useState<Record<TipoContenido, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    TIPO_ORDER.forEach(tipo => { initial[tipo] = true; });
    return initial;
  });

  const [filterTipo, setFilterTipo] = useState<TipoContenido | "all">("all");

  const toggleType = (tipo: TipoContenido) => {
    setExpandedTypes(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  const templatesByTipo: Record<TipoContenido, Template[]> = {} as Record<TipoContenido, Template[]>;
  
  TIPO_ORDER.forEach(tipo => {
    templatesByTipo[tipo] = [];
  });

  templates.forEach(template => {
    if (!templatesByTipo[template.tipo_contenido]) {
      templatesByTipo[template.tipo_contenido] = [];
    }
    templatesByTipo[template.tipo_contenido].push(template);
  });

  const statsByTipo = (tipo: TipoContenido) => {
    const tipoTemplates = templatesByTipo[tipo] || [];
    const principales = tipoTemplates.filter(t => t.es_principal).length;
    const activos = tipoTemplates.filter(t => t.estado === 'activo').length;
    const borradores = tipoTemplates.filter(t => t.estado === 'borrador').length;
    return { principales, activos, borradores };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-zinc-950 border border-white/5 rounded-[2rem] overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-zinc-900" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilterTipo("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
            filterTipo === "all"
              ? "bg-blis-red text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          Todos
        </button>
        {TIPO_ORDER.map(tipo => {
          const Icon = TIPO_INFO[tipo].icon;
          const count = (templatesByTipo[tipo] || []).length;
          const isCore = ['landing', 'blog', 'tienda', 'funnel', 'captura'].includes(tipo);
          
          if (count === 0 && !isCore) return null;
          
          return (
            <button
              key={tipo}
              onClick={() => setFilterTipo(tipo)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                filterTipo === tipo
                  ? "bg-blis-red text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {TIPO_INFO[tipo].label}
              {count > 0 && <span className="px-1.5 py-0.5 bg-white/10 rounded-md text-[10px]">{count}</span>}
            </button>
          );
        })}
      </div>


      {TIPO_ORDER
        .filter(tipo => {
          if (filterTipo !== "all") return filterTipo === tipo;
          const isCore = ['landing', 'blog', 'tienda', 'funnel', 'captura'].includes(tipo);
          return isCore || (templatesByTipo[tipo] || []).length > 0;
        })
        .map(tipo => {
          const info = TIPO_INFO[tipo];
          const Icon = info.icon;
          const tipoTemplates = templatesByTipo[tipo] || [];

          const stats = statsByTipo(tipo);
          const isExpanded = expandedTypes[tipo];

          return (
            <motion.div
              key={tipo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div
                onClick={() => toggleType(tipo)}
                className="w-full flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-900/80 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">{info.label}</h3>
                  <span className="text-gray-500 text-xs">
                    {stats.principales} principal{stats.principales !== 1 ? 'es' : ''} · {stats.activos} activo{stats.activos !== 1 ? 's' : ''} · {stats.borradores} borrador{stats.borradores !== 1 ? 'es' : ''}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateNew(tipo);
                    }}
                    className="p-2 bg-blis-red/20 hover:bg-blis-red/30 text-blis-red rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={tipoTemplates.length > 0 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : ""}
                >
                  {tipoTemplates.length > 0 ? (
                    tipoTemplates.map(template => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                        onActivate={onActivate}
                        onDeactivate={onDeactivate}
                        onSetPrincipal={onSetPrincipal}
                      />
                    ))
                  ) : (
                    <div className="bg-zinc-950/30 border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center">
                      <Icon className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                      <h4 className="text-gray-400 font-bold text-sm mb-2 uppercase">No hay {info.label}</h4>
                      <p className="text-gray-600 text-xs mb-6">Comienza creando tu primera versión de {info.label}</p>
                      <button
                        onClick={() => onCreateNew(tipo)}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10"
                      >
                        Crear {info.label}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

            </motion.div>
          );
        })}

      {filterTipo === "all" && TIPO_ORDER
        .filter(tipo => (templatesByTipo[tipo] || []).length === 0)
        .length === TIPO_ORDER.length && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layout className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No hay templates</h3>
          <p className="text-gray-500 text-sm mb-6">Crea tu primer template para comenzar</p>
          <button
            onClick={() => onCreateNew('landing')}
            className="px-6 py-3 bg-blis-red text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_10px_20px_rgba(213,193,8,0.3)] flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Crear Template
          </button>
        </div>
      )}
    </div>
  );
}
