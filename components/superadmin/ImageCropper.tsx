"use client";

import { useState, useRef, useCallback } from "react";
import { X, RotateCw, FlipHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export function ImageCropper({ src, onCrop, onCancel }: { src: string; onCrop: (base64: string) => void; onCancel: () => void }) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flipX, setFlipX] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const clampPosition = useCallback((pos: { x: number; y: number }, currentZoom: number, currentRotation: number) => {
        if (!imageRef.current || !containerRef.current) return pos;
        const containerW = containerRef.current.offsetWidth;
        const containerH = containerRef.current.offsetHeight;
        const img = imageRef.current;
        let imgW = img.naturalWidth * currentZoom;
        let imgH = img.naturalHeight * currentZoom;
        if (currentRotation % 180 !== 0) [imgW, imgH] = [imgH, imgW];
        const limitX = Math.max(0, (imgW - containerW) / 2);
        const limitY = Math.max(0, (imgH - containerH) / 2);
        return { x: Math.min(Math.max(pos.x, -limitX), limitX), y: Math.min(Math.max(pos.y, -limitY), limitY) };
    }, []);

    const onImageLoad = () => {
        if (!imageRef.current || !containerRef.current) return;
        const containerW = containerRef.current.offsetWidth;
        const containerH = containerRef.current.offsetHeight;
        const img = imageRef.current;
        const initialZoom = Math.max(containerW / img.naturalWidth, containerH / img.naturalHeight);
        setZoom(initialZoom);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const newPos = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
            setPosition(clampPosition(newPos, zoom, rotation));
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newZoom = Math.min(Math.max(zoom + delta, 0.01), 10);
        setZoom(newZoom);
        setPosition(prev => clampPosition(prev, newZoom, rotation));
    };

    const rotate = () => setRotation(prev => (prev + 90) % 360);
    const flip = () => setFlipX(prev => prev * -1);

    const doCrop = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx || !imageRef.current || !containerRef.current) return;
        const cropWidth = 1200;
        const cropHeight = 630;
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const container = containerRef.current;
        const scaleX = cropWidth / container.offsetWidth;
        const scaleY = cropHeight / (container.offsetWidth * (630 / 1200));

        ctx.save();
        ctx.translate(cropWidth / 2, cropHeight / 2);
        ctx.translate(position.x * scaleX, position.y * scaleY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom * flipX * scaleX, zoom * scaleY);
        ctx.drawImage(imageRef.current, -imageRef.current.naturalWidth / 2, -imageRef.current.naturalHeight / 2);
        ctx.restore();
        onCrop(canvas.toDataURL("image/jpeg", 0.95));
    };

    return (
        <div id="image-cropper-overlay" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4" onWheel={handleWheel}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950 border border-white/10 rounded-[3rem] p-10 max-w-2xl w-full space-y-8 shadow-2xl" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Recortar Portada del Artículo</h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Ajusta la imagen al formato panorámico (16:9)</p>
                    </div>
                    <button type="button" onClick={onCancel} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div ref={containerRef} className="aspect-[1200/630] w-full bg-black rounded-[2rem] overflow-hidden border border-white/5 cursor-move relative touch-none flex items-center justify-center" onMouseDown={handleMouseDown}>
                    <div className="relative" style={{ width: 0, height: 0 }}>
                        <img ref={imageRef} src={src} crossOrigin="anonymous" onLoad={onImageLoad} alt="Crop" className="max-w-none select-none pointer-events-none" style={{ transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom * flipX}, ${zoom})`, transformOrigin: "center center", position: 'absolute', left: -(imageRef.current?.naturalWidth || 0) / 2, top: -(imageRef.current?.naturalHeight || 0) / 2 }} />
                    </div>
                    <div className="absolute inset-0 border-2 border-blis-red/40 pointer-events-none" />
                </div>
                <div className="flex gap-4">
                    <button type="button" onClick={rotate} className="flex-1 p-4 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"><RotateCw className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Girar</span></button>
                    <button type="button" onClick={flip} className="flex-1 p-4 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"><FlipHorizontal className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Espejo</span></button>
                </div>
                <div className="flex gap-4 pt-2">
                    <button type="button" onClick={onCancel} className="flex-1 py-5 bg-zinc-900 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/5 transition-all">Cancelar</button>
                    <button type="button" onClick={doCrop} className="flex-1 py-5 bg-blis-red text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all">Guardar</button>
                </div>
            </motion.div>
        </div>
    );
}
