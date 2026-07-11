"use client";

import { useState, useEffect, useCallback } from "react";

export interface SiteConfig {
  id: string;
  site_name: string;
  site_tagline: string;
  logo_horizontal: string;
  logo_vertical: string;
  logo_horizontal_light: string;
  logo_vertical_light: string;
  favicon: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  og_image: string;
  social_instagram: string;
  social_facebook: string;
  social_youtube: string;
  social_tiktok: string;
  social_linkedin: string;
  social_twitter: string;
  social_whatsapp: string;
  footer_description: string;
  footer_copyright: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
}

const defaultConfig: SiteConfig = {
  id: '',
  site_name: 'Xpand Capital',
  site_tagline: 'Luxury Tech Real Estate',
  logo_horizontal: '/images/blis-logo.png',
  logo_vertical: '/images/logo-blis-vertical.png',
  logo_horizontal_light: '',
  logo_vertical_light: '',
  favicon: '/favicon.ico',
  primary_color: '#a89a00',
  secondary_color: '#10B981',
  background_color: '#000000',
  text_color: '#FFFFFF',
  accent_color: '#a89a00',
  meta_title: '',
  meta_description: '',
  meta_keywords: [],
  og_image: '',
  social_instagram: '',
  social_facebook: '',
  social_youtube: '',
  social_tiktok: '',
  social_linkedin: '',
  social_twitter: '',
  social_whatsapp: '',
  footer_description: '',
  footer_copyright: '© 2026 Xpand Capital. Todos los derechos reservados.',
  contact_email: '',
  contact_phone: '',
  contact_address: ''
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/site-config');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig({ ...defaultConfig, ...data.data });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (updates: Partial<SiteConfig>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setConfig(prev => ({ ...prev, ...data.data }));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Error updating config' };
    }
  }, []);

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    updateConfig
  };
}

