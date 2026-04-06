"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Users, FileText, Package, ShoppingCart, TrendingUp, 
    Coins, Eye, Calendar, ArrowUp, Loader2
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface Stats {
    totalUsers: number;
    totalPosts: number;
    publishedPosts: number;
    totalProducts: number;
    totalPurchases: number;
    totalRevenue: number;
    totalCoins: number;
    totalReferrals: number;
    recentUsers: number;
    recentPosts: number;
    topPosts: Array<{ id: string; titulo: string; vistas: number }>;
    topUsers: Array<{ id: string; nombre: string; blis_coins: number }>;
    viewsByDay: Record<string, number>;
    purchasesByDay: Record<string, number>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                
                if (data.success) {
                    setStats(data.data);
                } else {
                    setError(data.error || 'Error al cargar estadísticas');
                }
            } catch {
                setError('Error de conexión');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Usuarios', value: stats?.totalUsers || 0, icon: Users, change: stats?.recentUsers, color: 'blue' },
        { label: 'Posts', value: stats?.totalPosts || 0, icon: FileText, change: stats?.recentPosts, color: 'emerald' },
        { label: 'Productos', value: stats?.totalProducts || 0, icon: Package, color: 'amber' },
        { label: 'Compras', value: stats?.totalPurchases || 0, icon: ShoppingCart, color: 'purple' },
        { label: 'Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'green' },
        { label: 'Coins Circulando', value: (stats?.totalCoins || 0).toLocaleString(), icon: Coins, color: 'yellow' },
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <p className="text-red-400">{error}</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        const colorClasses: Record<string, string> = {
                            blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                            emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                            amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                            purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                            green: 'bg-green-500/10 text-green-500 border-green-500/20',
                            yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                        };
                        
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-zinc-900 border border-white/5 rounded-2xl p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClasses[stat.color]}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    {stat.change !== undefined && stat.change > 0 && (
                                        <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                                            <ArrowUp className="w-3 h-3" />
                                            {stat.change}
                                        </span>
                                    )}
                                </div>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Posts */}
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-emerald-500" />
                            Posts Más Leídos
                        </h2>
                        <div className="space-y-3">
                            {stats?.topPosts?.map((post, i) => (
                                <div key={post.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-gray-500">#{i + 1}</span>
                                        <span className="text-sm font-medium text-white line-clamp-1">{post.titulo}</span>
                                    </div>
                                    <span className="text-sm font-bold text-emerald-500">{post.vistas || 0} vistas</span>
                                </div>
                            ))}
                            {(!stats?.topPosts || stats.topPosts.length === 0) && (
                                <p className="text-gray-500 text-center py-4">No hay posts aún</p>
                            )}
                        </div>
                    </div>

                    {/* Top Users */}
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Coins className="w-5 h-5 text-amber-500" />
                            Usuarios con Más Coins
                        </h2>
                        <div className="space-y-3">
                            {stats?.topUsers?.map((user, i) => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-gray-500">#{i + 1}</span>
                                        <span className="text-sm font-medium text-white">{user.nombre || 'Usuario'}</span>
                                    </div>
                                    <span className="text-sm font-bold text-amber-500">{user.blis_coins?.toLocaleString() || 0} coins</span>
                                </div>
                            ))}
                            {(!stats?.topUsers || stats.topUsers.length === 0) && (
                                <p className="text-gray-500 text-center py-4">No hay usuarios aún</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Monthly Views Chart */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Vistas del Último Mes
                    </h2>
                    <div className="h-48 flex items-end gap-1">
                        {Object.entries(stats?.viewsByDay || {}).slice(-30).map(([day, views]) => {
                            const maxViews = Math.max(...Object.values(stats?.viewsByDay || {}));
                            const height = maxViews > 0 ? (views / maxViews) * 100 : 0;
                            
                            return (
                                <div
                                    key={day}
                                    className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t transition-colors cursor-pointer group"
                                    style={{ height: `${Math.max(height, 2)}%` }}
                                    title={`${day}: ${views} vistas`}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                        {views} vistas
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>30 días atrás</span>
                        <span>Hoy</span>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-blis-red/10 to-blis-red/5 border border-blis-red/20 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Resumen</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-3xl font-black text-white">{stats?.publishedPosts || 0}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Posts Publicados</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{stats?.totalReferrals || 0}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Referidos</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">
                                {Object.values(stats?.viewsByDay || {}).reduce((a, b) => a + b, 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Vistas Totales</p>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white">{stats?.totalPurchases || 0}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Compras</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}