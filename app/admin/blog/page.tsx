"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    FileText, Plus, Search, Edit, Trash2, 
    Loader2, Calendar, User, Eye as EyeIcon
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/Toast";

interface BlogPost {
    id: string;
    titulo: string;
    slug: string;
    extracto?: string;
    estado: string;
    es_premium: boolean;
    precio_coins?: number;
    vistas: number;
    creado_en: string;
    publicado_en?: string;
    categoria?: { nombre: string };
    autor?: { nombre: string; apellido: string };
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { showToast } = useToast();

    useEffect(() => {
        fetchPosts();
    }, [statusFilter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let url = '/api/blog';
            if (statusFilter !== 'all') {
                url += `?estado=${statusFilter}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                setPosts(data.data || []);
            }
        } catch {
            showToast('Error al cargar posts', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este post?')) return;
        
        try {
            const response = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
            const data = await response.json();
            
            if (data.success) {
                showToast('Post eliminado', 'success');
                fetchPosts();
            } else {
                showToast(data.error || 'Error al eliminar', 'error');
            }
        } catch {
            showToast('Error al eliminar', 'error');
        }
    };

    const handleTogglePremium = async (post: BlogPost) => {
        try {
            const response = await fetch('/api/blog', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: post.id,
                    es_premium: !post.es_premium
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast(`Post ${!post.es_premium ? 'marcado como premium' : 'removido de premium'}`, 'success');
                fetchPosts();
            }
        } catch {
            showToast('Error al actualizar', 'error');
        }
    };

    const handleToggleStatus = async (post: BlogPost) => {
        const newStatus = post.estado === 'publicado' ? 'borrador' : 'publicado';
        
        try {
            const response = await fetch('/api/blog', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: post.id,
                    estado: newStatus
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast(`Post ${newStatus === 'publicado' ? 'publicado' : 'pasó a borrador'}`, 'success');
                fetchPosts();
            }
        } catch {
            showToast('Error al actualizar', 'error');
        }
    };

    const filteredPosts = posts.filter(p => 
        p.titulo.toLowerCase().includes(search.toLowerCase()) ||
        p.extracto?.toLowerCase().includes(search.toLowerCase())
    );

    const estadoColors: Record<string, string> = {
        publicado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        borrador: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        archivado: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase">Blog Posts</h1>
                        <p className="text-gray-400 text-sm">Gestiona los artículos del blog</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar posts..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-blis-red transition-colors w-64"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-blis-red transition-colors"
                        >
                            <option value="all">Todos</option>
                            <option value="publicado">Publicados</option>
                            <option value="borrador">Borradores</option>
                            <option value="archivado">Archivados</option>
                        </select>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-blis-red text-white font-bold text-sm rounded-xl hover:bg-blis-red/80 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Post
                        </button>
                    </div>
                </div>

                {/* Posts Table */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Post</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Categoría</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Estado</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Vistas</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Premium</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Fecha</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPosts.map((post) => (
                                        <motion.tr
                                            key={post.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="max-w-xs">
                                                    <p className="font-medium text-white line-clamp-1">{post.titulo}</p>
                                                    {post.extracto && (
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.extracto}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-gray-300">
                                                    {post.categoria?.nombre || 'Sin categoría'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleToggleStatus(post)}
                                                    className={`text-xs px-3 py-1 rounded-lg font-bold border transition-colors ${
                                                        estadoColors[post.estado] || estadoColors.borrador
                                                    }`}
                                                >
                                                    {post.estado}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <EyeIcon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-white">{post.vistas || 0}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleTogglePremium(post)}
                                                    className={`text-xs px-3 py-1 rounded-lg font-bold border transition-colors ${
                                                        post.es_premium
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                            : 'bg-zinc-800 text-gray-400 border-zinc-700'
                                                    }`}
                                                >
                                                    {post.es_premium ? `${post.precio_coins || 0} coins` : 'Gratis'}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-gray-500" />
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(post.creado_en).toLocaleDateString('es-ES', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {post.autor && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-3 h-3 text-gray-500" />
                                                            <span className="text-xs text-gray-500">
                                                                {post.autor.nombre} {post.autor.apellido}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && filteredPosts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FileText className="w-12 h-12 text-gray-600 mb-4" />
                            <p className="text-gray-400">No hay posts</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}