"use client";

import { useState, useEffect, useCallback } from "react";

export type TipoContenido = 
  | 'landing' 
  | 'blog' 
  | 'blog_post' 
  | 'tienda' 
  | 'producto' 
  | 'curso' 
  | 'leccion' 
  | 'proyecto' 
  | 'funnel' 
  | 'captura' 
  | 'checkout' 
  | 'thankyou'
  | 'legal';

export type EstadoTemplate = 'borrador' | 'revision' | 'listo' | 'activo';

export const ESTADOS: Record<EstadoTemplate, { label: string; color: string }> = {
  borrador: { label: 'Borrador', color: 'gray' },
  revision: { label: 'Revisión', color: 'amber' },
  listo: { label: 'Listo', color: 'blue' },
  activo: { label: 'Activo', color: 'green' }
};

export interface Template {
  id: string;
  empresa_id: string;
  nombre: string;
  slug: string;
  tipo_contenido: TipoContenido;
  estado: EstadoTemplate;
  es_principal: boolean;
  mostrar_en_menu: boolean;
  mostrar_en_footer: boolean;
  secciones: Record<string, unknown>;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  config?: {
    showHeader?: boolean;
    customHeader?: {
      enabled?: boolean;
      logo?: string;
      logoLink?: string;
      backgroundColor?: string;
      textColor?: string;
      links?: Array<{ text: string; href: string; external?: boolean }>;
      cta?: { text: string; href: string; style: 'primary' | 'secondary' };
    };
    showFooter?: boolean;
    customFooter?: {
      enabled?: boolean;
      logo?: string;
      description?: string;
      backgroundColor?: string;
      textColor?: string;
      links?: Array<{ label: string; href: string }>;
      socials?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
        tiktok?: string;
      };
      copyright?: string;
    };
    branding?: {
      name?: string;
      primaryColor?: string;
      secondaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      accentColor?: string;
    };
  };
  meta_titulo?: string;
  meta_descripcion?: string;
  meta_keywords?: string[];
  og_imagen?: string;
  thumbnail_url?: string;
  descripcion?: string;
  creado_por?: string;
  creado_en: string;
  actualizado_en: string;
  publicado_en?: string;
}

export interface TemplateCreateData {
  nombre: string;
  slug?: string;
  tipo_contenido: TipoContenido;
  secciones?: Record<string, unknown>;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  config?: Template['config'];
  descripcion?: string;
  mostrar_en_menu?: boolean;
  mostrar_en_footer?: boolean;
  meta_titulo?: string;
  meta_descripcion?: string;
  meta_keywords?: string[];
  og_imagen?: string;
}

export interface TemplatesFilter {
  tipo?: TipoContenido;
  estado?: EstadoTemplate;
  solo_activos?: boolean;
}

const TIPOS_CONTENIDO: Record<TipoContenido, { label: string; icon: string }> = {
  landing: { label: 'Landing', icon: 'Layout' },
  blog: { label: 'Blog', icon: 'FileText' },
  blog_post: { label: 'Post', icon: 'Newspaper' },
  tienda: { label: 'Tienda', icon: 'ShoppingBag' },
  producto: { label: 'Producto', icon: 'Package' },
  curso: { label: 'Curso', icon: 'GraduationCap' },
  leccion: { label: 'Lección', icon: 'BookOpen' },
  proyecto: { label: 'Proyecto', icon: 'Building2' },
  funnel: { label: 'Funnel', icon: 'Funnel' },
  captura: { label: 'Captura', icon: 'Target' },
  checkout: { label: 'Checkout', icon: 'CreditCard' },
  thankyou: { label: 'Thank You', icon: 'CheckCircle' },
  legal: { label: 'Páginas Legales', icon: 'Scale' }
};

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async (filter?: TemplatesFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter?.tipo) params.append('tipo', filter.tipo);
      if (filter?.estado) params.append('estado', filter.estado);
      if (filter?.solo_activos) params.append('activos', 'true');

      const response = await fetch(`/api/templates?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al cargar templates');
      }

      setTemplates(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback(async (id: string): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/templates/${id}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al cargar template');
      }

      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const createTemplate = useCallback(async (templateData: TemplateCreateData): Promise<Template | null> => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al crear template');
      }

      setTemplates(prev => [data.data, ...prev]);
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<Template>): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al actualizar template');
      }

      setTemplates(prev => prev.map(t => t.id === id ? data.data : t));
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al eliminar template');
      }

      setTemplates(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  }, []);

  const duplicateTemplate = useCallback(async (id: string): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/templates/${id}/duplicar`, { method: 'POST' });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al duplicar template');
      }

      setTemplates(prev => [data.data, ...prev]);
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const activateTemplate = useCallback(async (id: string, es_principal = false): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/templates/${id}/activar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ es_principal })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al activar template');
      }

      setTemplates(prev => prev.map(t => {
        if (t.id === id) return data.data;
        if (es_principal && t.tipo_contenido === data.data.tipo_contenido) {
          return { ...t, es_principal: false };
        }
        return t;
      }));
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const deactivateTemplate = useCallback(async (id: string): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/templates/${id}/desactivar`, { method: 'POST' });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al desactivar template');
      }

      setTemplates(prev => prev.map(t => t.id === id ? data.data : t));
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const setAsPrincipal = useCallback(async (id: string): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/templates/${id}/principal`, { method: 'POST' });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al establecer como principal');
      }

      setTemplates(prev => prev.map(t => {
        if (t.id === id) return { ...t, es_principal: true };
        if (t.tipo_contenido === data.data.tipo_contenido) {
          return { ...t, es_principal: false };
        }
        return t;
      }));
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const getTemplatesByTipo = useCallback((tipo: TipoContenido): Template[] => {
    return templates.filter(t => t.tipo_contenido === tipo);
  }, [templates]);

  const getPrincipalByTipo = useCallback((tipo: TipoContenido): Template | undefined => {
    return templates.find(t => t.tipo_contenido === tipo && t.es_principal === true);
  }, [templates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    activateTemplate,
    deactivateTemplate,
    setAsPrincipal,
    getTemplatesByTipo,
    getPrincipalByTipo,
    TIPOS_CONTENIDO,
    ESTADOS
  };
}