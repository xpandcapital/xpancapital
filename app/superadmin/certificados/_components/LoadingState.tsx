import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blis-red mx-auto" />
        <p className="text-gray-400">Cargando plantillas...</p>
      </div>
    </div>
  );
}
