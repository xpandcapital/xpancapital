import { Trash2 } from "lucide-react";
import { InputField } from "./InputField";

export function LinkField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/ruta o https://..."
        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blis-red outline-none transition-colors"
      />
    </div>
  );
}
