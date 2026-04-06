"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Users, FileText, Package, Settings,
    ChevronLeft, ChevronRight, LogOut, Bell, Search,
    TrendingUp, ShoppingCart, Coins, MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/blog", label: "Blog", icon: FileText },
    { href: "/admin/productos", label: "Productos", icon: Package },
    { href: "/admin/compras", label: "Compras", icon: ShoppingCart },
    { href: "/admin/comentarios", label: "Comentarios", icon: MessageSquare },
    { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 80 : 240 }}
                className="fixed left-0 top-0 h-screen bg-zinc-900 border-r border-white/5 flex flex-col z-50"
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-black text-xl uppercase tracking-tighter"
                            >
                                <span className="text-white">BLIS</span>
                                <span className="text-blis-red">Admin</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                    isActive
                                        ? 'bg-blis-red text-white'
                                        : 'hover:bg-white/5 text-gray-400 hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <AnimatePresence mode="wait">
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-sm font-medium whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-8 h-8 bg-blis-red rounded-full flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-white">
                                {(user?.name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
                            </span>
                        </div>
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 min-w-0"
                                >
                                    <p className="text-sm font-medium text-white truncate">
                                        {user?.name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user?.email || 'admin@blis.com'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 ml-[80px] lg:ml-[240px] transition-all" style={{ marginLeft: collapsed ? 80 : 240 }}>
                {/* Top Bar */}
                <header className="sticky top-0 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold text-white">
                            {menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-blis-red rounded-full" />
                        </button>
                        <button
                            onClick={() => logout && logout()}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium hidden sm:inline">Cerrar sesión</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;