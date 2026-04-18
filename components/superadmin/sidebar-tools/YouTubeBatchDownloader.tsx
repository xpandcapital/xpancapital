"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Plus, X, Download, Check, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { DownloadItem } from './types';

const YouTubeBatchDownloader = () => {
    const [links, setLinks] = useState<DownloadItem[]>([])
    const [inputUrl, setInputUrl] = useState('')
    const [quality, setQuality] = useState<'best' | '720p' | '480p'>('best')
    const [globalStatus, setGlobalStatus] = useState<'idle' | 'downloading'>('idle')
    const activeDownloads = useRef<Set<string>>(new Set())
    const MAX_CONCURRENT = 4

    const extractVideoId = (url: string): string | null => {
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|p\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
        return match ? match[1] : null
    }

    const addLink = () => {
        const url = inputUrl.trim()
        if (!url) return
        const videoId = extractVideoId(url)
        if (!videoId) return
        if (links.some(l => l.url.includes(videoId))) { setInputUrl(''); return }
        const newItem: DownloadItem = {
            id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            url,
            title: `Video ${links.length + 1}`,
            status: 'pending',
            progress: 0,
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        }
        setLinks(prev => [...prev, newItem])
        setInputUrl('')
    }

    const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id))

    const startDownload = async (item: DownloadItem) => {
        if (activeDownloads.current.size >= MAX_CONCURRENT) return
        activeDownloads.current.add(item.id)
        setLinks(prev => prev.map(l => l.id === item.id ? { ...l, status: 'downloading' as const, progress: 10, error: undefined } : l))

        try {
            const res = await fetch('/api/tools/youtube-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: item.url, quality }),
            })
            const data = await res.json()

            if (data.success) {
                setLinks(prev => prev.map(l => l.id === item.id ? {
                    ...l,
                    status: 'done' as const,
                    progress: 100,
                    title: data.title || l.title,
                    size: data.size || '',
                    downloadUrl: data.downloadUrl,
                    downloadLinks: data.downloadLinks || [],
                    isDirectDownload: data.isDirectDownload,
                } : l))
            } else {
                setLinks(prev => prev.map(l => l.id === item.id ? {
                    ...l,
                    status: 'error' as const,
                    error: data.error || 'Error desconocido',
                } : l))
            }
        } catch {
            setLinks(prev => prev.map(l => l.id === item.id ? {
                ...l,
                status: 'error' as const,
                error: 'Error de conexión',
            } : l))
        } finally {
            activeDownloads.current.delete(item.id)
            processQueue()
        }
    }

    const processQueue = useCallback(() => {
        setLinks(currentLinks => {
            const pending = currentLinks.filter(l => l.status === 'pending')
            const canStart = MAX_CONCURRENT - activeDownloads.current.size
            for (let i = 0; i < Math.min(canStart, pending.length); i++) {
                startDownload(pending[i])
            }
            return currentLinks
        })
    }, [quality])

    const startAll = () => {
        setGlobalStatus('downloading')
        const pending = links.filter(l => l.status === 'pending')
        const canStart = MAX_CONCURRENT - activeDownloads.current.size
        for (let i = 0; i < Math.min(canStart, pending.length); i++) {
            startDownload(pending[i])
        }
    }

    const retryItem = (item: DownloadItem) => {
        setLinks(prev => prev.map(l => l.id === item.id ? { ...l, status: 'pending' as const, error: undefined, progress: 0 } : l))
        setTimeout(() => startDownload({ ...item, status: 'pending' }), 100)
    }

    const clearCompleted = () => {
        setLinks(prev => prev.filter(l => l.status !== 'done'))
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { e.preventDefault(); addLink() }
    }

    const completedCount = links.filter(l => l.status === 'done').length
    const downloadingCount = links.filter(l => l.status === 'downloading').length
    const errorCount = links.filter(l => l.status === 'error').length
    const pendingCount = links.filter(l => l.status === 'pending').length

    return (
        <div className="space-y-4">
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">YouTube Batch Downloader</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Máximo 4 descargas simultáneas · Máxima calidad</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {links.length > 0 && (
                            <div className="flex items-center gap-3 text-[10px] font-bold">
                                {completedCount > 0 && <span className="text-emerald-400">{completedCount} ✓</span>}
                                {downloadingCount > 0 && <span className="text-amber-400">{downloadingCount} ↓</span>}
                                {errorCount > 0 && <span className="text-red-400">{errorCount} ✗</span>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input type="text" value={inputUrl} onChange={e => setInputUrl(e.target.value)} onKeyDown={onKeyDown} placeholder="Pega un enlace de YouTube aquí..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-blis-red/50 transition-colors" />
                        {inputUrl && (<button onClick={() => setInputUrl('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>)}
                    </div>
                    <button onClick={addLink} className="px-4 py-3 bg-blis-red text-white rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Agregar</button>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Calidad:</span>
                    {(['best', '720p', '480p'] as const).map(q => (
                        <button key={q} onClick={() => setQuality(q)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${quality === q ? 'bg-blis-red/10 text-blis-red border border-blis-red/30' : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'}`}>
                            {q === 'best' ? 'Máxima' : q}
                        </button>
                    ))}
                </div>
            </div>

            {links.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{links.length} video{links.length > 1 ? 's' : ''} en cola</span>
                        <div className="flex items-center gap-2">
                            {completedCount > 0 && (<button onClick={clearCompleted} className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-gray-400 font-bold uppercase tracking-widest transition-all">Limpiar</button>)}
                            <button onClick={startAll} disabled={pendingCount === 0 && downloadingCount === 0} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5" /> {downloadingCount > 0 ? `Procesando (${downloadingCount})` : 'Obtener Enlaces'}
                            </button>
                        </div>
                    </div>

                    {links.map(item => (
                        <div key={item.id} className="bg-zinc-950 border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:border-white/10 transition-colors">
                            {item.thumbnail && (<div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-800"><img src={item.thumbnail} alt="" className="w-full h-full object-cover" /></div>)}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{item.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {item.status === 'pending' && <span className="text-[10px] text-gray-500 font-bold">En cola</span>}
                                    {item.status === 'downloading' && (<div className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin text-amber-400" /><span className="text-[10px] text-amber-400 font-bold">Obteniendo enlaces...</span></div>)}
                                    {item.status === 'done' && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Listo</span>
                                            {item.downloadLinks && item.downloadLinks.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 mt-0.5">
                                                    {item.downloadLinks.map((link: any) => (<a key={link.quality} href={link.url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-blis-red/10 border border-blis-red/30 rounded text-[9px] text-blis-red font-bold hover:bg-blis-red/20 transition-all flex items-center gap-1"><ExternalLink className="w-2.5 h-2.5" /> {link.label}</a>))}
                                                </div>
                                            ) : item.downloadUrl ? (
                                                <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-blis-red/10 border border-blis-red/30 rounded text-[10px] text-blis-red font-bold hover:bg-blis-red/20 transition-all flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Abrir descarga</a>
                                            ) : null}
                                        </div>
                                    )}
                                    {item.status === 'error' && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-red-400 font-bold">{item.error}</span>
                                            <button onClick={() => retryItem(item)} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-bold hover:bg-red-500/20 transition-all">Reintentar</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => removeLink(item.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export { YouTubeBatchDownloader };