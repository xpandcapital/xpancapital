import { motion } from "framer-motion";
import { Award, Eye, Trash2, Settings, CheckCircle2, Layout } from "lucide-react";
import type { CertificateTemplate } from "../_types";

interface Props {
  template: CertificateTemplate;
  onEdit: (template: CertificateTemplate) => void;
  onDelete: (id: string) => void;
}

export function CertificateCard({ template, onEdit, onDelete }: Props) {
  return (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-6 space-y-5 group hover:border-blis-red/30 transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Award className="w-24 h-24 text-white" />
      </div>

      <div className="aspect-[1.414/1] bg-black rounded-[2rem] border border-white/5 overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
        {template.backgroundImage ? (
          <img
            src={template.backgroundImage}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
            alt="Preview"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-900">
            <Layout className="w-20 h-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <button
            onClick={() => onEdit(template)}
            className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
          >
            <Eye className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-blis-red transition-colors">
          {template.title}
        </h3>
        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">
          {template.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-white/5">
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Guardado
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onDelete(template.id)}
            className="p-3 bg-white/5 rounded-xl text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onEdit(template)}
            className="p-3 bg-white/5 rounded-xl text-zinc-600 hover:text-white hover:bg-white/10 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
