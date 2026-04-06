"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    X, AlertCircle, RotateCw, FlipHorizontal,
    Bold, Italic, Underline, List, ListOrdered,
    Heading1, Heading2, Link as LinkBtn, Quote, Code,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette,
    Smile, Strikethrough, Trash, Undo, Redo, Eraser,
    FileCode, Upload, Scissors, GripHorizontal, Sparkles, Image as ImageIcon, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function RichTextEditor({
    value,
    onChange,
    placeholder,
    onAIGenerate,
    isGeneratingAI,
    onCancelAIGenerate,
    onImageSearch,
    minHeight = "500px"
}: {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    onAIGenerate?: (title: string, idea: string) => void;
    isGeneratingAI?: boolean;
    onCancelAIGenerate?: () => void;
    onImageSearch?: () => void;
    minHeight?: string;
}) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [modal, setModal] = useState<{ type: 'link' | 'embed' | 'error', message?: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(value);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [savedSelection, setSavedSelection] = useState<Range | null>(null);
    const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);

    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const [showSizes, setShowSizes] = useState(false);
    const [showInlineAI, setShowInlineAI] = useState(false);
    const [inlineTitle, setInlineTitle] = useState("");
    const [inlineIdea, setInlineIdea] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isGeneratingAI) {
            setElapsedSeconds(35);
            interval = setInterval(() => {
                setElapsedSeconds(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else {
            setElapsedSeconds(35);
        }
        return () => clearInterval(interval);
    }, [isGeneratingAI]);

    const selectedImage = selectedImageId && editorRef.current ? (editorRef.current.querySelector(`#${selectedImageId}`) as HTMLImageElement) : null;

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            setSavedSelection(sel.getRangeAt(0).cloneRange());
        }
    };

    const [selectedColor, setSelectedColor] = useState('#FFFFFF');
    const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 });

    useEffect(() => {
        if (value !== localValue && document.activeElement !== editorRef.current) {
            setLocalValue(value);
            if (editorRef.current) editorRef.current.innerHTML = value;
        }
        document.execCommand('defaultParagraphSeparator', false, 'p');
    }, [value]);

    useEffect(() => {
        if (!isHtmlMode && editorRef.current && editorRef.current.innerHTML !== localValue) {
            editorRef.current.innerHTML = localValue;
        }
    }, [isHtmlMode, localValue]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImage && (e.key === 'Backspace' || e.key === 'Delete')) {
                e.preventDefault();
                selectedImage.remove();
                setSelectedImageId(null);
                if (editorRef.current) {
                    const val = editorRef.current.innerHTML;
                    setLocalValue(val);
                    onChange(val);
                }
            }
        };
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Element;
            if (selectedImage && !target.closest('#img-toolbar') && !target.closest('#image-cropper-overlay') && e.target !== selectedImage) {
                setSelectedImageId(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedImage, onChange]);

    const execCommand = (command: string, val: string = "") => {
        if (isHtmlMode) {
            if (!textareaRef.current) return;
            const textarea = textareaRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = localValue.substring(start, end);
            let injection = '';

            switch (command) {
                case 'bold': injection = `<strong>${selectedText || 'Texto'}</strong>`; break;
                case 'italic': injection = `<em>${selectedText || 'Texto'}</em>`; break;
                case 'underline': injection = `<u>${selectedText || 'Texto'}</u>`; break;
                case 'strikeThrough': injection = `<del>${selectedText || 'Texto'}</del>`; break;
                case 'justifyLeft': injection = `<div style="text-align: left;">${selectedText || 'Texto'}</div>`; break;
                case 'justifyCenter': injection = `<div style="text-align: center;">${selectedText || 'Texto'}</div>`; break;
                case 'justifyRight': injection = `<div style="text-align: right;">${selectedText || 'Texto'}</div>`; break;
                case 'justifyFull': injection = `<div style="text-align: justify;">${selectedText || 'Texto'}</div>`; break;
                case 'insertUnorderedList': injection = `<ul>\n  <li>${selectedText || 'Elemento'}</li>\n</ul>`; break;
                case 'insertOrderedList': injection = `<ol>\n  <li>${selectedText || 'Elemento'}</li>\n</ol>`; break;
                case 'insertText': injection = val; break;
                case 'insertHTML': injection = val; break;
                case 'createLink': injection = `<a href="${val}">${selectedText || 'Enlace'}</a>`; break;
                case 'undo': document.execCommand('undo'); return;
                case 'redo': document.execCommand('redo'); return;
                case 'removeFormat': injection = selectedText.replace(/<[^>]+>/g, ''); break;
                case 'formatBlock':
                    if (val === 'BLOCKQUOTE' || val === '<BLOCKQUOTE>') injection = `<blockquote>${selectedText || 'Cita'}</blockquote>`;
                    else if (val === 'H1' || val === '<H1>') injection = `<h1>${selectedText || 'Título'}</h1>`;
                    else if (val === 'H2' || val === '<H2>') injection = `<h2>${selectedText || 'Subtítulo'}</h2>`;
                    else if (val === 'P' || val === '<P>') injection = `<p>${selectedText || 'Párrafo'}</p>`;
                    break;
                case 'fontSize':
                    const sizeMap: Record<string, string> = { '1': '10px', '3': '16px', '5': '24px', '7': '32px' };
                    injection = `<span style="font-size: ${sizeMap[val] || '16px'}">${selectedText || 'Texto'}</span>`;
                    break;
                case 'foreColor':
                    injection = `<span style="color: ${val}">${selectedText || 'Texto'}</span>`;
                    break;
                default: return;
            }

            if (injection) {
                const newContent = localValue.substring(0, start) + injection + localValue.substring(end);
                setLocalValue(newContent);
                onChange(newContent);
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.focus();
                        textareaRef.current.setSelectionRange(start + injection.length, start + injection.length);
                    }
                }, 0);
            }
            return;
        }

        if (editorRef.current) {
            document.execCommand(command, false, val);
            const newContent = editorRef.current.innerHTML;
            setLocalValue(newContent);
            onChange(newContent);
        }
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 255, g: 255, b: 255 };
    };

    const handleColorChange = (hex: string) => {
        setSelectedColor(hex);
        setRgb(hexToRgb(hex));
        execCommand('foreColor', hex);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2024 * 1024) {
                setModal({ type: 'error', message: 'La imagen excede el límite de 2MB.' });
                return;
            }
            const reader = new FileReader();
            reader.onload = (prev) => {
                const base64 = prev.target?.result as string;
                execCommand('insertImage', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const Emojis = [
        '😀', '🤣', '😍', '😎', '🤔', '😴', '🤩', '🥳', '😱', '😡', '🤡', '😇',
        '🔥', '⭐', '✅', '🚀', '💡', '💎', '🎯', '📍', '📢', '⚠️', '✨', '🎓',
        '🏆', '💻', '📱', '📈', '🎨', '🛠️', '🧪', '📅', '⏰', '🔒', '🔑', '❤️',
        '👀', '🙌', '👏', '🤝', '💯', '🌟', '🎈'
    ];

    const RenderToolbar = () => (
        <div className="flex flex-wrap items-center gap-1.5 p-3 px-6 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 overflow-visible z-10 w-full rounded-t-3xl">
            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5 items-center px-1 gap-1">
                <button
                    type="button"
                    onClick={() => setIsHtmlMode(!isHtmlMode)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${isHtmlMode ? 'bg-blis-red text-white' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    <FileCode className="w-3.5 h-3.5" /> HTML
                </button>

                <div className="w-px h-4 bg-white/10 mx-1 self-center" />

                <div className="relative">
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); saveSelection(); setShowSizes(!showSizes); setShowColorPicker(false); }}
                        className="bg-transparent text-gray-400 focus:outline-none hover:text-white cursor-pointer h-[30px] px-3 flex items-center justify-center min-w-max transition-all"
                        title="Tamaño de Letra"
                    >
                        <div className="flex items-baseline font-serif font-black tracking-tighter">
                            <span className="text-[10px]">a</span>
                            <span className="text-[14px]">A</span>
                        </div>
                    </button>
                    <AnimatePresence>
                        {showSizes && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-[200] w-32 overflow-hidden flex flex-col">
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '3'); setShowSizes(false); }} className="px-4 py-3 text-left hover:bg-white/5 text-[10px] font-bold text-gray-300 uppercase tracking-widest">A Normal</button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '1'); setShowSizes(false); }} className="px-4 py-3 text-left hover:bg-white/5 text-[8px] font-bold text-gray-400 uppercase tracking-widest border-t border-white/5">A Pequeño</button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '5'); setShowSizes(false); }} className="px-4 py-3 text-left hover:bg-white/5 text-[12px] font-black text-white uppercase tracking-widest border-t border-white/5">A Grande</button>
                                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '7'); setShowSizes(false); }} className="px-4 py-3 text-left hover:bg-white/5 text-[14px] font-black text-purple-400 uppercase tracking-widest border-t border-white/5">A Enorme</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('undo'); }} title="Deshacer" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Undo className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('redo'); }} title="Rehacer" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Redo className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} title="Negrita" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Bold className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} title="Cursiva" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Italic className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} title="Subrayado" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Underline className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('strikeThrough'); }} title="Tachado" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Strikethrough className="w-3.5 h-3.5" /></button>
                <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<P>'); }} title="Párrafo Normal" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all font-serif font-bold text-xs">P</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<H1>'); }} title="Título H1" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Heading1 className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<H2>'); }} title="Subtítulo H2" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Heading2 className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<BLOCKQUOTE>'); }} title="Cita Blockquote" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Quote className="w-3.5 h-3.5" /></button>
                <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('removeFormat'); }} title="Limpiar Formato" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Eraser className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft'); }} title="Izquierda" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignLeft className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter'); }} title="Centro" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignCenter className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }} title="Derecha" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignRight className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyFull'); }} title="Justificar" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignJustify className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} title="Lista Puntos" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><List className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }} title="Lista Números" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><ListOrdered className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); setModal({ type: 'embed' }); }} title="Insertar Código (Iframe/Script)" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><FileCode className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} title="Subir Imagen Local" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Upload className="w-3.5 h-3.5" /></button>
                {onImageSearch && (
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); onImageSearch(); }} title="Buscar Imágenes Premium" className="p-2 hover:bg-purple-500/20 text-purple-400 hover:text-white rounded-lg transition-all"><Search className="w-3.5 h-3.5" /></button>
                )}
            </div>

            <div className="relative">
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowColorPicker(!showColorPicker); setShowSizes(false); }}
                    className="flex bg-white/5 rounded-xl p-0.5 border border-white/5 items-center px-2 hover:border-blis-red/30 transition-all cursor-pointer h-[38px] group"
                >
                    <Palette className="w-3.5 h-3.5 text-gray-400 mr-2 group-hover:text-white transition-colors" />
                    <div className="w-5 h-5 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: selectedColor }} />
                </button>

                <AnimatePresence>
                    {showColorPicker && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-3 p-5 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl z-[100] w-64 space-y-4 ring-1 ring-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Selector Pro</span>
                                <button onClick={() => setShowColorPicker(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                            </div>

                            <div className="grid grid-cols-6 gap-2 mb-4">
                                {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#BE0B3C', '#F59E0B', '#10B981', '#3B82F6'].map(color => (
                                    <button key={color} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { handleColorChange(color); execCommand('foreColor', color); setShowColorPicker(false); }} className="w-full aspect-square rounded-full border border-white/20 shadow-inner hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 py-3 border-t border-white/10">
                                <div className="space-y-1 w-full">
                                    <label className="text-[8px] font-bold text-gray-500 uppercase px-1">Personalizado (Hex)</label>
                                    <div className="relative w-full flex items-center">
                                        <div className="absolute left-1.5 z-10 w-6 h-6 rounded-md overflow-hidden border border-white/20">
                                            <input type="color" value={selectedColor} onChange={(e) => handleColorChange(e.target.value)} className="w-10 h-10 p-0 border-0 absolute -top-2 -left-2 cursor-pointer" />
                                        </div>
                                        <input type="text" value={selectedColor} onChange={(e) => handleColorChange(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-2 py-2 text-[10px] text-white focus:outline-none focus:border-blis-red font-mono uppercase tracking-widest" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <div className="relative">
                    <button type="button" onClick={() => setShowEmoji(!showEmoji)} title="Emojis" className="p-2 hover:bg-white/10 text-amber-500 rounded-lg transition-all"><Smile className="w-3.5 h-3.5" /></button>
                    <AnimatePresence>
                        {showEmoji && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-full left-0 mt-3 p-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] grid grid-cols-6 gap-3 w-64 ring-2 ring-black/50">
                                {Emojis.map(e => (
                                    <button key={e} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { execCommand('insertText', e); setShowEmoji(false); }} className="text-2xl hover:scale-125 hover:rotate-6 transition-transform active:scale-95 py-1 flex items-center justify-center filter drop-shadow-md">{e}</button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex-1" />

            {onAIGenerate && !showInlineAI && (
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInlineAI(true); }}
                    className="flex bg-gradient-to-r from-purple-600/20 to-purple-500/10 border border-purple-500/30 rounded-xl items-center px-4 py-2 hover:from-purple-600/30 hover:to-purple-500/20 transition-all text-[11px] font-black tracking-[0.2em] uppercase text-purple-400 gap-2 shadow-[0_0_15px_rgba(168,85,247,0.15)] whitespace-nowrap w-full md:w-auto justify-center md:justify-start relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
                    <Sparkles className="w-4 h-4" /> Redactar con IA
                </button>
            )}

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
    );

    return (
        <div className={`w-full bg-zinc-950 border border-white/10 rounded-3xl overflow-visible transition-all relative shadow-2xl flex flex-col`} style={{ minHeight }}>
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {modal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md space-y-6 shadow-2xl ring-1 ring-white/10">
                                <div className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest">
                                    <div className="p-2 bg-gradient-to-tr from-blis-red to-orange-500 rounded-lg shadow-lg">
                                        {modal.type === 'error' ? <AlertCircle className="w-4 h-4 text-white" /> : modal.type === 'embed' ? <FileCode className="w-4 h-4 text-white" /> : <LinkBtn className="w-4 h-4 text-white" />}
                                    </div>
                                    {modal.type === 'error' ? 'Aviso del Sistema' : modal.type === 'embed' ? 'Incrustar Contenido' : 'Añadir Enlace'}
                                </div>

                                <div className="space-y-4">
                                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                                        {modal.message || (modal.type === 'embed' ? 'Pega el código iframe o script profesional aquí. Se cargará instantáneamente en el editor.' : 'Introduce la URL de destino completa para el enlace seleccionado.')}
                                    </p>
                                    {modal.type !== 'error' && (
                                        <textarea id="modal-input" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs focus:outline-none focus:border-blis-red min-h-[120px] transition-all resize-none" placeholder={modal.type === 'embed' ? '<iframe src="..." />' : 'https://bliscorp.com/...'} />
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setModal(null)} className="flex-1 py-4 bg-white/5 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all">Cancelar</button>
                                    {modal.type !== 'error' && (
                                        <button onClick={() => {
                                            const input = document.getElementById('modal-input') as HTMLTextAreaElement;
                                            if (modal.type === 'embed') execCommand('insertHTML', input.value);
                                            else execCommand('createLink', input.value);
                                            setModal(null);
                                        }} className="flex-1 py-4 bg-blis-red text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blis-red/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Aplicar</button>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {RenderToolbar()}

            <AnimatePresence>
                {onAIGenerate && showInlineAI && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full bg-black/50 border-b border-purple-500/40 overflow-hidden relative z-40 shadow-[0_30px_60px_rgba(168,85,247,0.15)] flex flex-col md:flex-row items-stretch">
                        <div className="flex px-6 py-5 border-b md:border-b-0 md:border-r border-purple-500/20 bg-purple-500/10 w-full md:w-1/3 lg:w-1/4 shrink-0 items-center">
                            <Sparkles className="w-5 h-5 text-purple-400 mr-3 shrink-0" />
                            <textarea
                                placeholder="TÍTULO SUGERIDO..."
                                value={inlineTitle}
                                onChange={(e) => setInlineTitle(e.target.value)}
                                className="bg-transparent border-0 text-white text-sm font-bold focus:ring-0 focus:outline-none w-full placeholder:text-purple-300/50 resize-none min-h-[50px] leading-relaxed self-center flex items-center pt-3"
                                disabled={isGeneratingAI}
                            />
                        </div>
                        <textarea
                            placeholder="Describe detalladamente de qué trata el artículo. Yo haré el resto de la magia..."
                            value={inlineIdea}
                            onChange={(e) => setInlineIdea(e.target.value)}
                            className="bg-transparent text-white text-sm font-medium px-5 py-4 w-full flex-1 focus:outline-none resize-none placeholder:text-gray-500 min-h-[80px] md:min-h-[auto]"
                            disabled={isGeneratingAI}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && inlineIdea && !isGeneratingAI) {
                                    e.preventDefault();
                                    if (onAIGenerate) onAIGenerate(inlineTitle || "Título sugerido por IA", inlineIdea);
                                }
                            }}
                            autoFocus
                        />
                        <div className="flex border-t md:border-t-0 border-purple-500/20 w-full md:w-auto bg-black/40 xl:min-w-[250px]">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault(); e.stopPropagation();
                                    if (isGeneratingAI) {
                                        if (onCancelAIGenerate) onCancelAIGenerate();
                                    } else if (inlineIdea) {
                                        if (onAIGenerate) onAIGenerate(inlineTitle || "Título sugerido por IA", inlineIdea);
                                    }
                                }}
                                disabled={!inlineIdea && !isGeneratingAI}
                                className={`text-white disabled:opacity-50 px-6 py-4 md:py-0 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 flex-1 shadow-[inset_0_1px_rgba(255,255,255,0.2)] ${isGeneratingAI ? 'bg-red-500 hover:bg-red-400' : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500'}`}
                            >
                                {isGeneratingAI ? <X className="w-4 h-4" /> : 'CREAR'}
                                {isGeneratingAI ? `DETENER (${elapsedSeconds}s)` : ''}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowInlineAI(false)}
                                className="px-5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center border-l border-purple-500/20 md:flex-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedImage && (
                <div id="img-toolbar" className="bg-zinc-900 border-b border-white/5 p-2 px-6 flex items-center justify-between z-[50]">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest hidden sm:block">Ajustes de Imagen</span>
                        <div className="flex gap-1.5 items-center bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                            <span className="text-[8px] font-black text-gray-500 uppercase">Tamaño</span>
                            <input type="range" min="10" max="100" value={parseInt(selectedImage.style.width || "100")} onChange={(e) => { selectedImage.style.width = `${e.target.value}%`; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val); }} className="w-20 sm:w-32 accent-blis-red" />
                            <span className="text-[9px] font-black uppercase text-white w-8 text-right">{parseInt(selectedImage.style.width || "100")}%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                            <button onMouseDown={(e) => { e.preventDefault(); selectedImage.style.display = 'block'; selectedImage.style.marginLeft = '0'; selectedImage.style.marginRight = 'auto'; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><AlignLeft className="w-3.5 h-3.5" /></button>
                            <button onMouseDown={(e) => { e.preventDefault(); selectedImage.style.display = 'block'; selectedImage.style.marginLeft = 'auto'; selectedImage.style.marginRight = 'auto'; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><AlignCenter className="w-3.5 h-3.5" /></button>
                            <button onMouseDown={(e) => { e.preventDefault(); selectedImage.style.display = 'block'; selectedImage.style.marginLeft = 'auto'; selectedImage.style.marginRight = '0'; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><AlignRight className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="hidden sm:flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                            <button onMouseDown={(e) => { e.preventDefault(); let c = selectedImage.style.transform || ''; let m = c.match(/rotate\((\d+)deg\)/); let d = m ? (parseInt(m[1]) + 90) % 360 : 90; selectedImage.style.transform = c.replace(/rotate\([^)]+\)/, '').trim() + ` rotate(${d}deg)`; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-1 transition-colors px-2"><RotateCw className="w-3.5 h-3.5 mr-1" /><span className="text-[8px] font-black uppercase">Girar</span></button>
                            <button onMouseDown={(e) => { e.preventDefault(); let c = selectedImage.style.transform || ''; let m = c.match(/scaleX\((-?\d+)\)/); let s = m ? parseInt(m[1]) * -1 : -1; selectedImage.style.transform = c.replace(/scaleX\([^)]+\)/, '').trim() + ` scaleX(${s})`; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-1 transition-colors px-2"><FlipHorizontal className="w-3.5 h-3.5 mr-1" /><span className="text-[8px] font-black uppercase">Espejo</span></button>
                            <button onMouseDown={(e) => { e.preventDefault(); setCroppingImageSrc(selectedImage.src); }} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg flex items-center transition-colors px-2"><Scissors className="w-3.5 h-3.5 mr-1" /><span className="text-[8px] font-black uppercase">Cortar</span></button>
                        </div>
                        <button onMouseDown={(e) => { e.preventDefault(); selectedImage.remove(); setSelectedImageId(null); const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val); }} className="p-1.5 px-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"><Trash className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col relative">
                {isHtmlMode ? (
                    <textarea
                        ref={textareaRef}
                        value={localValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            setLocalValue(val);
                            onChange(val);
                        }}
                        className={`w-full px-8 py-10 bg-zinc-950/50 text-[14px] text-emerald-400/80 font-mono focus:outline-none leading-[1.8] overflow-y-auto scroll-smooth flex-1 rounded-b-3xl resize-none`}
                        placeholder="<h1>Escribe tu código HTML aquí...</h1>"
                    />
                ) : (
                    <div
                        ref={editorRef}
                        contentEditable
                        onClick={(e) => {
                            saveSelection();
                            if ((e.target as HTMLElement).tagName === 'IMG') {
                                const img = e.target as HTMLImageElement;
                                if (!img.id) img.id = `img_${Date.now()}`;
                                setSelectedImageId(img.id);
                                if (!img.style.width) img.style.width = '100%';
                            } else {
                                setSelectedImageId(null);
                            }
                        }}
                        onKeyUp={saveSelection}
                        onMouseUp={saveSelection}
                        onInput={(e) => {
                            const val = e.currentTarget.innerHTML;
                            setLocalValue(val);
                            onChange(val);
                        }}
                        className={`w-full px-8 py-10 text-[18px] text-gray-300 focus:outline-none font-medium leading-[1.9] prose prose-invert flex-1 overflow-y-auto scroll-smooth rounded-b-3xl
                        prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                        prose-h1:text-4xl prose-h2:text-2xl prose-blockquote:border-l-4 prose-blockquote:border-blis-red prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:rounded-r-xl
                        [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:mb-6 [&_ul_li]:mb-2 [&_ul_li::marker]:text-white/40
                        [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:mb-6 [&_ol_li]:mb-2 [&_ol_li::marker]:text-white/40 [&_ol_li::marker]:font-bold
                        [&_img]:rounded-xl [&_img]:shadow-2xl [&_img]:transition-all [&_img]:mt-6 [&_img]:mb-6
                        ${selectedImage ? '[&_img]:opacity-50' : ''}`}
                        style={{ whiteSpace: 'normal', overflowWrap: 'break-word', wordWrap: 'break-word', minHeight: '300px' }}
                    />
                )}
                {!isHtmlMode && (!localValue || localValue === '<br>') && (
                    <div className="absolute top-[40px] left-8 pointer-events-none text-gray-600 text-lg opacity-50 select-none">{placeholder}</div>
                )}
            </div>

            {croppingImageSrc && typeof document !== 'undefined' && createPortal(
                <ImageCropper
                    src={croppingImageSrc}
                    onCrop={(base64) => {
                        if (selectedImageId && editorRef.current) {
                            const img = editorRef.current.querySelector(`#${selectedImageId}`) as HTMLImageElement;
                            if (img) {
                                img.src = base64;
                                img.removeAttribute('style');
                                img.style.width = '100%';
                                img.style.display = 'block';
                                img.style.margin = '0 auto';
                                const val = editorRef.current.innerHTML;
                                setLocalValue(val);
                                onChange(val);
                            }
                        }
                        setCroppingImageSrc(null);
                    }}
                    onCancel={() => setCroppingImageSrc(null)}
                />,
                document.body
            )}
        </div>
    );
}
