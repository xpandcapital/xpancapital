'use client';

import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface Props {
  isDrag: boolean;
  isProcessing: boolean;
  progress?: { current: number; total: number; status: string };
  logs?: string[];
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadDropZone({
  isDrag, isProcessing, progress, logs,
  onDragEnter, onDragLeave, onDragOver, onDrop, onFileInput, onImportJSON,
}: Props) {
  if (isProcessing) {
    return (
      <div className="border-2 border-dashed border-rose-500/20 bg-rose-500/[0.02] rounded-2xl p-12 text-center">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-black text-white uppercase tracking-wider">
          {Math.round(((progress?.current || 0) / (progress?.total || 1)) * 100)}%
        </p>
        <p className="text-xs text-zinc-500 mt-1">{progress?.status || 'Procesando...'}</p>
        {logs && logs.length > 0 && (
          <div className="mt-4 max-h-40 overflow-y-auto bg-black/60 border border-white/[0.06] rounded-lg p-3 text-left text-[10px] text-zinc-400 font-mono scrollbar-thin">
            {logs.slice(-10).map((log, i) => <p key={i}>{log}</p>)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
        isDrag ? 'border-rose-500 bg-rose-500/[0.03]' : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      <input
        id="massive-file-input"
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onFileInput}
        className="hidden"
      />
      <label htmlFor="massive-file-input" className="cursor-pointer">
        <UploadCloud className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-base font-black text-white uppercase tracking-wider">Arrastra o Sube PDFs e Imagenes</p>
        <p className="text-xs text-zinc-500 mt-2">Nuestra IA analizara los documentos y agrupara recibos en sus respectivos lotes.</p>
      </label>
      <div className="mt-4 flex justify-center gap-3">
        <label className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer transition-all">
          <FileText className="w-3.5 h-3.5 inline mr-1.5" />Importar JSON
          <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
        </label>
      </div>
    </div>
  );
}
