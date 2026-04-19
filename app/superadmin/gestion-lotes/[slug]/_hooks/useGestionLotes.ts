import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Project } from '../_types';

export function useGestionLotes(slug: string) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectNotFound, setProjectNotFound] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, status')
          .order('name');

        if (error) throw error;

        if (data && data.length > 0) {
          const projectsWithSlug = data.map(p => ({
            ...p,
            slug: p.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')
          }));

          setProjects(projectsWithSlug);
          localStorage.setItem('inmo_project_list', JSON.stringify(projectsWithSlug));

          if (slug && slug !== '_none_') {
            const project = projectsWithSlug.find(p => p.slug === slug);
            if (project) {
              setActiveProjectId(project.id);
              localStorage.setItem('inmo_active_project', project.id);
            } else {
              setProjectNotFound(true);
            }
          } else if (slug === '_none_') {
            const savedId = localStorage.getItem('inmo_active_project');
            if (savedId && projectsWithSlug.find(p => p.id === savedId)) {
              const project = projectsWithSlug.find(p => p.id === savedId);
              if (project) {
                router.replace(`/superadmin/gestion-lotes/${project.slug}`);
                return;
              }
            }
            setActiveProjectId(null);
            localStorage.removeItem('inmo_active_project');
          }
        }
      } catch (err) {
        console.error('[GestionLotes] Error loading projects:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [slug, router]);

  useEffect(() => {
    if (!activeProjectId) return;

    const loadLots = async () => {
      try {
        const { data: lots } = await supabase
          .from('project_lots')
          .select('*')
          .eq('project_id', activeProjectId)
          .order('lot_number');

        if (lots) {
          localStorage.setItem(`inmo_proj_lots_${activeProjectId}`, JSON.stringify(lots));
          localStorage.setItem('inmo_data_updated', Date.now().toString());
        }
      } catch (err) {
        console.error('[GestionLotes] Error loading lots:', err);
      }
    };

    loadLots();
  }, [activeProjectId]);

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      router.push(`/superadmin/gestion-lotes/${project.slug}`);
    }
  };

  return {
    isLoading,
    projects,
    activeProjectId,
    projectNotFound,
    handleProjectChange,
  };
}