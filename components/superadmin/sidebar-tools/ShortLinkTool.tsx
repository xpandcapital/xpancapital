"use client";

import { useState, useEffect, useMemo } from 'react';
import { Link2, Copy, Check, Trash2, Loader2, Plus, ExternalLink, Search, BarChart3, MousePointerClick, TrendingUp, Calendar, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShortLink {
  id: string;
  codigo: string;
  url_destino: string;
  creado_en: string;
  clicks: number;
  ultimo_click: string | null;
}

export function ShortLinkTool() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlInput, setUrlInput] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => { loadLinks(); }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/short-links');
      const data = await res.json();
      if (data.success) setLinks(data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const createLink = async () => {
    if (!urlInput.trim()) { setError('Ingresa una URL'); return; }
    setCreating(true); setError('');
    try {
      const res = await fetch('/api/short-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim(), codigo: codigoInput.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setUrlInput(''); setCodigoInput('');
        await loadLinks();
      } else {
        setError(data.error || 'Error al crear');
      }
    } catch { setError('Error de red'); }
    finally { setCreating(false); }
  };

  const deleteLinks = async (codes: string[]) => {
    setDeleting(true);
    for (const c of codes) await fetch(`/api/short-links?codigo=${c}`, { method: 'DELETE' });
    setLinks(prev => prev.filter(l => !codes.includes(l.codigo)));
    setSelected(new Set());
    setShowDeleteConfirm(false);
    setDeleting(false);
  };

  const copyLink = (codigo: string) => {
    navigator.clipboard.writeText(`https://blis-corp.com/s/${codigo}`);
    setCopied(codigo);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSelect = (codigo: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(codigo) ? next.delete(codigo) : next.add(codigo);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredLinks.length) setSelected(new Set());
    else setSelected(new Set(filteredLinks.map(l => l.codigo)));
  };

  const filteredLinks = useMemo(() => {
    if (!searchQuery) return links;
    const q = searchQuery.toLowerCase();
    return links.filter(l => l.codigo.includes(q) || l.url_destino.toLowerCase().includes(q));
  }, [links, searchQuery]);

  const stats = useMemo(() => ({
    total: links.length,
    totalClicks: links.reduce((s, l) => s + (l.clicks || 0), 0),
    avgClicks: links.length ? Math.round(links.reduce((s, l) => s + (l.clicks || 0), 0) / links.length) : 0,
    mostClicked: [...links].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0],
  }), [links]);

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatRelative = (d: string | null) => {
    if (!d) return 'Nunca';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="space-y-6 p-2">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enlaces</span>
          </div>
          <span className="text-2xl font-black text-white">{stats.total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clicks totales</span>
          </div>
          <span className="text-2xl font-black text-white">{stats.totalClicks}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Promedio</span>
          </div>
          <span className="text-2xl font-black text-white">{stats.avgClicks}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top link</span>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold truncate block">
            {stats.mostClicked ? `/s/${stats.mostClicked.codigo}` : '—'}
          </span>
        </div>
      </div>

      {/* Create form */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Nuevo enlace
        </h3>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 text-xs transition-all"
            onKeyDown={e => e.key === 'Enter' && createLink()}
          />
          <button
            onClick={createLink}
            disabled={creating || !urlInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Acortar
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-[10px] font-mono">blis-corp.com/s/</span>
          <input
            type="text"
            value={codigoInput}
            onChange={e => setCodigoInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
            placeholder="personalizado (opcional)"
            maxLength={20}
            className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 text-xs font-mono transition-all"
          />
        </div>
        {error && <p className="text-red-400 text-[10px] font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
      </div>

      {/* Search + Bulk actions */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por código o URL..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-white/20 text-xs transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {selected.size > 0 && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {selected.size}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border-t border-white/5 pt-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Historial ({filteredLinks.length})
          </h3>
          {links.length > 0 && (
            <button onClick={toggleAll} className="text-[10px] text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-wider">
              {selected.size === filteredLinks.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 text-xs">
              {searchQuery ? 'Sin resultados para esta búsqueda' : 'No hay enlaces acortados aún'}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {filteredLinks.map(link => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  selected.has(link.codigo) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleSelect(link.codigo)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    selected.has(link.codigo) ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {selected.has(link.codigo) && <Check className="w-2.5 h-2.5 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(link.codigo)}
                      className="text-xs font-mono text-emerald-400 font-bold hover:text-emerald-300 transition-colors flex items-center gap-1"
                    >
                      /s/{link.codigo}
                      {copied === link.codigo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-50" />}
                    </button>
                    <a href={`/s/${link.codigo}`} target="_blank" className="text-gray-600 hover:text-white transition-colors shrink-0">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{link.url_destino}</p>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[9px] text-gray-600 flex items-center gap-1">
                      <MousePointerClick className="w-2.5 h-2.5" />
                      {link.clicks || 0} clicks
                    </span>
                    <span className="text-[9px] text-gray-600 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {formatRelative(link.ultimo_click)}
                    </span>
                    <span className="text-[9px] text-gray-600">{formatDate(link.creado_en)}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteLinks([link.codigo])}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[5000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="bg-zinc-950 border border-red-500/20 rounded-2xl p-6 w-full max-w-xs text-center space-y-4">
            <Trash2 className="w-8 h-8 text-red-400 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-white">¿Eliminar {selected.size} enlace{selected.size > 1 ? 's' : ''}?</h3>
              <p className="text-[10px] text-gray-500 mt-1">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={() => deleteLinks([...selected])} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-colors disabled:opacity-50">
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Eliminar'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
