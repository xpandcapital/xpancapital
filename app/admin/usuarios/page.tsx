"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Users, Search, Mail, Coins, 
    Calendar, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface UserProfile {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    rol: string;
    blis_coins: number;
    total_referidos: number;
    creado_en: string;
    ultimo_acceso?: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 20;

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: perPage.toString(),
                search: search
            });
            
            const response = await fetch(`/api/admin/users?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setUsers(data.data);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        user.apellido?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase">Usuarios</h1>
                        <p className="text-gray-400 text-sm">Gestiona los usuarios de la plataforma</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar usuarios..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-blis-red transition-colors w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Users Table */}
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
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Usuario</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Email</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Rol</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Coins</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Referidos</th>
                                        <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Registrado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10">
                                                        <span className="text-sm font-bold text-white">
                                                            {(user.nombre?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {user.nombre || ''} {user.apellido || ''}
                                                        </p>
                                                        {user.telefono && (
                                                            <p className="text-xs text-gray-500">{user.telefono}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-300">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                                    user.rol === 'admin' 
                                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {user.rol || 'user'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Coins className="w-4 h-4 text-amber-500" />
                                                    <span className="text-sm font-bold text-white">
                                                        {user.blis_coins?.toLocaleString() || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-sm text-white">
                                                        {user.total_referidos || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-400">
                                                        {new Date(user.creado_en).toLocaleDateString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && users.length > 0 && (
                        <div className="flex items-center justify-between p-4 border-t border-white/5">
                            <p className="text-sm text-gray-500">
                                Mostrando {filteredUsers.length} de {users.length} usuarios
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-gray-400 px-3">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}