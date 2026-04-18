"use client";

import React, { useState, useRef } from 'react';
import { Upload, Download, Video, Film, Music, Settings2, RotateCcw, Loader2, Zap } from 'lucide-react';

const VIDEO_FORMATS = [
    { id: 'mp4', name: 'MP4', mime: 'video/mp4', ext: '.mp4' },
    { id: 'webm', name: 'WebM', mime: 'video/webm', ext: '.webm' },
    { id: 'mov', name: 'MOV', mime: 'video/quicktime', ext: '.mov' },
    { id: 'avi', name: 'AVI', mime: 'video/x-msvideo', ext: '.avi' },
    { id: 'mkv', name: 'MKV', mime: 'video/x-matroska', ext: '.mkv' },
];

const AUDIO_FORMATS = [
    { id: 'mp3', name: 'MP3', mime: 'audio/mpeg', ext: '.mp3' },
    { id: 'wav', name: 'WAV', mime: 'audio/wav', ext: '.wav' },
    { id: 'aac', name: 'AAC', mime: 'audio/aac', ext: '.aac' },
    { id: 'ogg', name: 'OGG', mime: 'audio/ogg', ext: '.ogg' },
    { id: 'flac', name: 'FLAC', mime: 'audio/flac', ext: '.flac' },
];

const QUALITY_PRESETS = [
    { id: '4k', name: '4K Ultra HD', width: 3840, height: 2160, bitrate: 20000000, size: '~2GB/hora' },
    { id: '1080p', name: 'Full HD 1080p', width: 1920, height: 1080, bitrate: 8000000, size: '~700MB/hora' },
    { id: '720p', name: 'HD 720p', width: 1280, height: 720, bitrate: 5000000, size: '~450MB/hora' },
    { id: '480p', name: 'SD 480p', width: 854, height: 480, bitrate: 2500000, size: '~200MB/hora' },
    { id: '360p', name: 'Mobile 360p', width: 640, height: 360, bitrate: 1000000, size: '~80MB/hora' },
    { id: '240p', name: 'Ultra Ligero', width: 426, height: 240, bitrate: 500000, size: '~40MB/hora' },
    { id: 'custom', name: 'Personalizado', width: 0, height: 0, bitrate: 0 },
];

const OUTPUT_FORMATS = [
    { id: 'webm', name: 'WebM', mime: 'video/webm', codecs: 'vp9', audioCodecs: 'opus' },
    { id: 'webm-vp8', name: 'WebM (VP8)', mime: 'video/webm', codecs: 'vp8', audioCodecs: 'vorbis' },
];

const COMPRESSION_LEVELS = [
    { id: 'high', name: 'Alta Calidad', bitrateMultiplier: 1.5, desc: 'Mejor calidad, archivo más grande' },
    { id: 'medium', name: 'Balanceado', bitrateMultiplier: 1, desc: 'Equilibrio entre calidad y tamaño' },
    { id: 'low', name: 'Tamaño Reducido', bitrateMultiplier: 0.6, desc: 'Archivo pequeño, menor calidad' },
];

function StandardVideoConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [mode, setMode] = useState<'convert' | 'extract' | 'compress'>('convert');
    const [outputFormat, setOutputFormat] = useState('webm');
    const [audioFormat, setAudioFormat] = useState('mp3');
    const [quality, setQuality] = useState('1080p');
    const [compressionLevel, setCompressionLevel] = useState('low');
    const [customWidth, setCustomWidth] = useState(1920);
    const [customHeight, setCustomHeight] = useState(1080);
    const [customBitrate, setCustomBitrate] = useState(8000);
    const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
    const [videoInfo, setVideoInfo] = useState<{ duration: number; width: number; height: number; size: string; name: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        if (!selectedFile.type.startsWith('video/')) {
            setError('Por favor selecciona un archivo de video válido');
            return;
        }
        setFile(selectedFile);
        setError(null);
        setProcessedBlob(null);
        setProgress(0);
        const url = URL.createObjectURL(selectedFile);
        setPreview(url);
        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
            setVideoInfo({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                size: formatFileSize(selectedFile.size),
                name: selectedFile.name
            });
        };
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith('video/')) {
            const fakeEvent = { target: { files: [droppedFile] } } as any;
            handleFileSelect(fakeEvent);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
        if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return bytes + ' bytes';
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
    };

    const compressVideo = async () => {
        if (!file || !videoRef.current) return;
        setProcessing(true);
        setProgress(0);
        setError(null);
        try {
            const video = videoRef.current;
            const selectedQuality = QUALITY_PRESETS.find(q => q.id === quality) || QUALITY_PRESETS[1];
            const compressionSetting = COMPRESSION_LEVELS.find(l => l.id === compressionLevel) || COMPRESSION_LEVELS[1];
            const selectedFormat = OUTPUT_FORMATS.find(f => f.id === outputFormat) || OUTPUT_FORMATS[0];
            const videoAspect = video.videoWidth / video.videoHeight;
            let targetWidth: number, targetHeight: number;
            if (quality === 'custom') {
                targetWidth = Math.min(customWidth, video.videoWidth);
                targetHeight = Math.min(customHeight, video.videoHeight);
            } else {
                const maxWidth = selectedQuality.width;
                const maxHeight = selectedQuality.height;
                if (videoAspect > 1) {
                    targetWidth = Math.min(maxWidth, video.videoWidth);
                    targetHeight = Math.round(targetWidth / videoAspect);
                } else {
                    targetHeight = Math.min(maxHeight, video.videoHeight);
                    targetWidth = Math.round(targetHeight * videoAspect);
                }
            }
            const baseBitrate = quality === 'custom' ? customBitrate * 1000 : selectedQuality.bitrate;
            const targetBitrate = Math.round(baseBitrate * compressionSetting.bitrateMultiplier);
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d')!;
            const videoStream = canvas.captureStream(30);
            const audioStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream();
            const audioTracks = audioStream?.getAudioTracks() || [];
            const combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioTracks]);
            const mimeType = MediaRecorder.isTypeSupported(`video/webm;codecs=${selectedFormat.codecs}`) ? `video/webm;codecs=${selectedFormat.codecs}` : 'video/webm';
            const mediaRecorder = new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: targetBitrate, audioBitsPerSecond: 128000 });
            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                setProcessedBlob(blob);
                setProcessing(false);
                setProgress(100);
                video.pause();
            };
            video.muted = false;
            video.volume = 0;
            video.currentTime = 0;
            mediaRecorder.start();
            await video.play();
            const duration = video.duration;
            const frameInterval = setInterval(() => {
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
                const currentProgress = Math.round((video.currentTime / duration) * 100);
                setProgress(Math.min(currentProgress, 99));
            }, 1000 / 30);
            video.onended = () => { clearInterval(frameInterval); mediaRecorder.stop(); };
        } catch (err: any) { setError(err.message || 'Error al procesar el video'); setProcessing(false); }
    };

    const extractAudio = async () => {
        if (!file || !videoRef.current) return;
        setProcessing(true);
        setProgress(0);
        setError(null);
        try {
            const video = videoRef.current;
            const stream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream();
            if (!stream) { throw new Error('Tu navegador no soporta captura de audio desde video'); }
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) { throw new Error('Este video no tiene pista de audio'); }
            const audioStream = new MediaStream(audioTracks);
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
            const chunks: Blob[] = [];
            const mediaRecorder = new MediaRecorder(audioStream, { mimeType, audioBitsPerSecond: 192000 });
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                setProcessedBlob(blob);
                setProcessing(false);
                setProgress(100);
                video.pause();
                video.muted = true;
            };
            video.muted = false;
            video.playbackRate = 1;
            video.currentTime = 0;
            mediaRecorder.start();
            await video.play();
            const duration = video.duration;
            const progressInterval = setInterval(() => {
                const currentProgress = Math.round((video.currentTime / duration) * 100);
                setProgress(Math.min(currentProgress, 99));
            }, 100);
            video.onended = () => { clearInterval(progressInterval); mediaRecorder.stop(); };
            video.onerror = () => { clearInterval(progressInterval); setError('Error durante el procesamiento del video'); setProcessing(false); };
        } catch (err: any) { setError(err.message || 'Error al extraer el audio'); setProcessing(false); }
    };

    const downloadProcessed = () => {
        if (!processedBlob) return;
        const format = mode === 'extract' ? AUDIO_FORMATS.find(f => f.id === audioFormat)! : VIDEO_FORMATS.find(f => f.id === outputFormat)!;
        const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'video';
        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}_converted${format.ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const resetTool = () => {
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
        setProcessedBlob(null);
        setProgress(0);
        setVideoInfo(null);
        setError(null);
        setProcessing(false);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {error && (<div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm"><strong>Error:</strong> {error}</div>)}
            {!file ? (
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="border-2 border-dashed border-white/10 hover:border-blis-red/50 rounded-3xl p-16 text-center transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-blis-red/10 transition-colors"><Upload className="w-10 h-10 text-zinc-500 group-hover:text-blis-red transition-colors" /></div>
                    <h3 className="text-xl font-black text-white uppercase italic mb-2">Arrastra o Selecciona Video</h3>
                    <p className="text-zinc-500 text-sm max-w-md mx-auto">Soporta MP4, WebM, MOV, AVI, MKV y más. Máximo 2GB.</p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">{['MP4', 'WebM', 'MOV', 'AVI', 'MKV'].map((fmt) => (<span key={fmt} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-zinc-400 uppercase">{fmt}</span>))}</div>
                </div>
            ) : (
                <>
                    {videoInfo && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"><div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Duración</div><div className="text-xl font-black text-white">{formatTime(videoInfo.duration)}</div></div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"><div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Resolución</div><div className="text-xl font-black text-white">{videoInfo.width}×{videoInfo.height}</div></div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"><div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tamaño</div><div className="text-xl font-black text-white">{videoInfo.size}</div></div>
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"><div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Formato</div><div className="text-xl font-black text-white uppercase">{file.name.split('.').pop()}</div></div>
                        </div>
                    )}
                    <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
                        <video ref={videoRef} src={preview || undefined} controls className="w-full max-h-[400px] object-contain" />
                    </div>
                    <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                        {[{ id: 'convert' as const, label: 'Convertir Formato', icon: Film }, { id: 'extract' as const, label: 'Extraer Audio', icon: Music }, { id: 'compress' as const, label: 'Comprimir', icon: Settings2 }].map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setMode(id)} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-[10px] font-black uppercase transition-all ${mode === id ? 'bg-blis-red text-white shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                                <Icon className="w-4 h-4" />{label}
                            </button>
                        ))}
                    </div>
                    {mode === 'convert' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Formato de Salida</label><select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blis-red">{VIDEO_FORMATS.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}</select></div>
                            <div><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Calidad</label><select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blis-red">{QUALITY_PRESETS.map((q) => (<option key={q.id} value={q.id}>{q.name}</option>))}</select></div>
                        </div>
                    )}
                    {mode === 'extract' && (
                        <div><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Formato de Audio</label><div className="grid grid-cols-5 gap-2">{AUDIO_FORMATS.map((f) => (<button key={f.id} onClick={() => setAudioFormat(f.id)} className={`p-3 rounded-xl border text-center transition-all ${audioFormat === f.id ? 'bg-blis-red/10 border-blis-red text-blis-red' : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'}`}><Music className="w-5 h-5 mx-auto mb-1" /><div className="text-[10px] font-black uppercase">{f.name}</div></button>))}</div></div>
                    )}
                    {mode === 'compress' && (
                        <div className="space-y-6">
                            {videoInfo && (() => {
                                const selectedPreset = QUALITY_PRESETS.find(q => q.id === quality);
                                const videoAspect = videoInfo.width / videoInfo.height;
                                const isVertical = videoAspect < 1;
                                let outputW: number, outputH: number;
                                if (quality === 'custom') { outputW = Math.min(customWidth, videoInfo.width); outputH = Math.min(customHeight, videoInfo.height); } else {
                                    const maxWidth = selectedPreset?.width || 1920; const maxHeight = selectedPreset?.height || 1080;
                                    if (isVertical) { outputH = Math.min(maxHeight, videoInfo.height); outputW = Math.round(outputH * videoAspect); } else { outputW = Math.min(maxWidth, videoInfo.width); outputH = Math.round(outputW / videoAspect); }
                                }
                                const wouldChange = outputW < videoInfo.width || outputH < videoInfo.height;
                                const isAlreadySmaller = !wouldChange && quality !== 'custom';
                                return (<div className={`p-4 rounded-xl border ${isAlreadySmaller ? 'bg-amber-500/5 border-amber-500/20' : 'bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border-emerald-500/20'}`}>
                                    <div className="text-[9px] font-black uppercase tracking-widest mb-3">{isAlreadySmaller ? <span className="text-amber-400">⚠️ Sin Cambios - Video ya es más pequeño</span> : <span className="text-emerald-400">Vista Previa de Salida</span>}</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div><div className="text-[9px] text-zinc-500 uppercase">Original</div><div className="text-sm font-black text-white">{videoInfo.width}×{videoInfo.height}</div><div className="text-[8px] text-zinc-600">{isVertical ? 'Vertical' : 'Horizontal'}</div></div>
                                        <div><div className="text-[9px] text-zinc-500 uppercase">Salida</div><div className="text-sm font-black text-emerald-400">{outputW}×{outputH}</div><div className="text-[8px] text-zinc-600">{wouldChange ? '↓ Reducido' : '= Sin cambios'}</div></div>
                                        <div><div className="text-[9px] text-zinc-500 uppercase">Formato</div><div className="text-sm font-black text-white">WebM (VP9)</div></div>
                                        <div><div className="text-[9px] text-zinc-500 uppercase">Audio</div><div className="text-sm font-black text-white">128 kbps Opus</div></div>
                                    </div>
                                </div>);
                            })()}
                            <div><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Resolución de Salida</label><div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{QUALITY_PRESETS.filter(p => p.id !== 'custom').map((q) => (<button key={q.id} onClick={() => setQuality(q.id)} className={`p-3 rounded-xl border text-center transition-all ${quality === q.id ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'}`}><div className="text-[10px] font-black uppercase">{q.id}</div><div className="text-[8px] text-zinc-600">{q.width}×{q.height}</div><div className="text-[7px] text-zinc-700 mt-1">{q.size}</div></button>))}<button onClick={() => setQuality('custom')} className={`p-3 rounded-xl border text-center transition-all ${quality === 'custom' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'}`}><div className="text-[10px] font-black uppercase">Custom</div><div className="text-[8px] text-zinc-600">Personalizado</div></button></div></div>
                            {quality === 'custom' && (<div className="grid grid-cols-3 gap-4"><div><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Ancho (px)</label><input type="number" value={customWidth} onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blis-red" /></div><div><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Alto (px)</label><input type="number" value={customHeight} onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blis-red" /></div><div><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Bitrate (kbps)</label><input type="number" value={customBitrate} onChange={(e) => setCustomBitrate(parseInt(e.target.value) || 0)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blis-red" /></div></div>)}
                            <div><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Nivel de Compresión</label><div className="grid grid-cols-3 gap-2">{COMPRESSION_LEVELS.map((level) => (<button key={level.id} onClick={() => setCompressionLevel(level.id)} className={`p-4 rounded-xl border text-center transition-all ${compressionLevel === level.id ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'}`}><div className="text-[11px] font-black uppercase">{level.name}</div><div className="text-[8px] text-zinc-600 mt-1">{level.desc}</div></button>))}</div></div>
                            <div><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Formato de Salida</label><div className="grid grid-cols-2 gap-2">{OUTPUT_FORMATS.map((format) => (<button key={format.id} onClick={() => setOutputFormat(format.id)} className={`p-3 rounded-xl border text-center transition-all ${outputFormat === format.id ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20'}`}><div className="text-[11px] font-black uppercase">{format.name}</div><div className="text-[8px] text-zinc-600">Codec: {format.codecs.toUpperCase()}</div></button>))}</div></div>
                        </div>
                    )}
                    {processing && (<div className="space-y-2"><div className="flex items-center justify-between text-[10px] font-black text-emerald-400 uppercase"><span>{mode === 'extract' ? 'Extrayendo audio...' : 'Convirtiendo video...'}</span><span>{progress}%</span></div><div className="h-3 bg-white/5 rounded-full overflow-hidden border border-emerald-500/20"><div className="h-full bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.5)]" style={{ width: `${progress}%` }} /></div><div className="text-[9px] text-zinc-500 text-center">{mode === 'extract' ? 'Procesando audio a velocidad normal para preservar calidad...' : 'Convertir mantiene la duración original. Para compresión rápida, usa 16x en convertidor externo.'}</div></div>)}
                    <div className="flex gap-4">
                        {!processedBlob ? (
                            <button onClick={mode === 'extract' ? extractAudio : compressVideo} disabled={processing} className="flex-1 py-4 bg-gradient-to-r from-blis-red to-red-600 text-white font-black uppercase rounded-2xl shadow-lg shadow-blis-red/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {processing ? (<><Loader2 className="w-5 h-5 animate-spin" />Procesando...</>) : (<>{mode === 'extract' ? <Music className="w-5 h-5" /> : <Video className="w-5 h-5" />}{mode === 'extract' ? 'Extraer Audio' : mode === 'compress' ? 'Comprimir Video' : 'Convertir Video'}</>)}
                            </button>
                        ) : (
                            <>
                                <button onClick={downloadProcessed} className="flex-1 py-4 bg-emerald-500 text-black font-black uppercase rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"><Download className="w-5 h-5" />Descargar</button>
                                <button onClick={resetTool} className="py-4 px-6 bg-white/5 border border-white/10 text-white font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10"><RotateCcw className="w-5 h-5" />Nuevo</button>
                            </>
                        )}
                    </div>
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"><div className="flex items-start gap-3"><Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><div className="text-sm text-zinc-300"><strong className="text-amber-400">Procesamiento Local:</strong> El video se procesa en tu navegador. Los tiempos varían según la duración y resolución del video. Para mejores resultados con archivos largos, considera dividir el video primero.</div></div></div>
                </>
            )}
        </div>
    );
}

export { StandardVideoConverter };