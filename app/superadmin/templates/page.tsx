"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTemplates, TipoContenido } from "@/lib/hooks/useTemplates";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { TemplateTypeModal } from "@/components/templates/TemplateTypeModal";
import { useToast } from "@/components/ui/Toast";

export default function TemplatesPage() {
  const {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    duplicateTemplate,
    activateTemplate,
    deactivateTemplate,
    setAsPrincipal
  } = useTemplates();

  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoContenido | null>(null);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const handleCreateNew = (tipo?: TipoContenido) => {
    setSelectedTipo(tipo || null);
    setIsModalOpen(true);
  };

  const handleCreate = async (data: {
    nombre: string;
    slug: string;
    tipo_contenido: TipoContenido;
    descripcion?: string;
    mostrar_en_menu: boolean;
    mostrar_en_footer: boolean;
  }): Promise<boolean> => {
    try {
      const result = await createTemplate({
        nombre: data.nombre,
        slug: data.slug,
        tipo_contenido: data.tipo_contenido,
        descripcion: data.descripcion,
        mostrar_en_menu: data.mostrar_en_menu,
        mostrar_en_footer: data.mostrar_en_footer
      });

      if (result) {
        showToast(`Template "${data.nombre}" creado exitosamente`, 'success');
        return true;
      }
      return false;
    } catch {
      showToast('Error al crear el template', 'error');
      return false;
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const result = await duplicateTemplate(id);
      if (result) {
        showToast(`Template duplicado exitosamente`, 'success');
      }
    } catch {
      showToast('Error al duplicar el template', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteTemplate(id);
      if (success) {
        showToast('Template eliminado exitosamente', 'success');
      }
    } catch {
      showToast('Error al eliminar el template', 'error');
    }
  };

  const handleActivate = async (id: string, esPrincipal: boolean) => {
    try {
      const result = await activateTemplate(id, esPrincipal);
      if (result) {
        showToast(`Template activado exitosamente`, 'success');
      }
    } catch {
      showToast('Error al activar el template', 'error');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const result = await deactivateTemplate(id);
      if (result) {
        showToast('Template desactivado', 'success');
      }
    } catch {
      showToast('Error al desactivar el template', 'error');
    }
  };

  const handleSetPrincipal = async (id: string) => {
    try {
      const result = await setAsPrincipal(id);
      if (result) {
        showToast('Template establecido como principal', 'success');
      }
    } catch {
      showToast('Error al establecer como principal', 'error');
    }
  };

  return (
    <div className="space-y-8 w-full mx-auto pb-20 px-4 md:px-8 pt-8 bg-black min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">
            Templates
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">
            Gestiona las plantillas de contenido. Los datos (posts, productos, cursos) siempre están conectados, lo que cambia es la presentación visual.
          </p>
        </div>
        <button
          onClick={() => handleCreateNew()}
          className="w-full sm:w-auto bg-blis-red text-white px-8 py-4 sm:py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center shrink-0 gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)] mt-4 sm:mt-0"
        >
          <Plus className="w-5 h-5" />
          Crear Template
        </button>
      </div>

      <TemplateGrid
        templates={templates}
        loading={loading}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onSetPrincipal={handleSetPrincipal}
        onCreateNew={handleCreateNew}
      />

      <TemplateTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}