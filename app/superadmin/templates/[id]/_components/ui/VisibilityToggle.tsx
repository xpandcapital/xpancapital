import { Eye, EyeOff } from "lucide-react";

export function VisibilityToggle({ section, isVisible, onToggle }: { section: string; isVisible: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isVisible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}
      >
        {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        {isVisible ? 'Visible' : 'Oculto'}
      </button>
    </div>
  );
}
