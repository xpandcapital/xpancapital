import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-blis-red animate-spin" />
        <p className="text-gray-400 text-sm">Cargando gestión de lotes...</p>
      </div>
    </div>
  );
}