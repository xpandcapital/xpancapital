"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move } from "lucide-react";

interface ImageCropperProps {
  src: string;
  aspectRatio: number; // width / height
  onSave: (blob: Blob) => void;
  onClose: () => void;
}

export function ImageCropper({ src, aspectRatio, onSave, onClose }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setPosition(prev => ({
      x: prev.x + deltaX * 0.1,
      y: prev.y + deltaY * 0.1
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 1));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 50, y: 50 });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = src;
      });

      const outputWidth = 1920;
      const outputHeight = Math.round(outputWidth / aspectRatio);
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const drawX = (outputWidth / 2) - (position.x / 100 * scaledWidth);
      const drawY = (outputHeight / 2) - (position.y / 100 * scaledHeight);

      ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          onSave(blob);
        }
        setLoading(false);
        onClose();
      }, 'image/webp', 0.9);
    } catch (error) {
      console.error('Error saving image:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-bold">Ajustar Imagen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas */}
        <div className="p-4">
          <div
            ref={containerRef}
            className="relative mx-auto overflow-hidden rounded-xl bg-black cursor-move"
            style={{ width: '100%', maxWidth: '800px', aspectRatio: `${aspectRatio}` }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={src}
              alt="Preview"
              crossOrigin="anonymous"
              className="absolute pointer-events-none select-none"
              style={{
                transform: `scale(${scale}) translate(${position.x}%, ${position.y}%)`,
                transformOrigin: 'center center',
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* Grid overlay hint */}
          <div className="absolute inset-0 pointer-events-none opacity-20" 
               style={{
                 backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
                 backgroundSize: '33.33% 33.33%',
                 display: 'none'
               }} 
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 p-4 border-t border-white/10">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Alejar"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Acercar"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all ml-2"
            title="Restablecer"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blis-red rounded-xl text-white font-medium hover:bg-blis-red/90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Check className="w-4 h-4" />
            )}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}