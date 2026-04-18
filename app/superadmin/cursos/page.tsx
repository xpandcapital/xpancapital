"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Plus, Search, BookOpen, Video, FileText,
    Save, Eye, Trash2, ChevronRight, X,
    CheckCircle2, AlertCircle, Layers,
    Clock, Award, Settings, Download,
    GraduationCap, ListChecks, GripVertical,
    Type, Play, Link as LinkIcon, FileUp,
    Coins, Image as ImageIcon, Camera, RotateCw, FlipHorizontal,
    Check, DollarSign, Bold, Italic, Underline, List, ListOrdered,
    Heading1, Heading2, Link as LinkBtn, Quote, Code,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Maximize2,
    Smile, ImagePlus, Strikethrough, Superscript, Subscript,
    Trash, Undo, Redo, Eraser, Table as TableIcon,
    MonitorPlay, FileCode, Upload, Scissors, GripHorizontal, Edit,
    ChevronUp, ChevronDown, Sparkles, EyeOff, Loader2, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
    id: string;
    text: string;
    options: { id: string; text: string; isCorrect: boolean }[];
}

interface Lesson {
    id: string;
    title: string;
    type: "video" | "text" | "quiz";
    content: string;
    videoUrl?: string;
    attachments: string[];
    questions?: Question[];
    isQuizEnabled?: boolean;
}

interface Module {
    id: string;
    title: string;
    description?: string;
    lessons: Lesson[];
    questions?: Question[];
    isQuizEnabled?: boolean;
    isOpen?: boolean; // UI state for accordion
}

interface Course {
    id: string;
    title: string;
    category: string;
    price: number;
    status: "Borrador" | "Publicado";
    modules: Module[];
    lastSaved?: string;
    hasCertificate: boolean;
    allowComments: boolean;
    bliscoins: number;
    image: string | null;
    certificateTemplateId: string | null;
    paraEquipo: boolean;
}

function ImageCropper({ src, onCrop, onCancel }: { src: string; onCrop: (base64: string) => void; onCancel: () => void }) {
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
        const containerSize = containerRef.current.offsetWidth;
        const img = imageRef.current;
        let imgW = img.naturalWidth * currentZoom;
        let imgH = img.naturalHeight * currentZoom;
        if (currentRotation % 180 !== 0) [imgW, imgH] = [imgH, imgW];
        const limitX = Math.max(0, (imgW - containerSize) / 2);
        const limitY = Math.max(0, (imgH - containerSize) / 2);
        return { x: Math.min(Math.max(pos.x, -limitX), limitX), y: Math.min(Math.max(pos.y, -limitY), limitY) };
    }, []);

    const onImageLoad = () => {
        if (!imageRef.current || !containerRef.current) return;
        const container = containerRef.current.offsetWidth;
        const img = imageRef.current;
        const initialZoom = Math.max(container / img.naturalWidth, container / img.naturalHeight);
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
        const cropSize = 500;
        canvas.width = cropSize;
        canvas.height = cropSize;
        const container = containerRef.current;
        const scale = cropSize / container.offsetWidth;
        ctx.save();
        ctx.translate(cropSize / 2, cropSize / 2);
        ctx.translate(position.x * scale, position.y * scale);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom * flipX * scale, zoom * scale);
        ctx.drawImage(imageRef.current, -imageRef.current.naturalWidth / 2, -imageRef.current.naturalHeight / 2);
        ctx.restore();
        onCrop(canvas.toDataURL("image/jpeg", 0.95));
    };

    return (
        <div id="image-cropper-overlay" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4" onWheel={handleWheel}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950 border border-white/10 rounded-[3rem] p-10 max-w-md w-full space-y-8 shadow-2xl" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Recortar Portada</h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Ajusta la imagen al formato cuadrado</p>
                    </div>
                    <button type="button" onClick={onCancel} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div ref={containerRef} className="aspect-square w-full bg-black rounded-[2rem] overflow-hidden border border-white/5 cursor-move relative touch-none flex items-center justify-center" onMouseDown={handleMouseDown}>
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

function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder: string }) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFull, setIsFull] = useState(false);
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const selectedImage = selectedImageId && editorRef.current ? (editorRef.current.querySelector(`#${selectedImageId}`) as HTMLImageElement) : null;

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            setSavedSelection(sel.getRangeAt(0).cloneRange());
        }
    };

    // Color Picker State
    const [selectedColor, setSelectedColor] = useState('#FFFFFF');
    const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 });

    // Only update local value if it changes from outside AND we are not focused
    useEffect(() => {
        if (value !== localValue && document.activeElement !== editorRef.current) {
            setLocalValue(value);
            if (editorRef.current) editorRef.current.innerHTML = value;
        }
        // Ensure consistent paragraph behavior
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
                // We use timeout to restore cursor position after React re-renders the updated localValue
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.focus();
                        textareaRef.current.setSelectionRange(start + injection.length, start + injection.length);
                    }
                }, 0);
            }
            return;
        }

        // Visual mode: buttons use onMouseDown + e.preventDefault() so editor never loses focus.
        // Just call execCommand directly — no focus or selection manipulation needed.
        if (editorRef.current) {
            document.execCommand(command, false, val);
            const newContent = editorRef.current.innerHTML;
            setLocalValue(newContent);
            onChange(newContent);
        }
    };

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    };

    const rgbToHex = (r: number, g: number, b: number) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    };

    const handleColorChange = (hex: string) => {
        setSelectedColor(hex);
        setRgb(hexToRgb(hex));
        execCommand('foreColor', hex);
    };

    const handleRgbChange = (part: 'r' | 'g' | 'b', val: string) => {
        const n = Math.max(0, Math.min(255, parseInt(val) || 0));
        const newRgb = { ...rgb, [part]: n };
        setRgb(newRgb);
        const hc = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        setSelectedColor(hc);
        execCommand('foreColor', hc);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                setModal({ type: 'error', message: 'La imagen excede el límite de 1MB.' });
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

    const Toolbar = () => (
        <div className="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-950 border-b border-white/10 overflow-visible relative z-[100]">
            {/* HTML Mode Toggle & Size Dropdown */}
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
                        onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowSizes(!showSizes); setShowColorPicker(false); }}
                        className="bg-transparent text-gray-400 text-[10px] uppercase font-bold tracking-widest py-1.5 px-3 focus:outline-none hover:text-white cursor-pointer h-full flex items-center justify-center min-w-[70px]"
                    >
                        A Tamaño
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

            {/* History */}
            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('undo'); }} title="Deshacer" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Undo className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('redo'); }} title="Rehacer" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Redo className="w-3.5 h-3.5" /></button>
            </div>

            {/* Typography */}
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

            {/* Alignments */}
            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft'); }} title="Izquierda" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignLeft className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter'); }} title="Centro" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignCenter className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }} title="Derecha" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignRight className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyFull'); }} title="Justificar" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignJustify className="w-3.5 h-3.5" /></button>
            </div>

            {/* Lists */}
            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} title="Lista Puntos" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><List className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }} title="Lista Números" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><ListOrdered className="w-3.5 h-3.5" /></button>
            </div>

            {/* Media & Embed */}
            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); setModal({ type: 'embed' }); }} title="Insertar Código (Iframe/Script)" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><FileCode className="w-3.5 h-3.5" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} title="Subir Imagen Local" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Upload className="w-3.5 h-3.5" /></button>
            </div>

            <div className="relative">
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowColorPicker(!showColorPicker); setShowSizes(false); }}
                    className="flex bg-white/5 rounded-xl p-0.5 border border-white/5 items-center px-2 hover:border-blis-red/30 transition-all cursor-pointer h-[38px] group"
                >
                    <Palette className="w-3.5 h-3.5 text-gray-400 mr-2 group-hover:text-white transition-colors" />
                    <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
                        style={{ backgroundColor: selectedColor }}
                    />
                </button>

                <AnimatePresence>
                    {showColorPicker && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-3 p-5 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl z-[100] w-64 space-y-4 ring-1 ring-white/10"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Selector Pro</span>
                                <button onClick={() => setShowColorPicker(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
                            </div>

                            {/* Preset Colors */}
                            <div className="grid grid-cols-6 gap-2 mb-4">
                                {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#BE0B3C', '#F59E0B', '#10B981', '#3B82F6'].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => { handleColorChange(color); execCommand('foreColor', color); setShowColorPicker(false); }}
                                        className="w-full aspect-square rounded-full border border-white/20 shadow-inner hover:scale-125 transition-transform"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 py-3 border-t border-white/10">
                                <div className="space-y-1 w-full">
                                    <label className="text-[8px] font-bold text-gray-500 uppercase px-1">Personalizado (Hex)</label>
                                    <div className="relative w-full flex items-center">
                                        <div className="absolute left-1.5 z-10 w-6 h-6 rounded-md overflow-hidden border border-white/20">
                                            <input
                                                type="color"
                                                value={selectedColor}
                                                onChange={(e) => handleColorChange(e.target.value)}
                                                className="w-10 h-10 p-0 border-0 absolute -top-2 -left-2 cursor-pointer"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={selectedColor}
                                            onChange={(e) => handleColorChange(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-2 py-2 text-[10px] text-white focus:outline-none focus:border-blis-red font-mono uppercase tracking-widest"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Media & Emojis */}
            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
                <div className="relative">
                    <button type="button" onClick={() => setShowEmoji(!showEmoji)} title="Emojis" className="p-2 hover:bg-white/10 text-amber-500 rounded-lg transition-all"><Smile className="w-3.5 h-3.5" /></button>
                    <AnimatePresence>
                        {showEmoji && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute top-full left-0 mt-3 p-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] grid grid-cols-6 gap-3 w-64 ring-2 ring-black/50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
                                {Emojis.map(e => (
                                    <button
                                        key={e}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => { execCommand('insertText', e); setShowEmoji(false); }}
                                        className="text-2xl hover:scale-125 hover:rotate-6 transition-transform active:scale-95 py-1 flex items-center justify-center filter drop-shadow-md"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* No maximize button here per user request */}

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
    );

    return (
        <div className={`w-full bg-zinc-950 border border-white/10 rounded-3xl overflow-visible transition-all relative shadow-2xl ${isFull ? 'fixed inset-4 z-[2000] flex flex-col' : 'z-[50]'}`}>

            <AnimatePresence>
                {modal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md space-y-6 shadow-2xl ring-1 ring-white/10">
                            <div className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest">
                                <div className="p-2 bg-gradient-to-tr from-blis-red to-orange-500 rounded-lg shadow-lg">
                                    {modal.type === 'error' ? <AlertCircle className="w-4 h-4 text-white" /> : modal.type === 'embed' ? <FileCode className="w-4 h-4 text-white" /> : <LinkIcon className="w-4 h-4 text-white" />}
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
            </AnimatePresence>

            {isFull && (
                <div className="p-4 bg-black border-b border-white/5 flex justify-between items-center px-10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em]">Creative Suite / Editor Moderno</span>
                    </div>
                    <button onClick={() => setIsFull(false)} className="px-6 py-2 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/5 flex items-center gap-2 group"><X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" /> Cerrar</button>
                </div>
            )}

            {Toolbar()}

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

            <div className="relative group/editor flex-1 flex flex-col min-h-0 z-[10]">
                {isHtmlMode ? (
                    <textarea
                        ref={textareaRef}
                        value={localValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            setLocalValue(val);
                            onChange(val);
                        }}
                        className={`w-full px-12 py-10 bg-zinc-950/50 text-[14px] text-emerald-400/80 font-mono focus:outline-none leading-[1.8] overflow-y-auto scroll-smooth border-t border-white/5 mt-4 border-r-0 border-l-0 border-b-0
                        ${isFull ? 'flex-1 w-full mx-auto' : 'min-h-[220px] resize-y'}`}
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
                        className={`w-full px-12 py-10 text-[15px] text-gray-200 focus:outline-none font-medium leading-[1.8] prose prose-invert overflow-y-auto scroll-smooth
                        ${isFull ? 'flex-1 w-full mx-auto' : 'min-h-[220px] resize-y'}
                        prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                        prose-h1:text-4xl prose-h2:text-2xl prose-blockquote:border-l-4 prose-blockquote:border-blis-red prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:rounded-r-xl
                        [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:mb-6 [&_ul_li]:mb-2 [&_ul_li::marker]:text-white/40
                        [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:mb-6 [&_ol_li]:mb-2 [&_ol_li::marker]:text-white/40 [&_ol_li::marker]:font-bold
                        [&_img]:rounded-xl [&_img]:shadow-2xl [&_img]:transition-all
                        ${selectedImage ? '[&_img]:opacity-50' : ''}`}
                        style={{
                            whiteSpace: 'normal',
                            overflowWrap: 'break-word',
                            wordWrap: 'break-word',
                        }}
                    />
                )}

                {!isFull && (
                    <div className="absolute bottom-3 right-3 p-1.5 text-gray-800 pointer-events-none group-hover/editor:text-white/20 transition-all">
                        <GripHorizontal className="w-5 h-5 rotate-[-45deg]" />
                    </div>
                )}
            </div>

            {(!localValue || localValue === '<br>') && !isFull && (
                <div className="absolute top-[80px] left-12 pointer-events-none text-gray-800 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 select-none">{placeholder}</div>
            )}

            {croppingImageSrc && (
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
                />
            )}
        </div>
    );
}

export default function AdminCourses() {
    const [view, setView] = useState<"list" | "editor">("list");
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRefForCourse = useRef<HTMLInputElement>(null);
    const [draggedItem, setDraggedItem] = useState<{ type: 'module' | 'lesson'; id: string; moduleId?: string } | null>(null);
    const [certificateTemplates, setCertificateTemplates] = useState<{ id: string; nombre: string }[]>([]);

    // Refs for scrolling to edit sections
    const itemRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    // Fetch courses from Supabase
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/cursos');
            const data = await response.json();
            if (data.success && data.data) {
                const mappedCourses: Course[] = data.data.map((c: {
                    id: string;
                    nombre: string;
                    slug: string;
                    descripcion?: string;
                    modulos?: Module[];
                    precio_coins?: number;
                    precio_usd?: number;
                    activo?: boolean;
                    certificado_template_id?: string;
                    creado_en?: string;
                    para_equipo?: boolean;
                }) => ({
                    id: c.id,
                    title: c.nombre,
                    category: 'Capacitaciones',
                    price: c.precio_usd || 0,
                    status: c.activo ? 'Publicado' : 'Borrador',
                    modules: c.modulos || [],
                    hasCertificate: !!c.certificado_template_id,
                    allowComments: true,
                    bliscoins: c.precio_coins || 0,
                    image: null,
                    certificateTemplateId: c.certificado_template_id || null,
                    paraEquipo: c.para_equipo || false
                }));
                setCourses(mappedCourses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch certificate templates
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('/api/certificados/plantillas');
                const data = await response.json();
                if (data.success && data.data) {
                    setCertificateTemplates(data.data.map((t: { id: string; nombre: string }) => ({
                        id: t.id,
                        nombre: t.nombre
                    })));
                }
            } catch (error) {
                console.error('Error fetching certificate templates:', error);
            }
        };
        fetchTemplates();
        fetchCourses();
    }, []);

    // Real-time Sync with master list
    useEffect(() => {
        if (currentCourse) {
            setCourses(prev => prev.map(c => c.id === currentCourse.id ? currentCourse : c));
        }
    }, [currentCourse]);

    // Autosave Persistence (to LocalStorage/Simulated DB)
    useEffect(() => {
        if (view === "editor" && currentCourse) {
            const timer = setTimeout(() => {
                saveBorrador();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [currentCourse, view]);

    const saveBorrador = async (statusOverride?: "Borrador" | "Publicado") => {
        if (!currentCourse) return;
        setIsSaving(true);
        
        try {
            const effectiveStatus = statusOverride || currentCourse.status;
            const slug = currentCourse.title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') || `curso-${Date.now()}`;

            const courseData = {
                nombre: currentCourse.title || 'Sin título',
                slug: slug,
                descripcion: currentCourse.category,
                modulos: currentCourse.modules,
                precio_coins: currentCourse.bliscoins || 0,
                precio_usd: currentCourse.price || 0,
                activo: effectiveStatus === 'Publicado',
                certificado_template_id: currentCourse.certificateTemplateId || null,
                para_equipo: currentCourse.paraEquipo || false
            };

            const isNew = currentCourse.id.startsWith('new') || currentCourse.id.length < 10;
            
            const response = await fetch('/api/admin/cursos', {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isNew ? courseData : { id: currentCourse.id, ...courseData })
            });

            const data = await response.json();
            
            if (data.success) {
                if (isNew && data.data) {
                    setCurrentCourse(prev => prev ? { ...prev, id: data.data.id, status: effectiveStatus, lastSaved: new Date().toLocaleTimeString() } : null);
                    await fetchCourses();
                } else {
                    setCurrentCourse(prev => prev ? { ...prev, status: effectiveStatus, lastSaved: new Date().toLocaleTimeString() } : null);
                }
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
            } else {
                console.error('Error saving course:', data.error);
            }
        } catch (error) {
            console.error('Error saving course:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateNew = () => {
        const newCourse: Course = {
            id: `new-${Date.now()}`,
            title: "",
            category: "Capacitaciones",
            price: 0,
            status: "Borrador",
            modules: [
                { id: `M${Date.now()}`, title: "Módulo 1", lessons: [], isOpen: true }
            ],
            hasCertificate: false,
            allowComments: true,
            bliscoins: 0,
            image: null,
            certificateTemplateId: null,
            paraEquipo: false
        };
        setCourses(prev => [...prev, newCourse]);
        setCurrentCourse(newCourse);
        setView("editor");
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('¿Estás seguro de eliminar este curso?')) return;
        
        try {
            const response = await fetch(`/api/admin/cursos?id=${courseId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setCourses(prev => prev.filter(c => c.id !== courseId));
                if (currentCourse?.id === courseId) {
                    setCurrentCourse(null);
                    setView("list");
                }
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const addModule = () => {
        if (!currentCourse) return;
        const newModule: Module = { id: `M${Date.now()}`, title: "Nuevo Módulo", lessons: [], questions: [], isOpen: true };
        setCurrentCourse({ ...currentCourse, modules: [...currentCourse.modules, newModule] });
        setEditingItem({ type: 'module', id: newModule.id });
    };

    const updateModule = (id: string, data: Partial<Module>) => {
        if (!currentCourse) return;
        setCurrentCourse({ ...currentCourse, modules: currentCourse.modules.map(m => m.id === id ? { ...m, ...data } : m) });
    };

    const deleteModule = (id: string) => {
        if (!currentCourse) return;
        setCurrentCourse({ ...currentCourse, modules: currentCourse.modules.filter(m => m.id !== id) });
    };

    const moveModule = (fromIndex: number, toIndex: number) => {
        if (!currentCourse) return;
        const newModules = [...currentCourse.modules];
        const [moved] = newModules.splice(fromIndex, 1);
        newModules.splice(toIndex, 0, moved);
        setCurrentCourse({ ...currentCourse, modules: newModules });
    };

    const reorderLesson = (moduleId: string, fromIndex: number, toIndex: number) => {
        if (!currentCourse) return;
        setCurrentCourse({
            ...currentCourse,
            modules: currentCourse.modules.map(m => {
                if (m.id !== moduleId) return m;
                const newLessons = [...m.lessons];
                const [moved] = newLessons.splice(fromIndex, 1);
                newLessons.splice(toIndex, 0, moved);
                return { ...m, lessons: newLessons };
            })
        });
    };

    const moveLessonBetweenModules = (lessonId: string, fromModuleId: string, toModuleId: string, toIndex: number) => {
        if (!currentCourse) return;
        const fromMod = currentCourse.modules.find(m => m.id === fromModuleId);
        const lesson = fromMod?.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        setCurrentCourse({
            ...currentCourse,
            modules: currentCourse.modules.map(m => {
                if (m.id === fromModuleId) {
                    return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
                }
                if (m.id === toModuleId) {
                    const newLessons = [...m.lessons];
                    newLessons.splice(toIndex, 0, lesson);
                    return { ...m, lessons: newLessons, isOpen: true };
                }
                return m;
            })
        });
    };

    const addLesson = (moduleId: string) => {
        if (!currentCourse) return;
        const newLesson: Lesson = { id: `L${Date.now()}`, title: "Nueva Lección", type: "video", content: "", attachments: [], questions: [] };
        setCurrentCourse({
            ...currentCourse,
            modules: currentCourse.modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson], isOpen: true } : m)
        });
        setEditingItem({ type: 'lesson', id: newLesson.id, moduleId });
    };

    const updateLesson = (moduleId: string, lessonId: string, data: Partial<Lesson>) => {
        if (!currentCourse) return;
        setCurrentCourse({
            ...currentCourse,
            modules: currentCourse.modules.map(m => m.id === moduleId ? {
                ...m,
                lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...data } : l)
            } : m)
        });
    };

    const deleteLesson = (moduleId: string, lessonId: string) => {
        if (!currentCourse) return;
        setCurrentCourse({
            ...currentCourse,
            modules: currentCourse.modules.map(m => m.id === moduleId ? {
                ...m,
                lessons: m.lessons.filter(l => l.id !== lessonId)
            } : m)
        });
    };

    const scrollToItem = (id: string) => {
        const element = itemRefs.current[id];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            element.classList.add('ring-2', 'ring-blis-red', 'ring-offset-4', 'ring-offset-black');
            setTimeout(() => {
                element.classList.remove('ring-2', 'ring-blis-red', 'ring-offset-4', 'ring-offset-black');
            }, 2000);
        }
    };

    const moveLesson = (moduleId: string, index: number, direction: 'up' | 'down') => {
        if (!currentCourse) return;
        const targetModule = currentCourse.modules.find(m => m.id === moduleId);
        if (!targetModule) return;

        const newLessons = [...targetModule.lessons];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLessons.length) return;
        [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]];

        setCurrentCourse({
            ...currentCourse,
            modules: currentCourse.modules.map(m => m.id === moduleId ? { ...m, lessons: newLessons } : m)
        });
    };

    const addQuestion = (moduleId: string, lessonId: string) => {
        if (!currentCourse) return;
        const newQuestion: Question = { id: `Q${Date.now()}`, text: "", options: [{ id: "O1", text: "Opción 1", isCorrect: true }, { id: "O2", text: "Opción 2", isCorrect: false }] };
        const lesson = currentCourse.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        updateLesson(moduleId, lessonId, { questions: [...(lesson.questions || []), newQuestion] });
    };

    const updateQuestion = (moduleId: string, lessonId: string, questionId: string, data: Partial<Question>) => {
        if (!currentCourse) return;
        const lesson = currentCourse.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        updateLesson(moduleId, lessonId, { questions: lesson.questions?.map(q => q.id === questionId ? { ...q, ...data } : q) });
    };

    const deleteQuestion = (moduleId: string, lessonId: string, questionId: string) => {
        if (!currentCourse) return;
        const lesson = currentCourse.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
        if (!lesson) return;
        updateLesson(moduleId, lessonId, { questions: lesson.questions?.filter(q => q.id !== questionId) });
    };
    const [editingItem, setEditingItem] = useState<{ type: 'module' | 'lesson', id: string, moduleId?: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'module' | 'lesson', id: string, moduleId?: string, title: string } | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);

    const generateQuizWithAI = async (moduleId: string, lessonId: string) => {
        setIsGeneratingAI(lessonId);
        // Simulate AI "thinking" and reading video content
        await new Promise(resolve => setTimeout(resolve, 2500));

        const aiQuestions: Question[] = [
            { id: `Q${Date.now()}1`, text: "¿Cuál es el concepto principal discutido en esta lección?", options: [{ id: "O1", text: "Fundamentos y Teoría", isCorrect: true }, { id: "O2", text: "Ejemplos Prácticos", isCorrect: false }, { id: "O3", text: "Conclusiones Avanzadas", isCorrect: false }, { id: "O4", text: "Casos de Estudio", isCorrect: false }] },
            { id: `Q${Date.now()}2`, text: "Según el video, ¿qué herramienta es indispensable para este proceso?", options: [{ id: "O1", text: "Software de Edición", isCorrect: false }, { id: "O2", text: "Cámara Profesional", isCorrect: true }, { id: "O3", text: "Trípode Estable", isCorrect: false }, { id: "O4", text: "Iluminación Natural", isCorrect: false }] },
            { id: `Q${Date.now()}3`, text: "¿Qué error común se debe evitar al aplicar esta técnica?", options: [{ id: "O1", text: "Sobreexposición lumínica", isCorrect: true }, { id: "O2", text: "Falta de encuadre", isCorrect: false }, { id: "O3", text: "Audio entrecortado", isCorrect: false }, { id: "O4", text: "Movimientos bruscos", isCorrect: false }] },
            { id: `Q${Date.now()}4`, text: "¿Cuál es el tiempo recomendado para la primera fase del flujo de trabajo?", options: [{ id: "O1", text: "15 minutos", isCorrect: false }, { id: "O2", text: "30 minutos", isCorrect: true }, { id: "O3", text: "1 hora", isCorrect: false }, { id: "O4", text: "2 horas", isCorrect: false }] },
            { id: `Q${Date.now()}5`, text: "¿Qué elemento es fundamental para mantener el interés del espectador?", options: [{ id: "O1", text: "Música de fondo", isCorrect: false }, { id: "O2", text: "Ritmo narrativo", isCorrect: true }, { id: "O3", text: "Efectos especiales", isCorrect: false }, { id: "O4", text: "Duración extensa", isCorrect: false }] },
            { id: `Q${Date.now()}6`, text: "¿Cómo se debe configurar el balance de blancos en interiores?", options: [{ id: "O1", text: "Modo Automático siempre", isCorrect: false }, { id: "O2", text: "Ajuste Manual según la luz", isCorrect: true }, { id: "O3", text: "Preajuste de Nublado", isCorrect: false }, { id: "O4", text: "Modo Fluorescente", isCorrect: false }] },
            { id: `Q${Date.now()}7`, text: "¿Cuál es la regla de oro para una composición equilibrada?", options: [{ id: "O1", text: "Regla de los Tercios", isCorrect: true }, { id: "O2", text: "Simetría absoluta", isCorrect: false }, { id: "O3", text: "Encuadre holandés", isCorrect: false }, { id: "O4", text: "Primer plano extremo", isCorrect: false }] },
            { id: `Q${Date.now()}8`, text: "¿Qué tipo de micrófono se recomienda para entrevistas en exterior?", options: [{ id: "O1", text: "Micrófono de Condensador", isCorrect: false }, { id: "O2", text: "Micrófono de Solapa (Lavalier)", isCorrect: true }, { id: "O3", text: "Micrófono de Cámara", isCorrect: false }, { id: "O4", text: "Micrófono de Estudio", isCorrect: false }] },
            { id: `Q${Date.now()}9`, text: "¿Cuál es la resolución mínima sugerida para exportación premium?", options: [{ id: "O1", text: "720p (HD)", isCorrect: false }, { id: "O2", text: "1080p (Full HD)", isCorrect: true }, { id: "O3", text: "480p (SD)", isCorrect: false }, { id: "O4", text: "4K (Ultra HD)", isCorrect: false }] },
            { id: `Q${Date.now()}10`, text: "¿Qué software se mencionó como estándar para corrección de color?", options: [{ id: "O1", text: "Windows Movie Maker", isCorrect: false }, { id: "O2", text: "DaVinci Resolve", isCorrect: true }, { id: "O3", text: "Adobe Photoshop", isCorrect: false }, { id: "O4", text: "Canva Pro", isCorrect: false }] }
        ];

        const lesson = currentCourse?.modules.find(m => m.id === moduleId)?.lessons.find(l => l.id === lessonId);
        if (lesson) {
            updateLesson(moduleId, lessonId, { questions: [...(lesson.questions || []), ...aiQuestions] });
        }
        setIsGeneratingAI(null);
    };

    const ConfirmationModal = () => (
        <AnimatePresence>
            {confirmDelete && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm space-y-6 shadow-2xl ring-1 ring-white/10 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-black uppercase text-xs tracking-widest">¿Confirmar Eliminación?</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Estás a punto de borrar <span className="text-white">"{confirmDelete.title}"</span>. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-4 bg-white/5 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all">Cancelar</button>
                            <button onClick={() => {
                                if (confirmDelete.type === 'module') deleteModule(confirmDelete.id);
                                else if (confirmDelete.moduleId) deleteLesson(confirmDelete.moduleId, confirmDelete.id);
                                setConfirmDelete(null);
                            }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Eliminar</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (view === "editor" && currentCourse) {
        return (
            <div className="w-full space-y-8 pb-32 px-4 md:px-8 pt-8 md:pt-8">
                <style jsx global>{`
                    input[type='number']::-webkit-inner-spin-button,
                    input[type='number']::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    input[type='number'] {
                        -moz-appearance: textfield;
                    }
                `}</style>
                {/* Preview Modal */}
                {showPreview && currentCourse && (
                    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden" style={{ zIndex: 999999 }}>
                        <div className="flex items-center justify-between px-8 py-4 bg-zinc-950 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Vista Previa del Curso</span>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="flex items-center gap-2 px-5 py-2 bg-blis-red hover:bg-blis-red/80 rounded-xl text-white transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                <X className="w-4 h-4" /> Cerrar Vista Previa
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 md:p-16 max-w-4xl mx-auto w-full space-y-10">
                            {currentCourse.image && (
                                <img src={currentCourse.image} alt="Portada" className="w-full max-h-80 object-cover rounded-3xl shadow-2xl" />
                            )}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-[9px] font-black px-3 py-1 rounded-lg bg-blis-red/10 text-blis-red border border-blis-red/20 uppercase tracking-widest">{currentCourse.category}</span>
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${currentCourse.status === 'Publicado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{currentCourse.status}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">{currentCourse.title || 'Sin Título'}</h1>
                                <div className="flex items-center gap-6 text-gray-500 font-bold text-xs uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" /> {currentCourse.modules.length} Módulos</span>
                                    <span className="flex items-center gap-1.5"><Video className="w-4 h-4" /> {currentCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lecciones</span>
                                    <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-emerald-500" /> ${currentCourse.price} USD</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5 pb-3">Contenido del Curso</h2>
                                {currentCourse.modules.map((mod, i) => (
                                    <div key={mod.id} className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                                        <div className="px-6 py-4 bg-white/[0.02] flex items-center gap-4">
                                            <span className="text-[9px] font-black text-blis-red bg-blis-red/10 rounded-lg px-2 py-1 border border-blis-red/20">M{i + 1}</span>
                                            <h3 className="font-black text-white text-sm">{mod.title}</h3>
                                            <span className="ml-auto text-[9px] text-gray-600 font-bold uppercase">{mod.lessons.length} lecciones</span>
                                        </div>
                                        {mod.description && (
                                            <div className="px-6 py-3 border-t border-white/5 text-sm text-gray-400 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: mod.description }} />
                                        )}
                                        <div className="divide-y divide-white/5">
                                            {mod.lessons.map((les, j) => (
                                                <div key={les.id} className="px-6 py-3 flex items-center gap-4">
                                                    <span className="text-[9px] text-gray-600 font-black w-5 text-center">{j + 1}</span>
                                                    {les.type === 'video' ? <Video className="w-3.5 h-3.5 text-gray-600" /> : les.type === 'quiz' ? <ListChecks className="w-3.5 h-3.5 text-gray-600" /> : <FileText className="w-3.5 h-3.5 text-gray-600" />}
                                                    <span className="text-sm text-gray-300 font-bold">{les.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Editor Header Bar */}
                <div className="sticky top-0 z-[60] bg-black border-b border-white/5 px-4 md:px-8 py-3 flex items-center justify-between -mx-6 -mt-6 mb-6" style={{ marginLeft: 'calc(-1 * (1.5rem + 0px))', marginRight: 'calc(-1 * (1.5rem + 0px))' }}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView("list")} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all"><ChevronRight className="w-3.5 h-3.5 rotate-180" /></button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-black text-white uppercase tracking-widest">{currentCourse.title || "Nuevo Curso"}</h1>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded bg-white/5 uppercase tracking-[0.2em] ${currentCourse.status === 'Publicado' ? 'text-emerald-500' : 'text-amber-500'}`}>{currentCourse.status}</span>
                            </div>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                {isSaving ? <span className="text-amber-500 animate-pulse">Guardando...</span> : <span><Check className="w-2.5 h-2.5 inline mr-1 text-emerald-500" /> Sincronizado</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-gray-500 uppercase">
                            <Clock className="w-3 h-3" /> {currentCourse.lastSaved || '--:--'}
                        </div>
                        <button onClick={() => saveBorrador('Borrador')} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-white/5">Guardar</button>
                        <button onClick={() => setShowPreview(true)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-white/5">Previsualizar</button>
                        <button onClick={() => saveBorrador('Publicado')} className="px-5 py-2 bg-blis-red text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blis-red/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Publicar</button>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="space-y-6">
                        <div className="bg-zinc-950 border border-white/5 rounded-[2rem] p-6 space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                <h3 className="font-black text-white text-xs uppercase tracking-widest">Lecciones</h3>
                                <button onClick={addModule} className="text-blis-red hover:scale-110 transition-transform flex items-center gap-1">
                                    <Plus className="w-4 h-4" /><span className="text-[9px] font-black uppercase">Módulo</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {currentCourse.modules.map((module, mIdx) => (
                                    <div
                                        key={module.id}
                                        className="space-y-2"
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            if (draggedItem?.type === 'module') e.currentTarget.classList.add('border-t-2', 'border-blis-red');
                                        }}
                                        onDragLeave={(e) => e.currentTarget.classList.remove('border-t-2', 'border-blis-red')}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.remove('border-t-2', 'border-blis-red');
                                            if (draggedItem?.type === 'module') {
                                                const fromIdx = currentCourse.modules.findIndex(m => m.id === draggedItem.id);
                                                moveModule(fromIdx, mIdx);
                                            }
                                        }}
                                    >
                                        <div
                                            draggable
                                            onDragStart={() => setDraggedItem({ type: 'module', id: module.id })}
                                            onDragEnd={() => setDraggedItem(null)}
                                            onClick={() => updateModule(module.id, { isOpen: !module.isOpen })}
                                            className="group p-4 bg-white/[0.04] border border-white/5 rounded-2xl flex items-center justify-between hover:border-blis-red/30 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <GripVertical className="w-3.5 h-3.5 text-gray-700 group-hover:text-blis-red transition-colors cursor-grab active:cursor-grabbing" />
                                                <div className="relative">
                                                    <Layers className={`w-3.5 h-3.5 ${module.isOpen ? 'text-blis-red' : 'text-gray-600'}`} />
                                                    {module.questions && module.questions.length > 0 && (
                                                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber-500 rounded-full border border-black shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-bold text-white truncate">{module.title}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); addLesson(module.id); }} className="p-1 px-1.5 bg-blis-red/10 text-blis-red rounded-lg hover:bg-blis-red/20 transition-all" title="Nueva Lección"><Plus className="w-3 h-3" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'module', id: module.id }); scrollToItem(module.id); }} className={`p-1.5 rounded-lg transition-all ${editingItem?.id === module.id ? 'bg-blis-red text-white' : 'hover:bg-white/10 text-gray-600'}`} title="Editar Módulo"><Edit className="w-3.5 h-3.5" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'module', id: module.id, title: module.title }); }} className="p-1 px-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {module.isOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="pl-4 space-y-2 overflow-hidden py-1"
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        if (draggedItem?.type === 'lesson') {
                                                            if (draggedItem.moduleId === module.id) {
                                                                const fromIdx = module.lessons.findIndex(l => l.id === draggedItem.id);
                                                                reorderLesson(module.id, fromIdx, module.lessons.length);
                                                            } else if (draggedItem.moduleId) {
                                                                moveLessonBetweenModules(draggedItem.id, draggedItem.moduleId, module.id, module.lessons.length);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {module.lessons.map((lesson, lIdx) => (
                                                        <div
                                                            key={lesson.id}
                                                            draggable
                                                            onDragStart={(e) => { e.stopPropagation(); setDraggedItem({ type: 'lesson', id: lesson.id, moduleId: module.id }); }}
                                                            onDragEnd={() => setDraggedItem(null)}
                                                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('border-t-2', 'border-blis-red'); }}
                                                            onDragLeave={(e) => e.currentTarget.classList.remove('border-t-2', 'border-blis-red')}
                                                            onDrop={(e) => {
                                                                e.preventDefault(); e.stopPropagation();
                                                                e.currentTarget.classList.remove('border-t-2', 'border-blis-red');
                                                                if (draggedItem?.type === 'lesson') {
                                                                    if (draggedItem.moduleId === module.id) {
                                                                        const fromIdx = module.lessons.findIndex(l => l.id === draggedItem.id);
                                                                        reorderLesson(module.id, fromIdx, lIdx);
                                                                    } else if (draggedItem.moduleId) {
                                                                        moveLessonBetweenModules(draggedItem.id, draggedItem.moduleId, module.id, lIdx);
                                                                    }
                                                                }
                                                            }}
                                                            className="group p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3 hover:border-blis-red/20 transition-all cursor-grab active:cursor-grabbing"
                                                        >
                                                            <GripVertical className="w-3 h-3 text-gray-800 group-hover:text-blis-red/50 transition-colors" />
                                                            <div className="p-1.5 rounded-lg bg-white/5 text-gray-500 group-hover:text-blis-red">
                                                                {lesson.type === 'video' ? <Video className="w-3 h-3" /> : lesson.type === 'quiz' ? <ListChecks className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                                            </div>
                                                            <p className="text-[10px] font-bold text-gray-300 truncate flex-1">{lesson.title}</p>
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'lesson', id: lesson.id, moduleId: module.id }); scrollToItem(lesson.id); }} className={`p-1.5 rounded-lg transition-all ${editingItem?.id === lesson.id ? 'bg-blis-red text-white' : 'hover:bg-white/10 text-gray-600'}`} title="Editar Lección"><Edit className="w-3 h-3" /></button>
                                                                <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'lesson', id: lesson.id, moduleId: module.id, title: lesson.title }); }} className="p-1 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-3 h-3" /></button>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {module.questions && module.questions.length > 0 && (
                                                        <div
                                                            onClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'module', id: module.id }); scrollToItem(module.id); }}
                                                            className={`p-3 bg-white/[0.04] border rounded-xl flex items-center gap-3 transition-all cursor-pointer ${editingItem?.id === module.id ? 'border-amber-500/50' : 'border-white/5 hover:border-amber-500/30'} ${!module.isQuizEnabled ? 'opacity-50' : ''}`}
                                                        >
                                                            <div className={`p-1.5 rounded-lg ${module.isQuizEnabled ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                                <ListChecks className="w-3 h-3" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Examen del Módulo</p>
                                                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter truncate mt-1">{module.questions.length} Preguntas {!module.isQuizEnabled && '(Desactivado)'}</p>
                                                            </div>
                                                            {!module.isQuizEnabled && <EyeOff className="w-2.5 h-2.5 text-gray-600" />}
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => addLesson(module.id)}
                                                        className="w-full py-2 border border-dashed border-white/5 rounded-xl text-[9px] font-black text-gray-600 uppercase tracking-widest hover:bg-white/5 hover:text-blis-red transition-all"
                                                    >
                                                        + Añadir Lección
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                                {currentCourse.modules.length === 0 && <div className="py-12 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest">No hay módulos aún</div>}
                            </div>
                        </div>

                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-zinc-950 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-1 space-y-6 w-full">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Información del Curso</h2>
                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Detalles principales de la tienda</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-2 space-y-2">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Título Principal</label>
                                                <input type="text" value={currentCourse.title} onChange={(e) => setCurrentCourse({ ...currentCourse, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red transition-all text-sm font-bold" placeholder="Ej. Fotografía Inmobiliaria Masterclass" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Precio & BlisCoins</label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1 group/input">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 transition-colors group-focus-within/input:text-blis-red" />
                                                        <input
                                                            type="number"
                                                            value={currentCourse.price}
                                                            onChange={(e) => setCurrentCourse({ ...currentCourse, price: parseFloat(e.target.value) || 0 })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-2 py-3 text-white focus:outline-none focus:border-blis-red transition-all text-xs font-bold"
                                                        />
                                                    </div>
                                                    <div className="relative flex-1 group/input">
                                                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-500 transition-colors group-focus-within/input:text-amber-400" />
                                                        <input
                                                            type="number"
                                                            value={currentCourse.bliscoins}
                                                            onChange={(e) => setCurrentCourse({ ...currentCourse, bliscoins: parseInt(e.target.value) || 0 })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-2 py-3 text-white focus:outline-none focus:border-amber-500 transition-all text-xs font-bold"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Categoría</label>
                                                <input
                                                    type="text"
                                                    value={currentCourse.category}
                                                    onChange={(e) => setCurrentCourse({ ...currentCourse, category: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red transition-all text-xs font-bold"
                                                    placeholder="Ej. Capacitaciones"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Certificado</label>
                                                <select
                                                    value={currentCourse.certificateTemplateId || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setCurrentCourse({
                                                            ...currentCourse,
                                                            certificateTemplateId: val || null,
                                                            hasCertificate: !!val
                                                        });
                                                    }}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white focus:outline-none focus:border-blis-red transition-all"
                                                >
                                                    <option value="" className="bg-zinc-900 text-gray-500">Ninguno</option>
                                                    {certificateTemplates.map(template => (
                                                        <option key={template.id} value={template.id} className="bg-zinc-900">{template.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>

<div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Comentarios</label>
                                                <button
                                                    onClick={() => setCurrentCourse({ ...currentCourse, allowComments: !currentCourse.allowComments })}
                                                    className={`w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${currentCourse.allowComments ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                                >
                                                    {currentCourse.allowComments ? 'Activo' : 'Off'}
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Para Equipo</label>
                                                <button
                                                    onClick={() => setCurrentCourse({ ...currentCourse, paraEquipo: !currentCourse.paraEquipo })}
                                                    className={`w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${currentCourse.paraEquipo ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                                >
                                                    <Users className="w-3.5 h-3.5" />
                                                    {currentCourse.paraEquipo ? 'Solo Equipo' : 'Público'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-56 flex-shrink-0 space-y-2">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Portada del Curso</label>
                                    <div onClick={() => fileInputRefForCourse.current?.click()} className="aspect-square w-full bg-zinc-900 rounded-[1.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blis-red/30 hover:bg-white/5 transition-all group relative overflow-hidden shadow-inner">
                                        {currentCourse.image ? (
                                            <>
                                                <img src={currentCourse.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Course" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="w-6 h-6 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-700 group-hover:text-blis-red transition-colors">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                                <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Subir Imagen</p>
                                            </>
                                        )}
                                        <input type="file" ref={fileInputRefForCourse} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (prev) => { setTempImage(prev.target?.result as string); setShowCropper(true); }; reader.readAsDataURL(file); } }} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {currentCourse.modules.map((module, mIdx) => (
                            <div key={module.id} className="space-y-8" ref={el => { itemRefs.current[module.id] = el; }}>
                                {editingItem?.type === 'module' && editingItem.id === module.id && (
                                    <section className="bg-zinc-950 border border-white/5 rounded-[2rem] p-6 md:p-10 space-y-6 relative group/mod ring-offset-black transition-all">
                                        <div className="absolute top-8 right-8 flex gap-2">
                                            <div className="px-3 py-1 bg-blis-red text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Módulo {mIdx + 1}</div>
                                            <button onClick={() => setConfirmDelete({ type: 'module', id: module.id, title: module.title })} className="p-1 px-2 bg-white/5 rounded-lg text-gray-600 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500"><Layers className="w-6 h-6" /></div>
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Título del Módulo</label>
                                            <input
                                                value={module.title}
                                                onChange={(e) => updateModule(module.id, { title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:border-blis-red/50 transition-all"
                                                placeholder="Nombre del módulo..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase">Descripción Expandida</label>
                                            <RichTextEditor
                                                value={module.description || ""}
                                                onChange={(val) => updateModule(module.id, { description: val })}
                                                placeholder="Contenido principal del módulo..."
                                            />
                                        </div>

                                        <div className="space-y-8 pt-6 border-t border-white/5">
                                            <div className="flex justify-between items-center px-4">
                                                <div className="flex items-center gap-4">
                                                    <h4 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Examen Final del Módulo
                                                    </h4>
                                                    <button
                                                        onClick={() => updateModule(module.id, { isQuizEnabled: !module.isQuizEnabled })}
                                                        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all ${module.isQuizEnabled ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/10 text-gray-600'}`}
                                                    >
                                                        {module.isQuizEnabled ? 'Activado' : 'Desactivado'}
                                                    </button>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={async () => {
                                                            setIsGeneratingAI(`MOD_${module.id}`);
                                                            await new Promise(r => setTimeout(r, 2000));
                                                            const aiQs: Question[] = Array.from({ length: 10 }).map((_, i) => ({
                                                                id: `MQ${Date.now()}${i}`,
                                                                text: `[IA] Pregunta de Módulo ${i + 1}: ¿Cuál es el punto clave evaluado en esta sección?`,
                                                                options: [
                                                                    { id: "O1", text: "Concepto Principal", isCorrect: true },
                                                                    { id: "O2", text: "Opción Alternativa B", isCorrect: false },
                                                                    { id: "O3", text: "Opción Alternativa C", isCorrect: false },
                                                                    { id: "O4", text: "Opción Alternativa D", isCorrect: false }
                                                                ]
                                                            }));
                                                            updateModule(module.id, { isQuizEnabled: true, questions: [...(module.questions || []), ...aiQs] });
                                                            setIsGeneratingAI(null);
                                                        }}
                                                        disabled={isGeneratingAI === `MOD_${module.id}`}
                                                        className="text-amber-500 text-[10px] font-black uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {isGeneratingAI === `MOD_${module.id}` ? 'Generando...' : 'Autogenerar Examen (10 Preguntas)'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const newQ = { id: `MQ${Date.now()}`, text: "", options: [{ id: "O1", text: "Opción 1", isCorrect: true }, { id: "O2", text: "Opción 2", isCorrect: false }, { id: "O3", text: "Opción 3", isCorrect: false }, { id: "O4", text: "Opción 4", isCorrect: false }] };
                                                            updateModule(module.id, { questions: [...(module.questions || []), newQ] });
                                                        }}
                                                        className="text-blis-red text-[10px] font-black uppercase tracking-widest hover:underline"
                                                    >
                                                        + Añadir Pregunta
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                {(module.questions || []).map((q, qIdx) => (
                                                    <div key={q.id} className="p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] space-y-6 relative group/mq">
                                                        <button
                                                            onClick={() => updateModule(module.id, { questions: module.questions?.filter(mq => mq.id !== q.id) })}
                                                            className="absolute top-8 right-8 p-2 text-gray-700 hover:text-red-500 opacity-0 group-hover/mq:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="flex gap-4">
                                                            <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-gray-500 shrink-0">{qIdx + 1}</span>
                                                            <input
                                                                className="bg-transparent border-none p-0 text-lg text-white font-black placeholder:text-gray-800 focus:outline-none w-full border-b border-white/5 pb-4"
                                                                placeholder="Escribe la pregunta del examen aquí..."
                                                                value={q.text}
                                                                onChange={(e) => {
                                                                    const newQs = [...(module.questions || [])];
                                                                    newQs[qIdx] = { ...q, text: e.target.value };
                                                                    updateModule(module.id, { questions: newQs });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-14">
                                                            {q.options.map((opt, oIdx) => (
                                                                <div
                                                                    key={opt.id}
                                                                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group/mo ${opt.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}
                                                                    onClick={() => {
                                                                        const newOptions = q.options.map((o, idx) => ({ ...o, isCorrect: idx === oIdx }));
                                                                        const newQs = [...(module.questions || [])];
                                                                        newQs[qIdx] = { ...q, options: newOptions };
                                                                        updateModule(module.id, { questions: newQs });
                                                                    }}
                                                                >
                                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                                                                        {opt.isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                                    </div>
                                                                    <input
                                                                        className="bg-transparent border-none text-[11px] text-gray-300 focus:outline-none w-full"
                                                                        value={opt.text}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onChange={(e) => {
                                                                            const newOptions = [...q.options];
                                                                            newOptions[oIdx] = { ...newOptions[oIdx], text: e.target.value };
                                                                            const newQs = [...(module.questions || [])];
                                                                            newQs[qIdx] = { ...q, options: newOptions };
                                                                            updateModule(module.id, { questions: newQs });
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {module.lessons.map((lesson, lIdx) => (
                                    editingItem?.type === 'lesson' && editingItem.id === lesson.id && (
                                        <motion.section
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={lesson.id}
                                            ref={el => { itemRefs.current[lesson.id] = el; }}
                                            className="bg-zinc-950/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 space-y-6 md:space-y-8 relative group ring-offset-black transition-all"
                                        >
                                            <div className="absolute top-8 right-8 flex gap-2"><div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-gray-500 uppercase">Lección {lIdx + 1}</div></div>
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-blis-red/20 flex items-center justify-center text-blis-red">{lesson.type === 'video' ? <Video className="w-6 h-6" /> : <ListChecks className="w-6 h-6" />}</div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Título de la Lección</label>
                                                        <input
                                                            value={lesson.title}
                                                            onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:outline-none focus:border-blis-red/50 transition-all"
                                                            placeholder="Título de la lección..."
                                                        />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button onClick={() => updateLesson(module.id, lesson.id, { type: 'video' })} className={`text-[10px] font-black uppercase tracking-widest ${lesson.type === 'video' ? 'text-blis-red' : 'text-gray-600'}`}>Video</button>
                                                        <button onClick={() => updateLesson(module.id, lesson.id, { type: 'text' })} className={`text-[10px] font-black uppercase tracking-widest ${lesson.type === 'text' ? 'text-blis-red' : 'text-gray-600'}`}>Lectura</button>
                                                        <button onClick={() => updateLesson(module.id, lesson.id, { type: 'quiz' })} className={`text-[10px] font-black uppercase tracking-widest ${lesson.type === 'quiz' ? 'text-blis-red' : 'text-gray-600'}`}>Examen</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                {lesson.type === 'video' && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase">URL del Video (o Embed)</label>
                                                        <div className="relative">
                                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                                            <textarea value={lesson.videoUrl || ""} onChange={(e) => updateLesson(module.id, lesson.id, { videoUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-gray-300 focus:outline-none focus:border-blis-red min-h-[60px]" placeholder="Link YouTube/Vimeo o <iframe>..." />
                                                        </div>
                                                        {lesson.videoUrl && <div className="mt-4 aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5 flex items-center justify-center">{lesson.videoUrl.includes('<iframe') ? <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: lesson.videoUrl.replace(/width=".*?"/g, 'width="100%"').replace(/height=".*?"/g, 'height="100%"') }} /> : <div className="text-[10px] font-black text-gray-600 uppercase">Vista previa cargada</div>}</div>}
                                                    </div>
                                                )}
                                                {lesson.type === 'quiz' && (
                                                    <div className="space-y-6 pt-4 border-b border-white/5 pb-8">
                                                        <div className="flex justify-between items-center px-4">
                                                            <div className="flex items-center gap-4">
                                                                <h4 className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><ListChecks className="w-3.5 h-3.5" /> Estructura del Examen</h4>
                                                                <button
                                                                    onClick={() => updateLesson(module.id, lesson.id, { isQuizEnabled: !lesson.isQuizEnabled })}
                                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all ${lesson.isQuizEnabled ? 'bg-blis-red/10 border-blis-red/30 text-blis-red' : 'bg-white/5 border-white/10 text-gray-600'}`}
                                                                >
                                                                    {lesson.isQuizEnabled ? 'Activado' : 'Desactivado'}
                                                                </button>
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <button
                                                                    onClick={() => generateQuizWithAI(module.id, lesson.id)}
                                                                    disabled={isGeneratingAI === lesson.id}
                                                                    className={`text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline disabled:opacity-50 ${isGeneratingAI === lesson.id ? 'animate-pulse' : ''}`}
                                                                >
                                                                    <Sparkles className="w-3.5 h-3.5" /> {isGeneratingAI === lesson.id ? 'Leyendo Video...' : 'Generar con IA'}
                                                                </button>
                                                                <button onClick={() => addQuestion(module.id, lesson.id)} className="text-blis-red text-[10px] font-black uppercase tracking-widest hover:underline">+ Agregar Pregunta</button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6">
                                                            {(lesson.questions || []).map((q, qIdx) => (
                                                                <div key={q.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] space-y-6 relative group/q">
                                                                    <button onClick={() => deleteQuestion(module.id, lesson.id, q.id)} className="absolute top-6 right-6 p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover/q:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                                    <div className="flex gap-4"><span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 flex-shrink-0">{qIdx + 1}</span><input className="bg-transparent border-none p-0 text-white font-bold placeholder:text-gray-700 focus:outline-none w-full border-b border-white/5 pb-2" placeholder="Pregunta..." value={q.text} onChange={(e) => updateQuestion(module.id, lesson.id, q.id, { text: e.target.value })} /></div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 ml-0 md:ml-12">
                                                                        {q.options.map((opt, oIdx) => (
                                                                            <div key={opt.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group/opt ${opt.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`} onClick={() => { const newOptions = q.options.map((o, idx) => ({ ...o, isCorrect: idx === oIdx })); updateQuestion(module.id, lesson.id, q.id, { options: newOptions }); }}>
                                                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>{opt.isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}</div>
                                                                                <input className="bg-transparent border-none text-[11px] text-gray-300 focus:outline-none w-full" value={opt.text} onClick={(e) => e.stopPropagation()} onChange={(e) => { const newOptions = [...q.options]; newOptions[oIdx] = { ...newOptions[oIdx], text: e.target.value }; updateQuestion(module.id, lesson.id, q.id, { options: newOptions }); }} />
                                                                                {q.options.length > 2 && <button onClick={(e) => { e.stopPropagation(); const newOptions = q.options.filter((_, idx) => idx !== oIdx); updateQuestion(module.id, lesson.id, q.id, { options: newOptions }); }} className="opacity-0 group-hover/opt:opacity-100 p-1 hover:text-red-500 transition-all"><X className="w-3 h-3" /></button>}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {lesson.type === 'text' && (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contenido de la Lección</label>
                                                        <RichTextEditor
                                                            value={lesson.content}
                                                            onChange={(val) => updateLesson(module.id, lesson.id, { content: val })}
                                                            placeholder="Escribe el contenido detallado aquí..."
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.section>
                                    )
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence>{(showToast || !isSaving) && currentCourse.lastSaved && <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed bottom-10 right-10 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-[0_10px_30px_rgba(16,185,129,0.3)] z-[100] flex items-center gap-3 border border-emerald-400/50"><CheckCircle2 className="w-4 h-4" /> Progreso Guardado Localmente</motion.div>}</AnimatePresence>
                <AnimatePresence>{showCropper && tempImage && <ImageCropper src={tempImage} onCrop={(cropped) => { setCurrentCourse({ ...currentCourse, image: cropped }); setShowCropper(false); }} onCancel={() => setShowCropper(false)} />}</AnimatePresence>
                <ConfirmationModal />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4 md:px-8 pt-8 md:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-blis-red font-black text-[10px] uppercase tracking-[0.3em]"><GraduationCap className="w-3.5 h-3.5" /> Education HQ</div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Gestión de Academia</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">Crea, edita y sincroniza tus cursos de alto impacto.</p>
                </div>
                <button onClick={handleCreateNew} className="w-full sm:w-auto bg-blis-red text-white px-8 py-4 sm:px-8 sm:py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(190,11,60,0.3)] mt-4 sm:mt-0"><Plus className="w-5 h-5" /> Nuevo Curso</button>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-12 text-center">
                    <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No tienes cursos creados</p>
                    <button onClick={handleCreateNew} className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blis-red/80 transition-all">
                        Crear primer curso
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-6 space-y-5 hover:border-white/10 transition-all flex flex-col group relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blis-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blis-red/10 transition-colors" />
                            <div className="aspect-video w-full bg-zinc-900 rounded-[2.5rem] border border-white/5 overflow-hidden relative shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
                                {course.image ? <img src={course.image} className="w-full h-full object-cover" alt="Course" /> : <div className="absolute inset-0 flex items-center justify-center text-zinc-800"><GraduationCap className="w-16 h-16 opacity-10" /></div>}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setCurrentCourse(course); setView("editor"); }} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all text-black"><Eye className="w-6 h-6" /></button>
                                </div>
                                <div className="absolute top-6 left-6 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white/50 uppercase tracking-widest border border-white/10 uppercase">{course.category}</div>
                                {course.paraEquipo && <div className="absolute top-6 right-6 px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-lg text-[8px] font-black text-amber-400 uppercase tracking-widest border border-amber-500/30 flex items-center gap-1"><Users className="w-3 h-3" /> Equipo</div>}
                            </div>
                            <div className="space-y-4 flex-1">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-blis-red transition-colors">{course.title || 'Sin título'}</h3>
                                <div className="flex items-center gap-4 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {course.modules.length} Módulos</span>
                                    <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Secciones</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Inversión VIP</span>
                                    <span className="text-xl font-black text-white tracking-tighter">${course.price} <span className="text-[10px] text-gray-500">USD</span></span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDeleteCourse(course.id)} className="p-4 bg-white/5 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-5 h-5" /></button>
                                    <button onClick={() => { setCurrentCourse(course); setView("editor"); }} className="p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all"><Settings className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
