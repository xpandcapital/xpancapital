import { Building2 } from 'lucide-react';
import { Project } from '../_types';

interface ProjectSelectorProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNavigateToProjects: () => void;
}

export function ProjectSelector({ projects, onSelectProject, onNavigateToProjects }: ProjectSelectorProps) {
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
              onClick={() => onSelectProject(project.id)}
              className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-white text-left flex items-center justify-between transition-all"
            >
              <span className="font-medium">{project.name}</span>
              <span className="text-xs text-gray-500">{project.status}</span>
            </button>
          ))}
        </div>

        {projects.length === 0 && (
          <p className="text-gray-500 mt-4">
            No hay proyectos creados. Ve a <span className="text-blis-red cursor-pointer" onClick={onNavigateToProjects}>Proyectos</span> para crear uno.
          </p>
        )}
      </div>
    </div>
  );
}