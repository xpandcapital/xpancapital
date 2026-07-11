"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    X, AlertCircle,
    Link as LinkBtn, FileCode,
    Scissors, GripHorizontal, Sparkles, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight,
    RotateCw, FlipHorizontal, Trash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageCropper } from "./ImageCropper";
import { ToolbarButtons } from "./ToolbarButtons";

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
    const [modal, setModal] = useState<{ type: 'link' | 'embed' | 'error' | 'loading', message?: string } | null>(null);
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

    const [selectedColor, setSelectedColor] = useState('#FFFFFF');
    const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 });

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
                case 'insertImage':
                    injection = `<img src="${val}" alt="" style="width:100%;display:block;margin:0 auto;" />`;
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
            if (command === 'insertImage') {
                const html = `<img id="img_${Date.now()}" src="${val}" alt="" style="width:100%;display:block;margin:0 auto;" />`;
                document.execCommand('insertHTML', false, html);
            } else {
                document.execCommand(command, false, val);
            }
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setModal({ type: 'error', message: 'La imagen excede el límite de 10MB.' });
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            setModal({ type: 'loading', message: 'Subiendo imagen...' });
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'productos-descripcion');
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                execCommand('insertImage', data.url);
                setModal(null);
            } else {
                setModal({ type: 'error', message: data.error || 'Error al subir imagen' });
            }
        } catch (err) {
            setModal({ type: 'error', message: 'Error al subir imagen' });
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`w-full bg-zinc-950 border border-white/10 rounded-3xl overflow-visible transition-all relative shadow-2xl flex flex-col`} style={{ minHeight }}>
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {modal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md space-y-6 shadow-2xl ring-1 ring-white/10">
                                <div className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest">
                                    <div className={`p-2 rounded-lg shadow-lg ${modal.type === 'error' ? 'bg-gradient-to-tr from-blis-red to-orange-500' : modal.type === 'loading' ? 'bg-gradient-to-tr from-blue-500 to-cyan-500' : 'bg-gradient-to-tr from-blis-red to-orange-500'}`}>
                                        {modal.type === 'error' ? <AlertCircle className="w-4 h-4 text-white" /> : modal.type === 'loading' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : modal.type === 'embed' ? <FileCode className="w-4 h-4 text-white" /> : <LinkBtn className="w-4 h-4 text-white" />}
                                    </div>
                                    {modal.type === 'error' ? 'Aviso del Sistema' : modal.type === 'loading' ? 'Cargando...' : modal.type === 'embed' ? 'Incrustar Contenido' : 'Añadir Enlace'}
                                </div>

                                <div className="space-y-4">
                                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                                        {modal.message || (modal.type === 'embed' ? 'Pega el código iframe o script profesional aquí. Se cargará instantáneamente en el editor.' : 'Introduce la URL de destino completa para el enlace seleccionado.')}
                                    </p>
                                    {modal.type !== 'error' && modal.type !== 'loading' && (
                                        <textarea id="modal-input" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs focus:outline-none focus:border-blis-red min-h-[120px] transition-all resize-none" placeholder={modal.type === 'embed' ? '<iframe src="..." />' : 'https://xpancapital.com/...'} />
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setModal(null)} className="flex-1 py-4 bg-white/5 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all">{modal.type === 'loading' ? 'Espere...' : 'Cancelar'}</button>
                                    {modal.type !== 'error' && modal.type !== 'loading' && (
                                        <button onClick={() => {
                                            const input = document.getElementById('modal-input') as HTMLTextAreaElement;
                                            if (!input) { setModal(null); return; }
                                            if (modal.type === 'embed') {
                                                if (isHtmlMode) {
                                                    execCommand('insertHTML', input.value);
                                                } else if (editorRef.current) {
                                                    editorRef.current.focus();
                                                    const sel = window.getSelection();
                                                    if (sel && savedSelection) {
                                                        sel.removeAllRanges();
                                                        sel.addRange(savedSelection);
                                                    } else if (sel) {
                                                        const range = document.createRange();
                                                        range.selectNodeContents(editorRef.current);
                                                        range.collapse(false);
                                                        sel.removeAllRanges();
                                                        sel.addRange(range);
                                                    }
                                                    try {
                                                        document.execCommand('insertHTML', false, input.value);
                                                        const val = editorRef.current.innerHTML;
                                                        setLocalValue(val);
                                                        onChange(val);
                                                    } catch {
                                                        editorRef.current.innerHTML += input.value;
                                                        const val = editorRef.current.innerHTML;
                                                        setLocalValue(val);
                                                        onChange(val);
                                                    }
                                                }
                                            } else execCommand('createLink', input.value);
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

            <ToolbarButtons
                isHtmlMode={isHtmlMode}
                setIsHtmlMode={setIsHtmlMode}
                execCommand={execCommand}
                saveSelection={saveSelection}
                showSizes={showSizes}
                setShowSizes={setShowSizes}
                showColorPicker={showColorPicker}
                setShowColorPicker={setShowColorPicker}
                selectedColor={selectedColor}
                handleColorChange={handleColorChange}
                showEmoji={showEmoji}
                setShowEmoji={setShowEmoji}
                fileInputRef={fileInputRef}
                setModal={setModal}
                showInlineAI={showInlineAI}
                setShowInlineAI={setShowInlineAI}
                inlineTitle={inlineTitle}
                setInlineTitle={setInlineTitle}
                inlineIdea={inlineIdea}
                setInlineIdea={setInlineIdea}
                elapsedSeconds={elapsedSeconds}
                onAIGenerate={onAIGenerate}
                isGeneratingAI={isGeneratingAI}
                onCancelAIGenerate={onCancelAIGenerate}
                onImageSearch={onImageSearch}
            />

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
                        suppressContentEditableWarning
                        suppressHydrationWarning
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

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
    );
}

