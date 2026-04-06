"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GestionDeLotesApp from '../../GestionDeLotes';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Building2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  slug?: string;
}

function GestionLotesContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectNotFound, setProjectNotFound] = useState(false);

  // Cargar proyectos desde Supabase
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, status')
          .order('name');

        if (error) throw error;

        if (data && data.length > 0) {
          // Generar slug para cada proyecto
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

          // Si hay slug en la URL y no es "_none_", buscar el proyecto
          if (slug && slug !== '_none_') {
            const project = projectsWithSlug.find(p => p.slug === slug);
            if (project) {
              setActiveProjectId(project.id);
              localStorage.setItem('inmo_active_project', project.id);
            } else {
              // Proyecto no encontrado
              setProjectNotFound(true);
            }
          } else if (slug === '_none_') {
            // Sin proyecto seleccionado - verificar si hay uno en localStorage
            const savedId = localStorage.getItem('inmo_active_project');
            if (savedId && projectsWithSlug.find(p => p.id === savedId)) {
              // Redirigir al proyecto guardado
              const project = projectsWithSlug.find(p => p.id === savedId);
              if (project) {
                router.replace(`/superadmin/gestion-lotes/${project.slug}`);
                return;
              }
            }
            // Sin proyecto seleccionado
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

  // Cargar lotes del proyecto activo
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

  // Manejar cambio de proyecto
  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      router.push(`/superadmin/gestion-lotes/${project.slug}`);
    }
  };

  // Si está cargando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blis-red animate-spin" />
          <p className="text-gray-400 text-sm">Cargando gestión de lotes...</p>
        </div>
      </div>
    );
  }

  // Proyecto no encontrado
  if (projectNotFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
        <div className="max-w-md w-full text-center">
          <Building2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Proyecto no encontrado</h1>
          <p className="text-gray-400 mb-6">El proyecto "{slug}" no existe o ha sido eliminado.</p>
          <button
            onClick={() => router.push('/superadmin/gestion-lotes/_none_')}
            className="px-6 py-3 bg-blis-red hover:bg-red-700 rounded-xl text-white font-bold transition-all"
          >
            Ver todos los proyectos
          </button>
        </div>
      </div>
    );
  }

  // Sin proyecto seleccionado
  if (!activeProjectId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
        <div className="max-w-md w-full text-center">
          <Building2 className="w-16 h-16 text-blis-red mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Gestión de Lotes</h1>
          <p className="text-gray-400 mb-6">Selecciona un proyecto para gestionar sus lotes</p>
          
          <div className="space-y-2">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => handleProjectChange(project.id)}
                className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-white text-left flex items-center justify-between transition-all"
              >
                <span className="font-medium">{project.name}</span>
                <span className="text-xs text-gray-500">{project.status}</span>
              </button>
            ))}
          </div>

          {projects.length === 0 && (
            <p className="text-gray-500 mt-4">
              No hay proyectos creados. Ve a <span className="text-blis-red cursor-pointer" onClick={() => router.push('/superadmin/proyectos')}>Proyectos</span> para crear uno.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Renderizar GestionDeLotes con el proyecto seleccionado
  return <GestionDeLotesApp />;
}

export default function GestionLotesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="w-10 h-10 text-blis-red animate-spin" />
      </div>
    }>
      <GestionLotesContent />
    </Suspense>
  );
}