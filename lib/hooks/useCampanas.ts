"use client";

import { useState, useEffect, useCallback } from "react";

interface Asesor {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  foto_url?: string;
  activo: boolean;
}

interface Campana {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: string;
  asesor_id?: string;
  asesor?: Asesor;
  notificar_email: boolean;
  notificar_whatsapp: boolean;
  emails_notificacion: string[];
  whatsapp_notificacion: string[];
  notion_database_id?: string;
  notion_sync: boolean;
  creado_en: string;
  actualizado_en: string;
}

interface UseCampanasReturn {
  campanas: Campana[];
  loading: boolean;
  error: string | null;
  create: (data: Partial<Campana>) => Promise<Campana | null>;
  update: (id: string, data: Partial<Campana>) => Promise<boolean>;
  delete: (id: string) => Promise<boolean>;
  refetch: () => void;
}

export function useCampanas(): UseCampanasReturn {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampanas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/campanas');
      const data = await response.json();
      
      if (data.success) {
        setCampanas(data.data || []);
      } else {
        setError(data.error || 'Error al cargar campañas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampanas();
  }, [fetchCampanas]);

  const create = useCallback(async (campanaData: Partial<Campana>): Promise<Campana | null> => {
    try {
      const response = await fetch('/api/campanas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campanaData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCampanas(prev => [...prev, data.data]);
        return data.data;
      }
      
      setError(data.error || 'Error al crear campaña');
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, campanaData: Partial<Campana>): Promise<boolean> => {
    try {
      const response = await fetch('/api/campanas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...campanaData })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCampanas(prev => prev.map(c => c.id === id ? { ...c, ...campanaData } : c));
        return true;
      }
      
      setError(data.error || 'Error al actualizar campaña');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  }, []);

  const deleteCampana = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/campanas?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCampanas(prev => prev.filter(c => c.id !== id));
        return true;
      }
      
      setError(data.error || 'Error al eliminar campaña');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  }, []);

  return {
    campanas,
    loading,
    error,
    create,
    update,
    delete: deleteCampana,
    refetch: fetchCampanas
  };
}
