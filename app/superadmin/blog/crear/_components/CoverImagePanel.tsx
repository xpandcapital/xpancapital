'use client';

import { Image as ImageIcon, Upload, Trash2, Loader2 } from 'lucide-react';

interface CoverImagePanelProps {
  imagen_portada: string;
  imagen_alt: string;
  uploadingCover: boolean;
  coverFileRef: React.RefObject<HTMLInputElement | null>;
  onImageUrlChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  onRemoveImage: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CoverImagePanel({
  imagen_portada,
  imagen_alt,
  uploadingCover,
  coverFileRef,
  onImageUrlChange,
  onAltChange,
  onRemoveImage,
  onFileUpload,
}: CoverImagePanelProps) {
  return (
    <div className="p-5 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-gray-400" />
        Imagen de portada
      </h3>
      <div className="space-y-4">
        {imagen_portada && (
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            <img src={imagen_portada} alt="Portada" className="w-full h-40 object-cover" />
            <button
              onClick={onRemoveImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={imagen_portada}
            onChange={e => onImageUrlChange(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
          />
          <button
            onClick={() => coverFileRef.current?.click()}
            disabled={uploadingCover}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Subir
          </button>
          <input
            type="file"
            ref={coverFileRef}
            className="hidden"
            accept="image/*"
            onChange={onFileUpload}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Alt text</label>
          <input
            type="text"
            value={imagen_alt}
            onChange={e => onAltChange(e.target.value)}
            placeholder="Descripción de la imagen"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
