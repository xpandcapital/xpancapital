"use client";

import { Plus, Search, Activity, Eye, Edit3, BarChart, Trash2, X, List, Grid, Check, Filter, Trash, Tag, Loader2, Lock, EyeOff, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActionGuard } from '@/hooks/useActionGuard';
import { DEFAULT_EMPRESA_ID } from '@/lib/empresa';

interface BlogPost {
    id: string;
    titulo: string;
    slug: string;
    contenido: string;
    extracto?: string;
    imagen_portada?: string;
    categoria?: { id: string; nombre: string; slug: string };
    estado: string;
    vistas: number;
    publicado_en?: string;
    creado_en: string;
    es_premium: boolean;
    precio_coins: number;
    contrasena?: string;
    visibilidad?: string;
    tags?: { id: string; nombre: string }[];
}

interface Category {
    id: string;
    nombre: string;
    slug: string;
}

export default function AdminBlog() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteToast, setShowDeleteToast] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Filter & View States
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Todas");
    const [tagFilter, setTagFilter] = useState("Todos");
    const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

    // Delete confirmation modal
    const [deleteTargetTitle, setDeleteTargetTitle] = useState<string | null>(null);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

    // Preview modal
    const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

    const { guard } = useActionGuard();

    // Load posts from Supabase
    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const empresaId = DEFAULT_EMPRESA_ID;
            
            // Load categories
            const catRes = await fetch(`/api/blog/categorias?empresa_id=${empresaId}`);
            const catData = await catRes.json();
            if (catData.success && catData.data) {
                setCategories(catData.data);
            }

            // Load posts
            const postsRes = await fetch(`/api/blog?empresa_id=${empresaId}`);
            const postsData = await postsRes.json();

            if (postsData.success && postsData.data) {
                setBlogs(postsData.data);
            } else {
                setBlogs([]);
            }
        } catch (err) {
            console.error('Error loading posts:', err);
            setError('Error al cargar los artículos');
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setMounted(true);
        loadPosts();

        if (typeof window !== 'undefined' && localStorage.getItem("blog_deleted_toast") === "true") {
            setShowDeleteToast(true);
            localStorage.removeItem("blog_deleted_toast");
            setTimeout(() => setShowDeleteToast(false), 3000);
        }
    }, [loadPosts]);

    const categoryNames = useMemo(() => {
        return ["Todas", ...categories.map(c => c.nombre)];
    }, [categories]);

    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        blogs.forEach(post => {
            post.tags?.forEach(tag => tagSet.add(tag.nombre));
        });
        return ["Todos", ...Array.from(tagSet)];
    }, [blogs]);

    const filteredBlogs = useMemo(() => {
        return blogs.filter(post => {
            const matchesSearch = post.titulo.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "Todas" || post.categoria?.nombre === categoryFilter;
            const matchesTag = tagFilter === "Todos" || post.tags?.some(t => t.nombre === tagFilter);
            return matchesSearch && matchesCategory && matchesTag;
        });
    }, [blogs, searchQuery, categoryFilter, tagFilter]);

    const deletePosts = async (ids: string[]) => {
        if (ids.length === 0) return;

        try {
            for (const id of ids) {
                await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
            }
            
            setBlogs(prev => prev.filter(b => !ids.includes(b.id)));
            setSelectedPosts([]);
            setShowDeleteToast(true);
            setTimeout(() => setShowDeleteToast(false), 3000);
        } catch (err) {
            console.error('Error deleting posts:', err);
            setError('Error al eliminar los artículos');
        }
    };

    const toggleSelectAll = () => {
        if (selectedPosts.length === filteredBlogs.length) {
            setSelectedPosts([]);
        } else {
            setSelectedPosts(filteredBlogs.map(b => b.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedPosts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatViews = (views: number) => {
        if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
        return views.toString();
    };

    const exportBlogCSV = () => {
        const BOM = '\uFEFF'
        const headers = '"Título","Slug","Categoría","Estado","Vistas","Premium","Fecha"\n'
        const rows = filteredBlogs.map((post) => {
            const titulo = '"' + (post.titulo || '').replace(/"/g, '""') + '"'
            const slug = '"' + (post.slug || '').replace(/"/g, '""') + '"'
            const categoria = '"' + (post.categoria?.nombre || '').replace(/"/g, '""') + '"'
            const estado = '"' + post.estado + '"'
            const vistas = '"' + post.vistas + '"'
            const premium = '"' + (post.es_premium ? 'Si (' + post.precio_coins + ' coins)' : 'No') + '"'
            const fecha = '"' + (post.creado_en ? new Date(post.creado_en).toLocaleDateString('es-ES') : '') + '"'
            return [titulo, slug, categoria, estado, vistas, premium, fecha].join(',')
        }).join('\n')
        const blob = new Blob([BOM + headers + rows], { type: 'text/csv;charset=utf-8' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'blog_' + new Date().toISOString().split('T')[0] + '.csv'
        a.click()
    }

    const confirmDelete = () => {
        if (!guard('blog', 'eliminar')) return;
        if (idsToDelete.length === 0) {
            setDeleteTargetTitle(null);
            return;
        }
        deletePosts(idsToDelete);
        setIdsToDelete([]);
        setDeleteTargetTitle(null);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
                    <p className="text-gray-400 text-sm font-medium">Cargando artículos...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <Trash className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-500 font-medium">{error}</p>
                    <button 
                        onClick={() => loadPosts()}
                        className="px-4 py-2 bg-white/10 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full mx-auto px-4 md:px-8 pt-8 md:pt-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                <div className="w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none sm:leading-tight">Blog & Editorial</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2 font-light max-w-xl">Redacta nuevos artículos o actualiza contenido existente.</p>
                </div>
                <Link href="/superadmin/blog/crear" className="bg-white text-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blis-red hover:text-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)] w-full sm:w-auto mt-4 sm:mt-0">
                    <Plus className="w-5 h-5" /> Redactar Artículo
                </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-6">
                    {/* Toolbar */}
                    <div className="bg-zinc-950 border border-white/5 p-4 rounded-3xl space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar por título..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blis-red/50 transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={exportBlogCSV} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-white/10 transition-colors">
                                    <Download className="w-3.5 h-3.5" /> Exportar CSV
                                </button>
                                <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
                                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}>
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}>
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                                    <button onClick={toggleSelectAll} className="w-5 h-5 rounded border border-white/20 flex items-center justify-center hover:border-blis-red transition-colors">
                                        {selectedPosts.length === filteredBlogs.length && filteredBlogs.length > 0 && (
                                            <div className="w-3 h-3 bg-blis-red rounded-[2px]" />
                                        )}
                                    </button>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        {selectedPosts.length > 0 ? `${selectedPosts.length} seleccionados` : "Seleccionar todo"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 relative z-50">
                                    <div className="relative">
                                        <button onClick={() => { setIsCategoryDropdownOpen(!isCategoryDropdownOpen); setIsTagDropdownOpen(false); }} className="flex items-center justify-between gap-2 min-w-[120px] bg-[#18181b] px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all text-[10px] font-black text-gray-300 uppercase tracking-widest shadow-xl">
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-3 h-3 text-gray-500" />
                                                {categoryFilter}
                                            </div>
                                        </button>
                                        <AnimatePresence>
                                            {isCategoryDropdownOpen && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }} className="absolute top-full left-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden min-w-[150px] p-2 flex flex-col gap-1 w-max z-50">
                                                    {categoryNames.map((c, idx) => (
                                                        <button key={idx} onClick={() => { setCategoryFilter(c); setIsCategoryDropdownOpen(false); }} className={`text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${categoryFilter === c ? 'bg-blis-red text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                                            {c}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="relative">
                                        <button onClick={() => { setIsTagDropdownOpen(!isTagDropdownOpen); setIsCategoryDropdownOpen(false); }} className="flex items-center justify-between gap-2 min-w-[120px] bg-[#18181b] px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all text-[10px] font-black text-gray-300 uppercase tracking-widest shadow-xl">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-3 h-3 text-gray-500" />
                                                {tagFilter}
                                            </div>
                                        </button>
                                        <AnimatePresence>
                                            {isTagDropdownOpen && (
                                                <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }} className="absolute top-full left-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden min-w-[150px] p-2 flex flex-col gap-1 w-max z-50 max-h-[300px] overflow-y-auto">
                                                    {allTags.map((t, idx) => (
                                                        <button key={idx} onClick={() => { setTagFilter(t); setIsTagDropdownOpen(false); }} className={`text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${tagFilter === t ? 'bg-blis-red text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                                            {t}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {(categoryFilter !== "Todas" || tagFilter !== "Todos" || searchQuery !== "") && (
                                        <button onClick={() => { setCategoryFilter("Todas"); setTagFilter("Todos"); setSearchQuery(""); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-lg">
                                            <X className="w-3 h-3" /> Limpiar Filtros
                                        </button>
                                    )}
                                </div>
                            </div>

                            {selectedPosts.length > 0 && (
                                <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdsToDelete([...selectedPosts]); setDeleteTargetTitle(`${selectedPosts.length} artículos seleccionados`); }} className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-500 transition-all text-[10px] font-black uppercase tracking-widest shadow-2xl relative z-10 cursor-pointer pointer-events-auto">
                                    <Trash className="w-3.5 h-3.5" /> Borrar masivamente
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Articles */}
                    {filteredBlogs.length === 0 ? (
                        <div className="bg-zinc-950 border border-white/5 rounded-3xl p-12 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Edit3 className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400 font-medium mb-2">No hay artículos</p>
                            <p className="text-gray-600 text-sm mb-6">Crea tu primer artículo para comenzar</p>
                            <Link href="/superadmin/blog/crear" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blis-red hover:text-white transition-all">
                                <Plus className="w-4 h-4" /> Crear Artículo
                            </Link>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                            {filteredBlogs.map((post, i) => (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: i * 0.05 }} key={post.id} className={`bg-zinc-950 border border-white/5 rounded-[1.5rem] overflow-hidden group hover:border-blis-red/30 transition-all relative ${viewMode === 'list' ? 'flex flex-row items-center p-3 gap-6' : 'flex flex-col'}`}>
                                    <div className={viewMode === 'grid' ? "aspect-video relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black" : "w-40 h-24 shrink-0 rounded-xl overflow-hidden relative bg-gradient-to-br from-zinc-900 to-black"}>
                                        {post.imagen_portada ? (
                                            <Image src={post.imagen_portada} alt={post.titulo} width={400} height={225} unoptimized className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center border border-white/5 border-dashed">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-1">
                                                    <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                                                </div>
                                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center italic">Sin Portada</p>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Link href={`/blog/articulo/${post.slug}`} target="_blank" className="p-2 bg-white text-black rounded-lg hover:bg-blis-red hover:text-white transition-all transform hover:scale-110 shadow-xl" onClick={(e) => e.stopPropagation()}><Eye className="w-4 h-4" /></Link>
                                            <Link href={`/superadmin/blog/crear?id=${post.id}`} className="p-2 bg-white text-black rounded-lg hover:bg-blis-red hover:text-white transition-all transform hover:scale-110 shadow-xl" onClick={(e) => e.stopPropagation()}><Edit3 className="w-4 h-4" /></Link>
                                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdsToDelete([post.id]); setDeleteTargetTitle(post.titulo); }} className="p-2.5 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all transform hover:scale-125 shadow-2xl relative z-20 cursor-pointer pointer-events-auto" title="Eliminar artículo">
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md border ${post.estado === 'publicado' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/20 text-amber-500 border-amber-500/20'}`}>
                                                {post.estado}
                                            </span>
                                            {post.contrasena && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-400 border border-purple-500/20 backdrop-blur-md" title="Protegido con contraseña">
                                                    <Lock className="w-2.5 h-2.5 inline" />
                                                </span>
                                            )}
                                            {post.visibilidad === 'oculto' && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest bg-gray-500/20 text-gray-400 border border-gray-500/20 backdrop-blur-md" title="Oculto de listados">
                                                    <EyeOff className="w-2.5 h-2.5 inline" />
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={viewMode === 'grid' ? "p-4 flex-1 flex flex-col" : "flex-1 py-1"}>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.2em]">{formatDate(post.creado_en)} • {post.categoria?.nombre || 'Sin categoría'}</span>
                                                <span className="text-[9px] text-emerald-500 font-black flex items-center gap-1"><Activity className="w-2.5 h-2.5" />{formatViews(post.vistas)}</span>
                                            </div>
                                            <h4 className={`text-white font-black uppercase tracking-tight group-hover:text-blis-red transition-colors line-clamp-2 ${viewMode === 'grid' ? 'text-[13px] leading-tight mb-4 min-h-[2.5rem]' : 'text-base'}`}>
                                                {post.titulo}
                                            </h4>
                                        </div>

                                        {viewMode === 'grid' && (
                                            <div className="pt-3 mt-auto border-t border-white/5 flex items-center justify-between gap-4">
                                                <div className="grid grid-cols-3 gap-2 flex-1">
                                                    <div className="text-center">
                                                        <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mb-0.5">Estado</p>
                                                        <p className="text-[10px] font-black text-white">{post.estado}</p>
                                                    </div>
                                                    <div className="text-center border-x border-white/5 px-2">
                                                        <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mb-0.5">Vistas</p>
                                                        <p className="text-[10px] font-black text-white">{formatViews(post.vistas)}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mb-0.5">Premium</p>
                                                        <p className="text-[10px] font-black text-white">{post.es_premium ? `${post.precio_coins} coins` : 'Gratis'}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => toggleSelect(post.id)} className={`w-6 h-6 flex-shrink-0 rounded-[0.4rem] border border-white/10 flex items-center justify-center transition-all shadow-md group-hover:border-white/30 ${selectedPosts.includes(post.id) ? 'bg-blis-red border-blis-red' : 'bg-transparent hover:bg-white/5'}`}>
                                                    {selectedPosts.includes(post.id) && <Check className="w-3.5 h-3.5 text-white" />}
                                                </button>
                                            </div>
                                        )}

                                        {viewMode === 'list' && (
                                            <div className="flex mt-auto pt-2 items-center justify-between border-t border-white/5 pb-1">
                                                <div className="flex gap-8 items-center">
                                                    <div className="flex gap-2 items-center">
                                                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Estado:</p>
                                                        <p className="text-[11px] font-black text-white">{post.estado}</p>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Vistas:</p>
                                                        <p className="text-[11px] font-black text-white">{formatViews(post.vistas)}</p>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <BarChart className="w-3.5 h-3.5 text-emerald-500" />
                                                    </div>
                                                </div>
                                                <button onClick={() => toggleSelect(post.id)} className={`w-6 h-6 flex-shrink-0 rounded-[0.4rem] border border-white/10 flex items-center justify-center transition-all shadow-xl ${selectedPosts.includes(post.id) ? 'bg-blis-red border-blis-red' : 'bg-black/40 hover:bg-white/5'}`}>
                                                    {selectedPosts.includes(post.id) && <Check className="w-3 h-3 text-white" />}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 h-fit">
                    <h2 className="text-lg font-bold text-white mb-6">Métricas Editoriales</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-sm text-gray-400 mb-1">Total Artículos</p>
                            <p className="text-2xl font-black text-white">{blogs.length}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-sm text-gray-400 mb-1">Publicados</p>
                            <p className="text-2xl font-black text-emerald-500">{blogs.filter(b => b.estado === 'publicado').length}</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-sm text-gray-400 mb-1">Borradores</p>
                            <p className="text-2xl font-black text-amber-500">{blogs.filter(b => b.estado === 'borrador').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            <AnimatePresence>
                {deleteTargetTitle && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-default" onClick={() => setDeleteTargetTitle(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-zinc-950 border-2 border-red-500/30 rounded-[2.5rem] p-10 w-full max-w-sm shadow-[0_0_80px_rgba(239,68,68,0.25)] text-center space-y-8 relative overflow-hidden pointer-events-auto">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/10 blur-[60px] rounded-full pointer-events-none" />
                            <div className="mx-auto w-20 h-20 bg-red-600/10 border-2 border-red-600/20 rounded-full flex items-center justify-center relative z-10 text-red-600 animate-pulse">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-3 relative z-10">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">¿Confirmar Eliminación?</h3>
                                <p className="text-[11px] font-bold text-gray-400 tracking-[0.15em] uppercase px-2 leading-relaxed line-clamp-2">
                                    &quot;{deleteTargetTitle}&quot;
                                </p>
                                <p className="text-[9px] text-red-500/70 font-black uppercase tracking-widest pt-2">Esta acción es irreversible y permanente.</p>
                            </div>
                            <div className="flex gap-4 relative z-10 w-full pt-6 border-t border-white/5">
                                <button onClick={() => setDeleteTargetTitle(null)} className="flex-1 py-4.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest transition-all border border-white/10 cursor-pointer pointer-events-auto">
                                    Mantener
                                </button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmDelete(); }} className="flex-1 py-4.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(239,68,68,0.3)] cursor-pointer pointer-events-auto">
                                    Sí, Eliminar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete toast */}
            <AnimatePresence>
                {showDeleteToast && (
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed bottom-10 right-10 bg-red-500/20 border border-red-500/30 backdrop-blur-md text-red-500 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)] z-[600] flex items-center gap-3">
                        <Trash2 className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Artículo Eliminado</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
