"use client";

import { useState, useEffect, useCallback } from "react";
import { TipoContenido } from "./useTemplates";

interface TemplateSection {[key: string]: unknown;}

// Configuración de Branding
interface CustomHeaderConfig {
  enabled: boolean;
  logo?: string;
  logoLink?: string;
  backgroundColor?: string;
  textColor?: string;
  links?: Array<{
    text: string;
    href: string;
    external?: boolean;
  }>;
  cta?: {
    text: string;
    href: string;
    style: 'primary' | 'secondary';
  };
}

interface CustomFooterConfig {
  enabled: boolean;
  logo?: string;
  description?: string;
  backgroundColor?: string;
  textColor?: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
  socials?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  copyright?: string;
}

interface BrandingConfig {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export interface TemplateConfig {
  showHeader: boolean;
  customHeader: CustomHeaderConfig | null;
  showFooter: boolean;
  customFooter: CustomFooterConfig | null;
  branding: BrandingConfig;
}

export const DEFAULT_CONFIG: TemplateConfig = {
  showHeader: true,
  customHeader: null,
  showFooter: true,
  customFooter: null,
  branding: {
    name: 'BLIS Corp',
    primaryColor: '#B10D24',
    secondaryColor: '#10B981',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    accentColor: '#B10D24',
  }
};

interface Template {
  id: string;
  nombre: string;
  slug: string;
  tipo_contenido: TipoContenido;
  estado: string;
  es_principal: boolean;
  secciones: Record<string, TemplateSection>;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  config?: TemplateConfig;
  meta_titulo?: string;
  meta_descripcion?: string;
  meta_keywords?: string[];
  og_imagen?: string;
}

interface UseTemplateOptions {
  tipo?: TipoContenido;
  slug?: string;
  autoFetch?: boolean;
}

const DEFAULT_ORDER_BY_TIPO: Record<TipoContenido, string[]> = {
  landing: ['hero', 'about', 'video', 'process', 'operations', 'market', 'calculator', 'map', 'projects', 'catalog', 'team', 'testimonials', 'faq', 'blog', 'footer'],
  blog: ['hero', 'posts', 'sidebar', 'footer'],
  blog_post: ['hero', 'content', 'author', 'related', 'footer'],
  tienda: ['hero', 'categories', 'featured', 'products', 'footer'],
  producto: ['hero', 'gallery', 'details', 'related', 'footer'],
  curso: ['hero', 'modules', 'instructor', 'footer'],
  leccion: ['header', 'video', 'content', 'resources', 'footer'],
  proyecto: ['hero', 'gallery', 'details', 'location', 'contact', 'footer'],
  funnel: ['hero', 'benefits', 'testimonials', 'pricing', 'cta', 'footer'],
  captura: ['hero', 'form', 'benefits', 'footer'],
  checkout: ['header', 'summary', 'payment', 'security', 'footer'],
  thankyou: ['hero', 'message', 'nextSteps', 'cta', 'footer']
};

export function useTemplate(options: UseTemplateOptions) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = '';
      
      if (options.slug) {
        url = `/api/templates/slug/${options.slug}`;
      } else if (options.tipo) {
        url = `/api/templates/tipo/${options.tipo}`;
      } else {
        setError('Se requiere tipo o slug');
        setLoading(false);
        return;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        setTemplate(data.data);
      } else {
        setError(data.error || 'No se encontró template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [options.tipo, options.slug]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchTemplate();
    }
  }, [fetchTemplate, options.autoFetch]);

  const isSectionVisible = useCallback((sectionKey: string): boolean => {
    if (!template?.sectionVisibility) return true;
    return template.sectionVisibility[sectionKey] !== false;
  }, [template]);

  const getSectionOrder = useCallback((): string[] => {
    if (template?.sectionOrder && template.sectionOrder.length > 0) {
      return template.sectionOrder;
    }
    
    if (template?.tipo_contenido) {
      return DEFAULT_ORDER_BY_TIPO[template.tipo_contenido] || DEFAULT_ORDER_BY_TIPO.landing;
    }
    
    return DEFAULT_ORDER_BY_TIPO.landing;
  }, [template]);

  const getSectionData = useCallback((sectionKey: string): TemplateSection | null => {
    if (!template?.secciones) return null;
    const section = template.secciones[sectionKey];
    if (!section || Object.keys(section).length === 0) return null;
    return section as TemplateSection;
  }, [template]);

  const getAllSections = useCallback((): TemplateSection => {
    return template?.secciones || {};
  }, [template]);

  const getConfig = useCallback((): TemplateConfig => {
    if (!template?.config) return DEFAULT_CONFIG;
    
    return {
      showHeader: template.config.showHeader ?? DEFAULT_CONFIG.showHeader,
      customHeader: template.config.customHeader ?? DEFAULT_CONFIG.customHeader,
      showFooter: template.config.showFooter ?? DEFAULT_CONFIG.showFooter,
      customFooter: template.config.customFooter ?? DEFAULT_CONFIG.customFooter,
      branding: {
        ...DEFAULT_CONFIG.branding,
        ...template.config.branding,
      }
    };
  }, [template]);

  return {
    template,
    loading,
    error,
    isSectionVisible,
    getSectionOrder,
    getSectionData,
    getAllSections,
    getConfig,
    refetch: fetchTemplate
  };
}

export function useTemplateByTipo(tipo: TipoContenido) {
  return useTemplate({ tipo });
}

export function useTemplateBySlug(slug: string) {
  return useTemplate({ slug });
}