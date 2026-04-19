import { Building2 } from 'lucide-react';

interface ProjectNotFoundProps {
  slug: string;
  onNavigate: () => void;
}

export function ProjectNotFound({ slug, onNavigate }: ProjectNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
      <div className="max-w-md w-full text-center">
        <Building2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Proyecto no encontrado</h1>
        <p className="text-gray-400 mb-6">El proyecto &quot;{slug}&quot; no existe o ha sido eliminado.</p>
        <button
          onClick={onNavigate}
          className="px-6 py-3 bg-blis-red hover:bg-red-700 rounded-xl text-white font-bold transition-all"
        >
          Ver todos los proyectos
        </button>
      </div>
    </div>
  );
}