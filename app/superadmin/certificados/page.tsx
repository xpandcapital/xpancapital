"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Plus, Search, Award, FileText, Save, Eye, Trash2,
    X, CheckCircle2, QrCode, Upload, Loader2,
    Type, Move, Maximize, Palette, Download, Layout, Settings,
    ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
    AlignCenter, Layers, MousePointer2, Crosshair
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CertificateElement {
    id: string;
    type: 'name' | 'course' | 'date' | 'qr';
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontWeight: string;
}

interface CertificateTemplate {
    id: string;
    title: string;
    description: string;
    backgroundImage: string | null;
    elements: CertificateElement[];
}

interface DBTemplate {
    id: string;
    nombre: string;
    descripcion?: string;
    ancho: number;
    alto: number;
    color_fondo: string;
    color_primario: string;
    color_secundario: string;
    color_texto: string;
    color_texto_secundario: string;
    tamano_titulo: number;
    tamano_cuerpo: number;
    posicion_nombre: { x: number; y: number };
    posicion_curso: { x: number; y: number };
    posicion_fecha: { x: number; y: number };
    posicion_codigo: { x: number; y: number };
    logo_url?: string;
    fondo_url?: string;
    firma_url?: string;
    texto_titulo: string;
    texto_subtitulo: string;
    texto_completado: string;
    texto_fecha: string;
    texto_firma: string;
    activo: boolean;
    elementos?: CertificateElement[];
}

function dbToLocal(db: DBTemplate): CertificateTemplate {
    // Si hay elementos guardados, usarlos directamente
    if (db.elementos && db.elementos.length > 0) {
        return {
            id: db.id,
            title: db.nombre,
            description: db.descripcion || '',
            backgroundImage: db.fondo_url || null,
            elements: db.elementos.map(el => ({
                ...el,
                fontSize: el.fontSize || 32
            }))
        };
    }
    
    // Fallback: crear elementos desde la configuración legacy
    return {
        id: db.id,
        title: db.nombre,
        description: db.descripcion || '',
        backgroundImage: db.fondo_url || null,
        elements: [
            {
                id: 'name',
                type: 'name',
                x: db.posicion_nombre?.x || 50,
                y: db.posicion_nombre?.y || 40,
                fontSize: db.tamano_titulo || 48,
                color: db.color_texto || '#ffffff',
                fontWeight: '900'
            },
            {
                id: 'course',
                type: 'course',
                x: db.posicion_curso?.x || 50,
                y: db.posicion_curso?.y || 55,
                fontSize: db.tamano_cuerpo ? Math.max(db.tamano_cuerpo, 24) : 32,
                color: db.color_primario || '#B10D24',
                fontWeight: '700'
            },
            {
                id: 'date',
                type: 'date',
                x: db.posicion_fecha?.x || 30,
                y: db.posicion_fecha?.y || 80,
                fontSize: db.tamano_cuerpo || 16,
                color: db.color_texto_secundario || '#9ca3af',
                fontWeight: '600'
            },
            {
                id: 'qr',
                type: 'qr',
                x: db.posicion_codigo?.x || 85,
                y: db.posicion_codigo?.y || 90,
                fontSize: 80,
                color: '#000000',
                fontWeight: 'normal'
            }
        ]
    };
}

function localToDb(local: CertificateTemplate): Partial<DBTemplate> {
    const nameEl = local.elements.find(e => e.type === 'name');
    const courseEl = local.elements.find(e => e.type === 'course');
    const dateEl = local.elements.find(e => e.type === 'date');
    const qrEl = local.elements.find(e => e.type === 'qr');

    return {
        nombre: local.title,
        descripcion: local.description,
        ancho: 297,
        alto: 210,
        color_fondo: '#0a0a0a',
        color_primario: courseEl?.color || '#B10D24',
        color_secundario: '#10B981',
        color_texto: nameEl?.color || '#ffffff',
        color_texto_secundario: dateEl?.color || '#9ca3af',
        tamano_titulo: nameEl?.fontSize || 48,
        tamano_cuerpo: dateEl?.fontSize || 16,
        posicion_nombre: { x: nameEl?.x || 50, y: nameEl?.y || 40 },
        posicion_curso: { x: courseEl?.x || 50, y: courseEl?.y || 55 },
        posicion_fecha: { x: dateEl?.x || 30, y: dateEl?.y || 80 },
        posicion_codigo: { x: qrEl?.x || 85, y: qrEl?.y || 90 },
        fondo_url: local.backgroundImage || undefined,
        elementos: local.elements,
        activo: true
    };
}

export default function CertificateEngine() {
    const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState<"list" | "editor">("list");
    const [currentTemplate, setCurrentTemplate] = useState<CertificateTemplate | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const [canvasBounds, setCanvasBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/certificados/plantillas');
            const data = await response.json();
            if (data.success && data.data) {
                const localTemplates = data.data.map(dbToLocal);
                setTemplates(localTemplates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const syncBounds = useCallback(() => {
        if (canvasRef.current) {
            setCanvasBounds(canvasRef.current.getBoundingClientRect());
        }
    }, []);

    useEffect(() => {
        if (view === "editor") {
            window.addEventListener('resize', syncBounds);
            syncBounds();
            return () => window.removeEventListener('resize', syncBounds);
        }
    }, [view, syncBounds]);

    const handleCreateNew = () => {
        const newTemplate: CertificateTemplate = {
            id: 'new',
            title: 'Nueva Plantilla',
            description: 'Configura el diseño de tus certificados.',
            backgroundImage: null,
            elements: [
                { id: 'name', type: 'name', x: 50, y: 40, fontSize: 48, color: '#ffffff', fontWeight: '900' },
                { id: 'course', type: 'course', x: 50, y: 55, fontSize: 32, color: '#B10D24', fontWeight: '700' },
                { id: 'date', type: 'date', x: 30, y: 80, fontSize: 16, color: '#9ca3af', fontWeight: '600' },
                { id: 'qr', type: 'qr', x: 85, y: 90, fontSize: 80, color: '#000000', fontWeight: 'normal' }
            ]
        };
        setCurrentTemplate(newTemplate);
        setSelectedId(null);
        setView("editor");
    };

    const handleEditTemplate = (template: CertificateTemplate) => {
        setCurrentTemplate(template);
        setSelectedId(null);
        setView("editor");
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;
        
        try {
            const response = await fetch(`/api/certificados/plantillas?id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchTemplates();
            }
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const saveProject = async () => {
        if (!currentTemplate) return;
        
        setSaving(true);
        try {
            const dbData = localToDb(currentTemplate);
            const isNew = currentTemplate.id === 'new';
            
            const response = await fetch('/api/certificados/plantillas', {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isNew ? dbData : { id: currentTemplate.id, ...dbData })
            });

            const data = await response.json();
            
            if (data.success) {
                await fetchTemplates();
                setView("list");
            } else {
                console.error('Error saving:', data.error);
                alert('Error al guardar: ' + data.error);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Error al guardar la plantilla');
        } finally {
            setSaving(false);
        }
    };

    const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const stopContinuousMove = useCallback(() => {
        if (moveIntervalRef.current) {
            clearInterval(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => stopContinuousMove();
    }, [stopContinuousMove]);

    const updateElement = (id: string, data: Partial<CertificateElement>) => {
        setCurrentTemplate(prev => {
            if (!prev) return null;
            return {
                ...prev,
                elements: prev.elements.map(el => el.id === id ? { ...el, ...data } : el)
            };
        });
    };

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentTemplate) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setCurrentTemplate({ ...currentTemplate, backgroundImage: ev.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const moveElement = useCallback((dx: number, dy: number) => {
        if (!selectedId) return;

        setCurrentTemplate(prev => {
            if (!prev) return null;
            const el = prev.elements.find(e => e.id === selectedId);
            if (!el) return prev;

            const sensitivity = 0.2;
            return {
                ...prev,
                elements: prev.elements.map(e => e.id === selectedId ? {
                    ...e,
                    x: Math.max(0, Math.min(100, e.x + dx * sensitivity)),
                    y: Math.max(0, Math.min(100, e.y + dy * sensitivity))
                } : e)
            };
        });
    }, [selectedId]);

    const startContinuousMove = useCallback((dx: number, dy: number) => {
        stopContinuousMove();
        moveElement(dx, dy);
        moveIntervalRef.current = setInterval(() => {
            moveElement(dx, dy);
        }, 16);
    }, [moveElement, stopContinuousMove]);

    const startContinuousScale = useCallback((delta: number) => {
        stopContinuousMove();
        if (!selectedId) return;

        const doScale = () => {
            setCurrentTemplate(prev => {
                if (!prev) return null;
                const el = prev.elements.find(e => e.id === selectedId);
                if (!el) return prev;
                return {
                    ...prev,
                    elements: prev.elements.map(e => e.id === selectedId ? {
                        ...e,
                        fontSize: Math.max(10, Math.min(150, e.fontSize + delta))
                    } : e)
                };
            });
        };
        doScale();
        moveIntervalRef.current = setInterval(doScale, 40);
    }, [selectedId, stopContinuousMove]);

    const handleDragStart = (e: React.PointerEvent, el: CertificateElement) => {
        e.preventDefault();
        e.stopPropagation();
        syncBounds();
        setSelectedId(el.id);

        if (!canvasRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();

        const initialCenterX = canvasRect.left + (el.x / 100) * canvasRect.width;
        const initialCenterY = canvasRect.top + (el.y / 100) * canvasRect.height;

        const offsetX = initialCenterX - e.clientX;
        const offsetY = initialCenterY - e.clientY;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const targetX = moveEvent.clientX + offsetX;
            const targetY = moveEvent.clientY + offsetY;

            let newX = ((targetX - canvasRect.left) / canvasRect.width) * 100;
            let newY = ((targetY - canvasRect.top) / canvasRect.height) * 100;

            newX = Math.max(0, Math.min(100, parseFloat(newX.toFixed(4))));
            newY = Math.max(0, Math.min(100, parseFloat(newY.toFixed(4))));

            if (Math.abs(newX - 50) < 0.8) newX = 50;
            if (Math.abs(newY - 50) < 0.8) newY = 50;

            updateElement(el.id, { x: newX, y: newY });
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blis-red mx-auto" />
                    <p className="text-gray-400">Cargando plantillas...</p>
                </div>
            </div>
        );
    }

    if (view === "editor" && currentTemplate) {
        const activeElement = currentTemplate.elements.find(e => e.id === selectedId);

        return (
            <div className="w-full space-y-8 pb-32 animate-in fade-in duration-700 px-4 md:px-8 pt-8 md:pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full min-w-0">
                    <div className="lg:col-span-8 w-full min-w-0 space-y-6">
                        <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-3xl border border-white/5 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setView("list")} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <input
                                        type="text"
                                        value={currentTemplate.title}
                                        onChange={(e) => setCurrentTemplate({ ...currentTemplate, title: e.target.value })}
                                        className="text-sm font-black text-white uppercase tracking-tighter leading-none bg-transparent border-b-2 border-transparent hover:border-white/20 focus:border-blis-red outline-none px-2 py-1 min-w-[300px] focus:bg-white/5 transition-all rounded-md"
                                        placeholder="TÍTULO DE LA PLANTILLA"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer border border-white/5 transition-all">
                                    <Upload className="w-4 h-4 text-zinc-400" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
                                </label>
                                <button
                                    onClick={saveProject}
                                    disabled={saving}
                                    className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blis-red hover:text-white transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3.5 h-3.5" />
                                            Guardar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div
                            ref={canvasRef}
                            className="relative w-full aspect-[1.414/1] bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] cursor-crosshair group/canvas isolate"
                            onMouseDownCapture={syncBounds}
                            onTouchStartCapture={syncBounds}
                        >
                            {!currentTemplate.backgroundImage && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-800">
                                    <FileText className="w-20 h-20 opacity-5" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-700">Sin Fondo Seleccionado</p>
                                </div>
                            )}

                            {currentTemplate.backgroundImage && (
                                <img src={currentTemplate.backgroundImage} className="w-full h-full object-contain pointer-events-none select-none" alt="Cert" />
                            )}

                            <div className="absolute inset-0 pointer-events-none opacity-40 transition-opacity isolate">
                                <div className="absolute inset-[5%] border border-dashed border-blis-red/20 rounded-xl" />
                                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-blis-red/30" />
                                <div className="absolute left-0 right-0 top-1/2 h-px bg-blis-red/30" />
                            </div>

                            {currentTemplate.elements.map((el) => {
                                const isSelected = selectedId === el.id;
                                return (
                                    <div
                                        key={el.id}
                                        onPointerDown={(e) => handleDragStart(e, el)}
                                        onClick={() => setSelectedId(el.id)}
                                        className={`absolute flex items-center justify-center p-4 cursor-move transition-transform duration-75 select-none ${isSelected ? 'ring-2 ring-blis-red bg-blis-red/5 z-50 rounded-xl' : 'z-10 hover:bg-white/5 rounded-lg'}`}
                                        style={{
                                            left: `${Math.max(0, Math.min(100, el.x))}%`,
                                            top: `${Math.max(0, Math.min(100, el.y))}%`,
                                            transform: 'translate(-50%, -50%)',
                                            color: el.color,
                                            fontWeight: el.fontWeight,
                                            textAlign: 'center',
                                            whiteSpace: 'nowrap',
                                            touchAction: 'none'
                                        }}
                                    >
                                        {isSelected && (
                                            <>
                                                <div className="absolute inset-0 bg-blis-red/10 rounded-xl" />
                                                <div className="absolute top-1/2 left-[-100vw] right-[-100vw] h-px bg-blis-red/20 pointer-events-none" />
                                                <div className="absolute left-1/2 top-[-100vh] bottom-[-100vh] w-px bg-blis-red/20 pointer-events-none" />
                                            </>
                                        )}

                                        {el.type === 'qr' ? (
                                            <div className="bg-white p-2 rounded-lg shadow-2xl border-2 border-white/10">
                                                <QrCode className="text-black" style={{ width: `${el.fontSize * 0.8}px`, height: `${el.fontSize * 0.8}px` }} />
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: `${el.fontSize * 0.12}vw` }}>
                                                {el.type === 'name' ? '[NOMBRE DEL ESTUDIANTE]' : el.type === 'course' ? '[NOMBRE DEL CURSO]' : '[FECHA]'}
                                            </span>
                                        )}

                                        {isSelected && (
                                            <div className="absolute -bottom-12 whitespace-nowrap px-3 py-1 bg-black text-[9px] font-mono text-zinc-400 rounded-full border border-white/10 flex gap-4">
                                                <span>X: <span className="text-white">{el.x.toFixed(1)}%</span></span>
                                                <span>Y: <span className="text-white">{el.y.toFixed(1)}%</span></span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-5 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blis-red/20 rounded-2xl">
                                    <Settings className="w-5 h-5 text-blis-red" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Configuración</h3>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Personaliza el elemento actual</p>
                                </div>
                            </div>

                            {!selectedId ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center gap-4 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                                    <MousePointer2 className="w-10 h-10 text-zinc-800" />
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Selecciona un elemento para editar</p>
                                </div>
                            ) : activeElement && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                            <Move className="w-3 h-3" /> Precisión Manual
                                        </label>
                                        <div className="flex flex-col items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onPointerDown={(e) => { e.preventDefault(); startContinuousMove(-1, 0); }}
                                                    onPointerUp={stopContinuousMove}
                                                    onPointerLeave={stopContinuousMove}
                                                    onPointerCancel={stopContinuousMove}
                                                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md select-none touch-none"
                                                ><ChevronLeft className="w-5 h-5" /></button>
                                                <button
                                                    onPointerDown={(e) => { e.preventDefault(); startContinuousMove(0, -1); }}
                                                    onPointerUp={stopContinuousMove}
                                                    onPointerLeave={stopContinuousMove}
                                                    onPointerCancel={stopContinuousMove}
                                                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md select-none touch-none"
                                                ><ChevronUp className="w-5 h-5" /></button>
                                                <button
                                                    onClick={() => updateElement(activeElement.id, { x: 50, y: 50 })}
                                                    className="w-10 h-10 flex items-center justify-center bg-blis-red/20 text-blis-red hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md"
                                                >
                                                    <Crosshair className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onPointerDown={(e) => { e.preventDefault(); startContinuousMove(0, 1); }}
                                                    onPointerUp={stopContinuousMove}
                                                    onPointerLeave={stopContinuousMove}
                                                    onPointerCancel={stopContinuousMove}
                                                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md select-none touch-none"
                                                ><ChevronDown className="w-5 h-5" /></button>
                                                <button
                                                    onPointerDown={(e) => { e.preventDefault(); startContinuousMove(1, 0); }}
                                                    onPointerUp={stopContinuousMove}
                                                    onPointerLeave={stopContinuousMove}
                                                    onPointerCancel={stopContinuousMove}
                                                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blis-red hover:text-white rounded-xl transition-all shadow-md select-none touch-none"
                                                ><ChevronRight className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                                <Maximize className="w-3 h-3" /> Tamaño del Elemento
                                            </label>
                                            <div className="flex flex-col gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onPointerDown={(e) => { e.preventDefault(); startContinuousScale(-1); }}
                                                        onPointerUp={stopContinuousMove}
                                                        onPointerLeave={stopContinuousMove}
                                                        onPointerCancel={stopContinuousMove}
                                                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-blis-red rounded-lg transition-colors text-white text-lg font-black select-none touch-none"
                                                    >-</button>
                                                    <input
                                                        type="range" min="10" max="150" step="1"
                                                        value={activeElement.fontSize}
                                                        onChange={(e) => updateElement(activeElement.id, { fontSize: parseInt(e.target.value) })}
                                                        className="flex-1 accent-blis-red h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <button
                                                        onPointerDown={(e) => { e.preventDefault(); startContinuousScale(1); }}
                                                        onPointerUp={stopContinuousMove}
                                                        onPointerLeave={stopContinuousMove}
                                                        onPointerCancel={stopContinuousMove}
                                                        className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-blis-red rounded-lg transition-colors text-white text-lg font-black select-none touch-none"
                                                    >+</button>
                                                </div>
                                                <div className="flex items-center justify-between pl-1">
                                                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Valor Exacto</span>
                                                    <input
                                                        type="number"
                                                        value={activeElement.fontSize}
                                                        onChange={(e) => updateElement(activeElement.id, { fontSize: parseInt(e.target.value) || 10 })}
                                                        className="w-20 bg-black/50 border border-white/10 rounded-lg py-1.5 text-center text-xs font-mono text-white outline-none focus:border-blis-red"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {activeElement.type !== 'qr' && (
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Palette className="w-3 h-3" /> Color y Peso
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        type="color"
                                                        value={activeElement.color}
                                                        onChange={(e) => updateElement(activeElement.id, { color: e.target.value })}
                                                        className="w-full h-12 bg-black/40 border border-white/5 rounded-xl cursor-pointer p-1"
                                                    />
                                                    <select
                                                        value={activeElement.fontWeight}
                                                        onChange={(e) => updateElement(activeElement.id, { fontWeight: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-2 text-[10px] font-black uppercase text-white outline-none focus:border-blis-red"
                                                    >
                                                        <option value="normal">Normal</option>
                                                        <option value="600">Semi Bold</option>
                                                        <option value="700">Bold</option>
                                                        <option value="900">Black Version</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="w-full py-4 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all"
                                    >
                                        Deseleccionar Elemento
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-blis-red/5 border border-blis-red/20 rounded-[2.5rem] p-8">
                            <h4 className="text-[10px] font-black text-blis-red uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Recomendaciones
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    "Usa fondos HD para evitar pixelado.",
                                    "El QR se genera dinámicamente por alumno.",
                                    "Los cambios se guardan en la base de datos.",
                                    "La alineación de centros es automática."
                                ].map((tip, i) => (
                                    <li key={i} className="text-xs text-zinc-400 flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 bg-blis-red rounded-full mt-1.5 flex-shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 pb-10 select-none animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4 md:px-8 pt-8 md:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-1 bg-blis-red rounded-full" />
                        <span className="text-[10px] font-black text-blis-red uppercase tracking-[0.4em]">Motor de Certificados</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">
                        Certificados
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl leading-tight">
                        Diseña interfaces de certificación con precisión milimétrica y sincronización en tiempo real.
                    </p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="group relative bg-blis-red text-white w-full sm:w-auto px-8 py-4 sm:px-8 sm:py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(190,11,60,0.3)] mt-4 sm:mt-0"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    Nueva Plantilla
                </button>
            </div>

            {templates.length === 0 ? (
                <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-12 text-center">
                    <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No hay plantillas configuradas</p>
                    <p className="text-sm text-gray-500">Crea tu primera plantilla de certificado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {templates.map((template) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-6 space-y-5 group hover:border-blis-red/30 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Award className="w-24 h-24 text-white" />
                            </div>

                            <div className="aspect-[1.414/1] bg-black rounded-[2rem] border border-white/5 overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">
                                {template.backgroundImage ? (
                                    <img src={template.backgroundImage} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="Preview" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-900">
                                        <Layout className="w-20 h-20" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <button
                                        onClick={() => handleEditTemplate(template)}
                                        className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Eye className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-blis-red transition-colors">{template.title}</h3>
                                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">{template.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                <div className="flex gap-2">
                                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20">
                                        <CheckCircle2 className="w-3 h-3" /> Guardado
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="p-3 bg-white/5 rounded-xl text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleEditTemplate(template)}
                                        className="p-3 bg-white/5 rounded-xl text-zinc-600 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}