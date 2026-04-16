"use client";

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

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

const DEFAULT_SECTIONS: TemplateSection = {
  hero: {
    title1: "BLIS",
    title2: "CORP",
    subtitle: "Tu Próximo Gran Patrimonio",
    description: "Desarrollamos Macro-Lotes y Terrenos con alta plusvalía.",
    primaryBtnText: "Comprar Terrenos",
    primaryBtnLink: "/tienda",
    secondaryBtnText: "Trayectoria",
    secondaryBtnLink: "#trayectoria",
    videoBackground: "/videos/cyber-bg.mp4",
  },
  about: {
    yearsExperience: "10+",
    yearsLabel: "Años Exp.",
    stat1Value: "100%",
    stat1Label: "Certeza Legal",
    stat2Value: "+350",
    stat2Label: "Lotes Entregados",
    stat3Value: "+2500",
    stat3Label: "Entregas",
    missionTitle: "Nuestra Misión",
    missionText: "Transformar el horizonte inmobiliario.",
    videoThumbnail: "/images/miniatura-de-video.webp",
  },
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
      
      logger.debug('[useLandingTemplate] API response:', data);
      
      if (data.success && data.data) {
        setTemplate(data.data);
        logger.debug('[useLandingTemplate] Template loaded:', data.data.nombre, 'secciones:', Object.keys(data.data.secciones || {}));
      } else {
        logger.debug('[useLandingTemplate] No template found, using defaults');
        setError(data.error || 'No se encontró template activo');
        setTemplate(null);
      }
    } catch (err) {
      logger.error('[useLandingTemplate] Error:', err);
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
    if (!template?.secciones) {
      const defaultSection = DEFAULT_SECTIONS[sectionKey as keyof typeof DEFAULT_SECTIONS];
      return defaultSection !== undefined ? (defaultSection as TemplateSection) : null;
    }
    const section = template.secciones[sectionKey as keyof typeof template.secciones];
    if (!section || Object.keys(section).length === 0) {
      const defaultSection = DEFAULT_SECTIONS[sectionKey as keyof typeof DEFAULT_SECTIONS];
      return defaultSection !== undefined ? (defaultSection as TemplateSection) : null;
    }
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