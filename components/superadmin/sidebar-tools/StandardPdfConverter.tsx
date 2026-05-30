"use client";

import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, Download, FileText, Loader2,
    Combine, Scissors, Film, Image, FileSpreadsheet,
    X, ArrowRight, Zap, AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const MODES = [
    { id: 'compress', name: 'Comprimir PDF', icon: Zap, desc: 'Reduce el tamaño de archivos PDF', accept: '.pdf' },
    { id: 'merge', name: 'Unir PDFs', icon: Combine, desc: 'Combina múltiples PDFs en uno solo', accept: '.pdf', multiple: true },
    { id: 'split', name: 'Dividir PDF', icon: Scissors, desc: 'Extrae páginas o divide por rangos', accept: '.pdf' },
    { id: 'officepdf', name: 'Office → PDF', icon: FileSpreadsheet, desc: 'Convierte DOCX, XLSX, PPTX a PDF', accept: '.docx,.xlsx,.pptx,.doc,.xls,.ppt' },
    { id: 'pdfjpg', name: 'PDF → Imágenes', icon: Image, desc: 'Extrae páginas como JPG', accept: '.pdf' },
    { id: 'imagepdf', name: 'Imágenes → PDF', icon: Film, desc: 'Crea un PDF desde imágenes', accept: '.jpg,.jpeg,.png,.gif,.webp', multiple: true },
] as const;

type Mode = typeof MODES[number]['id'];

const COMPRESSION_LEVELS = [
    { id: 'extreme', name: 'Compresión Extrema', desc: 'Máxima reducción, menor calidad' },
    { id: 'recommended', name: 'Recomendado', desc: 'Equilibrio calidad/tamaño' },
    { id: 'low', name: 'Compresión Ligera', desc: 'Mejor calidad, archivo más grande' },
];

const ORIENTATIONS = [
    { id: 'portrait', name: 'Vertical' },
    { id: 'landscape', name: 'Horizontal' },
];

const PAGE_SIZES = [
    { id: 'fit', name: 'Ajustar a imagen' },
    { id: 'A4', name: 'A4' },
    { id: 'letter', name: 'Carta' },
];

interface UploadedFile {
    file: File;
    serverFilename: string | null;
    status: 'pending' | 'uploading' | 'uploaded' | 'error';
    error?: string;
}

function StandardPdfConverter() {
    const [mode, setMode] = useState<Mode>('compress');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [resultFilename, setResultFilename] = useState<string>('');

    // Mode-specific options
    const [compressionLevel, setCompressionLevel] = useState('recommended');
    const [splitMode, setSplitMode] = useState<'ranges' | 'remove_pages' | 'fixed_range'>('ranges');
    const [splitRanges, setSplitRanges] = useState('');
    const [fixedRange, setFixedRange] = useState(1);
    const [removePages, setRemovePages] = useState('');
    const [pdfjpgMode, setPdfjpgMode] = useState<'pages' | 'extract'>('pages');
    const [orientation, setOrientation] = useState('portrait');
    const [pageSize, setPageSize] = useState('fit');
    const [margin, setMargin] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setFiles([]);
        setProcessing(false);
        setProgress(0);
        setStatusMsg('');
        setError(null);
        setResultBlob(null);
        setResultFilename('');
    };

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        resetState();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files;
        if (!selected || selected.length === 0) return;
        const modeDef = MODES.find(m => m.id === mode);
        const acceptExts = (modeDef?.accept || '').split(',').map(s => s.trim());

        const newFiles: UploadedFile[] = [];
        for (let i = 0; i < selected.length; i++) {
            const f = selected[i];
            const ext = '.' + f.name.split('.').pop()?.toLowerCase();
            if (!acceptExts.some(a => a === ext || a === '.*')) {
                setError(`Formato no soportado: ${f.name}. Se espera: ${modeDef?.accept}`);
                return;
            }
            newFiles.push({ file: f, serverFilename: null, status: 'pending' });
        }

        setError(null);
        setResultBlob(null);

        if (mode === 'merge' || mode === 'imagepdf') {
            setFiles(prev => [...prev, ...newFiles].slice(0, 50));
        } else {
            setFiles(newFiles.slice(0, 1));
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setResultBlob(null);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files;
        if (dropped.length === 0) return;

        const modeDef = MODES.find(m => m.id === mode);
        const acceptExts = (modeDef?.accept || '').split(',').map(s => s.trim());

        const newFiles: UploadedFile[] = [];
        for (let i = 0; i < dropped.length; i++) {
            const f = dropped[i];
            const ext = '.' + f.name.split('.').pop()?.toLowerCase();
            if (!acceptExts.some(a => a === ext || a === '.*')) continue;
            newFiles.push({ file: f, serverFilename: null, status: 'pending' });
        }

        if (newFiles.length === 0) {
            setError(`Formato no soportado. Se espera: ${modeDef?.accept}`);
            return;
        }

        setError(null);
        setResultBlob(null);

        if (mode === 'merge' || mode === 'imagepdf') {
            setFiles(prev => [...prev, ...newFiles].slice(0, 50));
        } else {
            setFiles(newFiles.slice(0, 1));
        }
    }, [mode]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const getPublicKey = async (): Promise<string> => {
        const res = await fetch('/api/ilovepdf/config');
        const data = await res.json();
        if (!data.publicKey) throw new Error('iLovePDF no está configurado. Agrega tus API keys en API Nube → Documentos & PDF → iLovePDF.');
        return data.publicKey;
    };

    const iloveAuth = async (publicKey: string): Promise<string> => {
        const res = await fetch('https://api.ilovepdf.com/v1/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_key: publicKey }),
        });
        const data = await res.json();
        if (!data.token) throw new Error('Error al autenticar con iLovePDF');
        return data.token;
    };

    const iloveStart = async (token: string, tool: string): Promise<{ server: string; task: string }> => {
        const res = await fetch(`https://api.ilovepdf.com/v1/start/${tool}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.server || !data.task) throw new Error('Error al iniciar tarea en iLovePDF');
        return { server: data.server, task: data.task };
    };

    const iloveUpload = async (server: string, task: string, token: string, file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('task', task);
        formData.append('file', file);

        const res = await fetch(`https://${server}/v1/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        if (!data.server_filename) throw new Error(`Error al subir ${file.name}`);
        return data.server_filename;
    };

    const iloveProcess = async (server: string, token: string, tool: string, task: string, serverFilenames: string[], originalNames: string[], extraParams: Record<string, unknown> = {}): Promise<void> => {
        const filesToProcess = serverFilenames.map((sfn, i) => ({
            server_filename: sfn,
            filename: originalNames[i],
        }));

        const body: Record<string, unknown> = {
            task,
            tool,
            files: filesToProcess,
            ...extraParams,
        };

        const res = await fetch(`https://${server}/v1/process`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.status === 'TaskError') throw new Error('Error al procesar: ' + (data.message || 'Error desconocido'));
    };

    const iloveDownload = async (server: string, task: string, token: string): Promise<{ blob: Blob; filename: string }> => {
        const res = await fetch(`https://${server}/v1/download/${task}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const blob = await res.blob();
        const disposition = res.headers.get('content-disposition') || '';
        const match = disposition.match(/filename="?([^"]+)"?/);
        const filename = match ? match[1] : 'resultado.pdf';
        return { blob, filename };
    };

    const getToolName = (m: Mode): string => {
        switch (m) {
            case 'compress': return 'compress';
            case 'merge': return 'merge';
            case 'split': return 'split';
            case 'officepdf': return 'officepdf';
            case 'pdfjpg': return 'pdfjpg';
            case 'imagepdf': return 'imagepdf';
        }
    };

    const getExtraParams = (): Record<string, unknown> => {
        switch (mode) {
            case 'compress':
                return { compression_level: compressionLevel };
            case 'split':
                if (splitMode === 'ranges') return { split_mode: 'ranges', ranges: splitRanges || '1' };
                if (splitMode === 'fixed_range') return { split_mode: 'fixed_range', fixed_range: fixedRange || 1 };
                return { split_mode: 'remove_pages', remove_pages: removePages || '' };
            case 'pdfjpg':
                return { pdfjpg_mode: pdfjpgMode };
            case 'imagepdf':
                return { orientation, margin: String(margin), pagesize: pageSize, merge_after: true };
            default:
                return {};
        }
    };

    const handleProcess = async () => {
        if (files.length === 0) {
            setError('Selecciona al menos un archivo');
            return;
        }

        setProcessing(true);
        setProgress(0);
        setStatusMsg('Conectando con iLovePDF...');
        setError(null);

        try {
            const publicKey = await getPublicKey();
            setProgress(5);
            setStatusMsg('Autenticando...');

            const token = await iloveAuth(publicKey);
            setProgress(10);

            const tool = getToolName(mode);
            setStatusMsg('Iniciando tarea...');
            const { server, task } = await iloveStart(token, tool);
            setProgress(15);

            // Upload files
            const serverFilenames: string[] = [];
            const originalNames: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const pct = 15 + Math.round((i / files.length) * 35);
                setProgress(pct);
                setStatusMsg(`Subiendo ${files[i].file.name} (${formatSize(files[i].file.size)})...`);

                setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' as const } : f));
                const sfn = await iloveUpload(server, task, token, files[i].file);
                serverFilenames.push(sfn);
                originalNames.push(files[i].file.name);
                setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploaded' as const, serverFilename: sfn } : f));
            }

            setProgress(55);
            setStatusMsg('Procesando archivos...');
            await iloveProcess(server, token, tool, task, serverFilenames, originalNames, getExtraParams());

            setProgress(80);
            setStatusMsg('Descargando resultado...');
            const { blob, filename } = await iloveDownload(server, task, token);

            setProgress(100);
            setStatusMsg('¡Completado!');
            setResultBlob(blob);
            setResultFilename(filename);
            setProcessing(false);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setProcessing(false);
            setProgress(0);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resultFilename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const modeDef = MODES.find(m => m.id === mode);

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                    PDF & Document <span className="text-blis-red">Converter</span>
                </h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    Powered by iLovePDF · Archivos hasta 2GB
                </p>
            </div>

            {/* Mode Tabs */}
            <div className="flex flex-wrap gap-1.5 justify-center">
                {MODES.map(m => (
                    <button
                        key={m.id}
                        onClick={() => handleModeChange(m.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                            ${mode === m.id
                                ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                                : 'bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
                            }`}
                    >
                        <m.icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{m.name}</span>
                    </button>
                ))}
            </div>

            {/* Mode Description */}
            {modeDef && (
                <p className="text-center text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em]">
                    {modeDef.desc}
                </p>
            )}

            {/* Options Panel */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
                {mode === 'compress' && (
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Nivel de Compresión</label>
                        <div className="grid grid-cols-3 gap-2">
                            {COMPRESSION_LEVELS.map(cl => (
                                <button
                                    key={cl.id}
                                    onClick={() => setCompressionLevel(cl.id)}
                                    className={`p-3 rounded-xl border text-center transition-all
                                        ${compressionLevel === cl.id
                                            ? 'border-blis-red/50 bg-blis-red/10 text-white'
                                            : 'border-white/5 bg-white/[0.02] text-zinc-500 hover:border-white/10'
                                        }`}
                                >
                                    <div className="text-[10px] font-black uppercase">{cl.name}</div>
                                    <div className="text-[8px] text-zinc-600 mt-1">{cl.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {mode === 'split' && (
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Modo de División</label>
                        <div className="flex gap-2">
                            {(['ranges', 'fixed_range', 'remove_pages'] as const).map(sm => (
                                <button
                                    key={sm}
                                    onClick={() => setSplitMode(sm)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all
                                        ${splitMode === sm
                                            ? 'bg-blis-red text-white'
                                            : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                                        }`}
                                >
                                    {sm === 'ranges' ? 'Rangos' : sm === 'fixed_range' ? 'Cada N pág' : 'Eliminar pág'}
                                </button>
                            ))}
                        </div>
                        {splitMode === 'ranges' && (
                            <input
                                type="text"
                                value={splitRanges}
                                onChange={e => setSplitRanges(e.target.value)}
                                placeholder="Ej: 1,3,5-10"
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blis-red/50"
                            />
                        )}
                        {splitMode === 'fixed_range' && (
                            <input
                                type="number"
                                min={1}
                                value={fixedRange}
                                onChange={e => setFixedRange(parseInt(e.target.value) || 1)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blis-red/50"
                            />
                        )}
                        {splitMode === 'remove_pages' && (
                            <input
                                type="text"
                                value={removePages}
                                onChange={e => setRemovePages(e.target.value)}
                                placeholder="Ej: 1,4,8-12"
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blis-red/50"
                            />
                        )}
                    </div>
                )}

                {mode === 'pdfjpg' && (
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Modo de Extracción</label>
                        <div className="flex gap-2">
                            {(['pages', 'extract'] as const).map(pm => (
                                <button
                                    key={pm}
                                    onClick={() => setPdfjpgMode(pm)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all
                                        ${pdfjpgMode === pm
                                            ? 'bg-blis-red text-white'
                                            : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                                        }`}
                                >
                                    {pm === 'pages' ? 'Páginas → JPG' : 'Extraer imágenes'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {mode === 'imagepdf' && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1.5">Orientación</label>
                                <div className="flex gap-1">
                                    {ORIENTATIONS.map(o => (
                                        <button
                                            key={o.id}
                                            onClick={() => setOrientation(o.id)}
                                            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase transition-all
                                                ${orientation === o.id
                                                    ? 'bg-blis-red text-white'
                                                    : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                                                }`}
                                        >
                                            {o.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1.5">Tamaño</label>
                                <select
                                    value={pageSize}
                                    onChange={e => setPageSize(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-[10px] text-white outline-none"
                                >
                                    {PAGE_SIZES.map(ps => (
                                        <option key={ps.id} value={ps.id}>{ps.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1.5">Margen (px)</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={margin}
                                    onChange={e => setMargin(parseInt(e.target.value) || 0)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-[10px] text-white outline-none focus:border-blis-red/50"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Drop Zone */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={modeDef?.accept}
                multiple={mode === 'merge' || mode === 'imagepdf'}
                onChange={handleFileSelect}
            />

            {!processing && !resultBlob && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-white/10 rounded-2xl p-12 text-center cursor-pointer hover:border-blis-red/30 transition-all group"
                >
                    <div className="absolute inset-0 bg-blis-red/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
                    <Upload className="w-10 h-10 text-zinc-700 group-hover:text-blis-red mx-auto mb-4 transition-colors" />
                    <p className="text-zinc-500 text-sm font-medium">
                        Arrastra tus archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-zinc-700 text-[9px] font-black uppercase tracking-widest mt-2">
                        {modeDef?.accept?.replace(/\./g, '').toUpperCase()} · Máx 2GB
                    </p>
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                        Archivos ({files.length})
                    </label>
                    <div className="space-y-1">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                <div className="flex items-center gap-3 truncate">
                                    <FileText className="w-4 h-4 text-zinc-600 shrink-0" />
                                    <div className="truncate">
                                        <div className="text-white text-xs font-medium truncate">{f.file.name}</div>
                                        <div className="text-zinc-600 text-[9px]">{formatSize(f.file.size)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {f.status === 'uploaded' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                    {f.status === 'uploading' && <Loader2 className="w-4 h-4 text-blis-red animate-spin" />}
                                    {!processing && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                            className="p-1 hover:bg-white/5 rounded-lg"
                                        >
                                            <X className="w-3.5 h-3.5 text-zinc-600 hover:text-red-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Process Button */}
            {files.length > 0 && !processing && !resultBlob && (
                <button
                    onClick={handleProcess}
                    className="w-full py-4 bg-blis-red hover:bg-blis-red/80 text-white font-black text-sm uppercase rounded-xl transition-all hover:shadow-lg hover:shadow-blis-red/20 flex items-center justify-center gap-3 group"
                >
                    <Zap className="w-5 h-5 group-hover:animate-pulse" />
                    Procesar {files.length > 1 ? `${files.length} archivos` : 'archivo'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            )}

            {/* Processing Progress */}
            {processing && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Loader2 className="w-4 h-4 text-blis-red animate-spin" />
                        <span className="text-sm font-medium">{statusMsg}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blis-red rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>
                    <p className="text-zinc-600 text-[10px] font-black text-right">{progress}%</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Result + Download */}
            {resultBlob && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                            <p className="text-emerald-400 text-sm font-bold">¡Procesado con éxito!</p>
                            <p className="text-emerald-600 text-xs">{resultFilename} · {formatSize(resultBlob.size)}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm uppercase rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Descargar
                        </button>
                        <button
                            onClick={resetState}
                            className="px-6 py-4 bg-white/5 hover:bg-white/10 text-zinc-400 font-black text-sm uppercase rounded-xl transition-all"
                        >
                            Nuevo
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Credits Info */}
            <p className="text-center text-zinc-800 text-[8px] font-black uppercase tracking-[0.3em]">
                Créditos por operación · Comprimir: 10 · Unir: 5 · Dividir: 5 · Office→PDF: 10
            </p>
        </div>
    );
}

export { StandardPdfConverter };
