import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type Project = {
  id: string;
  name: string;
  status: string;
  website: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  signature_month: string | null;
  escritura_month: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setProjects(data || []);
      setError(null);
    } catch (e) {
      console.error('Error loading projects:', e);
      setError(e instanceof Error ? e.message : 'Error loading projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = async (project: Omit<Project, 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (insertError) throw insertError;
      setProjects(prev => [...prev, data]);
      return data;
    } catch (e) {
      console.error('Error creating project:', e);
      throw e;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) throw updateError;
      setProjects(prev => prev.map(p => p.id === projectId ? data : p));
      return data;
    } catch (e) {
      console.error('Error updating project:', e);
      throw e;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (deleteError) throw deleteError;
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (e) {
      console.error('Error deleting project:', e);
      throw e;
    }
  };

  const findProjectById = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  return {
    projects,
    isLoading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    findProjectById,
  };
}
