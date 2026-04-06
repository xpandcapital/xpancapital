"use client";

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  compact?: boolean;
}

export function ImageUpload({ value, onChange, folder = 'cms', className = '', compact = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al subir imagen');
      }

      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleRemove = useCallback(() => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        {value ? (
          <div className="group relative">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shrink-0">
              <img 
                src={value} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={() => onChange('')}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
            >
              <Upload className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 p-0.5 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : uploading ? (
          <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-blis-red animate-spin" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-lg border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-center"
          >
            <ImageIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative group">
          <div className="max-w-[200px] rounded-lg overflow-hidden bg-zinc-900 border border-white/10">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-auto max-h-[120px] object-contain"
              onError={() => onChange('')}
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-red-500/90 hover:bg-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3 text-white" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 px-2 py-1 bg-black/70 hover:bg-black/90 rounded-lg transition-colors text-[10px] text-white opacity-0 group-hover:opacity-100 flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            Cambiar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : uploading ? (
        <div className="max-w-[200px] h-[80px] rounded-lg border border-white/10 flex items-center justify-center bg-white/[0.02]">
          <Loader2 className="w-5 h-5 text-blis-red animate-spin" />
        </div>
      ) : error ? (
        <div className="max-w-[200px] h-[80px] rounded-lg border border-red-500/30 flex flex-col items-center justify-center bg-white/[0.02]">
          <X className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-[10px] mt-1 text-center px-2">{error}</p>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            max-w-[200px] h-[80px] rounded-lg border-2 border-dashed cursor-pointer
            flex items-center justify-center gap-2 transition-all
            ${dragOver 
              ? 'border-blis-red bg-blis-red/10' 
              : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05]'
            }
          `}
        >
          <Upload className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-xs">Subir</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

export function CompactImageUpload({ value, onChange, folder = 'cms' }: { value?: string; onChange: (url: string) => void; folder?: string }) {
  return <ImageUpload value={value} onChange={onChange} folder={folder} compact />;
}