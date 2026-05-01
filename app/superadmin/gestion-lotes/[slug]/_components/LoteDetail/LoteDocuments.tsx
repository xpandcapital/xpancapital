'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { FolderOpen, FileText, Receipt } from 'lucide-react';

interface Props {
  lot: Lote;
  isDrag: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LoteDocuments({ lot, isDrag, onDragEnter, onDragLeave, onDragOver, onDrop, onFileInput }: Props) {
  return (
    <SubCard>
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-3">
        <FolderOpen className="w-3.5 h-3.5 inline mr-1.5" />Documentos del Expediente
      </h3>

      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          isDrag ? 'border-rose-500 bg-rose-500/[0.05]' : 'border-white/[0.06] hover:border-white/[0.12]'
        }`}
        onClick={() => document.getElementById('single-lot-file-input')?.click()}
      >
        <input
          id="single-lot-file-input"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileInput}
          className="hidden"
        />
        <FileText className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
        <p className="text-xs font-bold text-zinc-500 uppercase">Arrastra o haz clic</p>
        <p className="text-[9px] text-zinc-600 mt-1">PDFs e imagenes</p>
      </div>

      {lot.documents && lot.documents.length > 0 && (
        <div className="mt-3 space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
          {lot.documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-2 bg-black/60 border border-white/[0.04] rounded-lg px-3 py-1.5">
              {doc.type === 'contrato' ? (
                <FileText className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Receipt className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span className="text-[10px] text-zinc-400 truncate flex-1">{doc.name}</span>
            </div>
          ))}
        </div>
      )}
    </SubCard>
  );
}
