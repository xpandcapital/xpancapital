import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '../_types';

const getProjectSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

export function useGestionLotes(slug: string) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectNotFound, setProjectNotFound] = useState(false);

  const activeProjectName = useMemo(() => {
    const project = projects.find(p => p.id === activeProjectId);
    return project?.name || null;
  }, [projects, activeProjectId]);

  const activeProjectLogo = useMemo(() => {
    const project = projects.find(p => p.id === activeProjectId);
    return (project as any)?.logo_url || null;
  }, [projects, activeProjectId]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch('/api/admin/projects?fields=id,name,status,logo_url')
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Error loading projects')

        const data = json.data || []
        const projectsWithSlug = data.map((p: any) => ({
          ...p,
          slug: getProjectSlug(p.name),
          lots: p.lots || [],
        }))

        setProjects(projectsWithSlug)
        localStorage.setItem('inmo_project_list', JSON.stringify(projectsWithSlug))

        if (slug && slug !== '_none_') {
          const project = projectsWithSlug.find((p: any) => p.slug === slug)
          if (project) {
            setActiveProjectId(project.id)
            localStorage.setItem('inmo_active_project', project.id)
          } else {
            setProjectNotFound(true)
          }
        } else if (slug === '_none_') {
          const savedId = localStorage.getItem('inmo_active_project')
          if (savedId && projectsWithSlug.find((p: any) => p.id === savedId)) {
            const project = projectsWithSlug.find((p: any) => p.id === savedId)
            if (project) {
              router.replace(`/superadmin/gestion-lotes/${project.slug}`)
              return
            }
          }
          setActiveProjectId(null)
          localStorage.removeItem('inmo_active_project')
        }
      } catch (err) {
        console.error('[GestionLotes] Error loading projects:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [slug])

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      router.push(`/superadmin/gestion-lotes/${(project as any).slug}`)
    }
  }

  return {
    isLoading,
    projects,
    activeProjectId,
    activeProjectName,
    activeProjectLogo,
    projectNotFound,
    handleProjectChange,
  }
}