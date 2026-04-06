"use client";

import { useState, useEffect, useCallback } from 'react';

interface TemplateSection {
  [key: string]: unknown;
}

interface LandingTemplate {
  id: string;
  nombre: string;
  slug: string;
  tipo_contenido?: string;
  secciones: TemplateSection;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
}

const DEFAULT_ORDER_BY_TIPO: Record<string, string[]> = {
  landing: ["hero", "about", "video", "process", "operations", "market", "calculator", "map", "projects", "catalog", "team", "testimonials", "faq", "blog", "footer"],
  blog: ["blogHero", "blogPosts", "footer"],
  tienda: ["shopHero", "shopSidebar", "shopProducts", "shopNotifications", "footer"],
};

export function useLandingTemplate(_templateId?: string) {
  const [template, setTemplate] = useState<LandingTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/templates/landing');
      const data = await response.json();
      
      if (data.success && data.data) {
        setTemplate(data.data);
      } else {
        setError(data.error || 'No se encontró template activo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const isSectionVisible = useCallback((sectionKey: string): boolean => {
    if (!template?.sectionVisibility) return true;
    return template.sectionVisibility[sectionKey] !== false;
  }, [template]);

  const getSectionOrder = useCallback((): string[] => {
    if (template?.sectionOrder && template.sectionOrder.length > 0) {
      return template.sectionOrder;
    }
    
    const type = template?.tipo_contenido || 'landing';
    return DEFAULT_ORDER_BY_TIPO[type] || DEFAULT_ORDER_BY_TIPO['landing'];
  }, [template]);

  const getSectionData = useCallback((sectionKey: string): TemplateSection | null => {
    if (!template?.secciones) return null;
    const section = template.secciones[sectionKey];
    if (!section || Object.keys(section).length === 0) return null;
    return section as TemplateSection;
  }, [template]);

  return {
    template,
    loading,
    error,
    isSectionVisible,
    getSectionOrder,
    getSectionData,
    refetch: fetchTemplate
  };
}