"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTemplates } from "@/lib/hooks/useTemplates";
import { useCampanas, useAsesores } from "@/lib/hooks/useCampanas";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabaseClient";
import { useActionGuard } from '@/hooks/useActionGuard';
import { TemplateData, getSectionsForType } from "../_types";

export function useTemplateEditor() {
  const params = useParams();
  const { showToast } = useToast();
  const { guard } = useActionGuard();
  const { getTemplate, updateTemplate } = useTemplates();
  const { campanas, loading: loadingCampanas } = useCampanas();
  const { asesores, loading: loadingAsesores } = useAsesores();
  
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('config');
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});
  const [projects, setProjects] = useState<Array<{ id: string; name: string; primary_color?: string; status?: string }>>([]);
  const [templateConfig, setTemplateConfig] = useState<TemplateData['config']>({
    showHeader: true,
    showFooter: true,
    branding: {
      name: 'Xpand Capital',
      primaryColor: '#a89a00',
      secondaryColor: '#10B981',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#a89a00',
    }
  });

  useEffect(() => {
    loadTemplate();
  }, [params.id]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, primary_color, status')
        .eq('is_active', true)
        .order('order_index', { ascending: true, nullsFirst: false });
      
      if (!error && data) {
        setProjects(data);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTemplate(params.id as string);
      if (data) {
        setTemplate(data as TemplateData);
        const sectionsForType = getSectionsForType((data as any).tipo_contenido);
        const defaultOrder = sectionsForType.map(s => s.key);
        setSectionOrder((data as any).sectionOrder || defaultOrder);
        setSectionVisibility((data as any).sectionVisibility || {});
        if ((data as any).config) {
          setTemplateConfig((data as any).config);
        }
        if (sectionsForType.length > 0) {
          setActiveSection('config');
        }
      }
    } catch {
      showToast('Error al cargar el template', 'error');
    } finally {
      setLoading(false);
    }
  }, [params.id, getTemplate]);

  const handleSave = async () => {
    if (!guard('templates', 'editar')) return;
    if (!template) return;
    setSaving(true);
    try {
      await updateTemplate(template.id, { 
        secciones: template.secciones,
        sectionOrder,
        sectionVisibility,
        config: templateConfig
      });
      showToast('Template guardado correctamente', 'success');
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section: string, data: any) => {
    setTemplate((prev: TemplateData | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        secciones: {
          ...prev.secciones,
          [section]: {
            ...(prev.secciones?.[section] || {}),
            ...data
          }
        }
      };
    });
  };

  const updateArrayItem = (section: string, arrayKey: string, index: number, data: any) => {
    setTemplate((prev: TemplateData | null) => {
      if (!prev) return prev;
      const sectionData = prev.secciones?.[section] || {};
      const array = [...(sectionData[arrayKey] || [])];
      if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        array[index] = data;
      } else {
        array[index] = { ...array[index], ...data };
      }
      return {
        ...prev,
        secciones: { ...prev.secciones, [section]: { ...sectionData, [arrayKey]: array } }
      };
    });
  };

  const addArrayItem = (section: string, arrayKey: string, defaultItem: any) => {
    setTemplate((prev: TemplateData | null) => {
      if (!prev) return prev;
      const sectionData = prev.secciones?.[section] || {};
      const array = [...(sectionData[arrayKey] || []), defaultItem];
      return {
        ...prev,
        secciones: { ...prev.secciones, [section]: { ...sectionData, [arrayKey]: array } }
      };
    });
  };

  const removeArrayItem = (section: string, arrayKey: string, index: number) => {
    setTemplate((prev: TemplateData | null) => {
      if (!prev) return prev;
      const sectionData = prev.secciones?.[section] || {};
      const array = [...(sectionData[arrayKey] || [])];
      array.splice(index, 1);
      return {
        ...prev,
        secciones: { ...prev.secciones, [section]: { ...sectionData, [arrayKey]: array } }
      };
    });
  };

  const moveSectionUp = (sectionKey: string) => {
    const currentIndex = sectionOrder.indexOf(sectionKey);
    if (currentIndex > 0) {
      const newOrder = [...sectionOrder];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      setSectionOrder(newOrder);
    }
  };

  const moveSectionDown = (sectionKey: string) => {
    const currentIndex = sectionOrder.indexOf(sectionKey);
    if (currentIndex < sectionOrder.length - 1) {
      const newOrder = [...sectionOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      setSectionOrder(newOrder);
    }
  };

  const toggleSectionVisibility = (sectionKey: string) => {
    setSectionVisibility(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === false ? true : false
    }));
  };

  const isSectionVisible = (sectionKey: string) => {
    return sectionVisibility[sectionKey] !== false;
  };

  return {
    template,
    setTemplate,
    loading,
    saving,
    activeSection,
    setActiveSection,
    sectionOrder,
    sectionVisibility,
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
  };
}


