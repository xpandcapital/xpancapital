"use client";

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Crop } from 'lucide-react';
import { ImageCropper } from './ImageCropper';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  compact?: boolean;
  enableCrop?: boolean;
  aspectRatio?: number;
}

export function ImageUpload({ value, onChange, folder = 'cms', className = '', compact = false, enableCrop = false, aspectRatio = 16/9 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return;

    setError(null);

    // If cropping is enabled, show cropper first
    if (enableCrop) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropperSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Otherwise, upload directly
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
  }, [folder, onChange, enableCrop]);

  const handleCropSave = useCallback(async (blob: Blob) => {
    setUploading(true);
    setCropperSrc(null);
    
    try {
      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.webp');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const handleReCrop = () => {
    if (value) {
      setCropperSrc(value);
    }
  };

  return (
    <>
      {cropperSrc && (
        <ImageCropper
          src={cropperSrc}
          aspectRatio={aspectRatio}
          onSave={handleCropSave}
          onClose={() => setCropperSrc(null)}
        />
      )}
      <div className={`relative ${className}`}>
        {value ? (
          <div className="relative group">
            <div className={`${compact ? 'w-16 h-16' : 'max-w-[200px]'} rounded-lg overflow-hidden bg-zinc-900 border border-white/10 ${compact ? '' : 'relative'}`}>
              <img 
                src={value} 
                alt="Preview" 
                className={`w-full ${compact ? 'h-full object-cover' : 'h-auto max-h-[120px] object-contain'}`}
                onError={() => onChange('')}
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 p-0.5 bg-red-500/90 hover:bg-red-500 rounded-full transition-colors"
            >
              <X className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
            </button>
            {enableCrop && (
              <button
                type="button"
                onClick={handleReCrop}
                className={`absolute ${compact ? 'bottom-0 left-0' : 'bottom-1 left-1'} p-0.5 bg-blis-red/90 hover:bg-blis-red rounded-lg transition-colors`}
                title="Recortar"
              >
                <Crop className="w-3 h-3 text-white" />
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`absolute ${compact ? 'inset-0 bg-black/50 opacity-0 group-hover:opacity-100' : 'bottom-1 right-1 px-2 py-1 bg-black/70'} rounded-lg transition-colors text-[10px] text-white ${compact ? 'flex items-center justify-center' : 'opacity-0 group-hover:opacity-100 flex items-center gap-1'}`}
            >
              <Upload className={`${compact ? 'w-4 h-4' : 'w-3 h-3'}`} />
              {!compact && <span>Cambiar</span>}
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
          <div className={`${compact ? 'w-16 h-16' : 'max-w-[200px] h-[80px]'} rounded-lg border border-white/10 flex items-center justify-center bg-white/[0.02]`}>
            <Loader2 className={`w-5 h-5 text-blis-red animate-spin`} />
          </div>
        ) : error ? (
          <div className={`${compact ? 'w-16 h-16' : 'max-w-[200px] h-[80px]'} rounded-lg border border-red-500/30 flex flex-col items-center justify-center bg-white/[0.02]`}>
            <X className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-red-400`} />
            {!compact && <p className="red-400 text-[10px] mt-1 text-center px-2">{error}</p>}
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              ${compact ? 'w-16 h-16' : 'max-w-[200px] h-[80px]'} rounded-lg border-2 border-dashed cursor-pointer
              flex items-center justify-center gap-2 transition-all
              ${dragOver 
                ? 'border-blis-red bg-blis-red/10' 
                : 'border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05]'
              }
            `}
          >
            {compact ? <ImageIcon className="w-4 h-4 text-gray-400" /> : (
              <>
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-xs">{enableCrop ? 'Recortar' : 'Subir'}</span>
              </>
            )}
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
    </>
  );
}