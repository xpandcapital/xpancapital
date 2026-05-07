import { ChevronLeft, Upload, Save, Loader2 } from "lucide-react";
import type { CertificateTemplate } from "../_types";

interface Props {
  currentTemplate: CertificateTemplate;
  saving: boolean;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export function EditorToolbar({
  currentTemplate,
  saving,
  onBack,
  onTitleChange,
  onBgUpload,
  onSave,
}: Props) {
  return (
    <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <input
            type="text"
            value={currentTemplate.title}
            onChange={e => onTitleChange(e.target.value)}
            className="text-sm font-black text-white uppercase tracking-tighter leading-none bg-transparent border-b-2 border-transparent hover:border-white/20 focus:border-blis-red outline-none px-2 py-1 min-w-[300px] focus:bg-white/5 transition-all rounded-md"
            placeholder="TÍTULO DE LA PLANTILLA"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer border border-white/5 transition-all">
          <Upload className="w-4 h-4 text-zinc-400" />
          <input type="file" className="hidden" accept="image/*" onChange={onBgUpload} />
        </label>
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blis-red hover:text-white transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Guardar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
