"use client";

import { Bell, Search, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export function MiembrosHeader() {
    const { user } = useAuth();
    const isAdmin = user?.role ? ['superadmin', 'admin', 'editor'].includes(user.role) : false;
    const profileHref = isAdmin ? "/superadmin/perfil" : "/miembros/perfil";

    return (
        <header className="h-24 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar mis cursos, contratos..."
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blis-red focus:bg-white/10 transition-all placeholder:text-gray-600"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">2,450 BLISCOINS</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative text-gray-400 hover:text-white transition-colors p-2">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-blis-red rounded-full shadow-[0_0_10px_rgba(190,11,60,1)]"></span>
                    </button>

                    <button className="relative text-gray-400 hover:text-white transition-colors p-2">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-blis-red rounded-full shadow-[0_0_10px_rgba(190,11,60,1)]"></span>
                    </button>
                </div>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-white uppercase tracking-tight">{user?.name || "Cargando..."}</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {isAdmin ? 'SUPERADMIN' : 'MIEMBRO GOLD'}
                        </p>
                    </div>
                    <Link href={profileHref}>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blis-red to-red-900 border border-white/20 p-0.5 shadow-lg overflow-hidden group cursor-pointer transition-transform hover:scale-105 active:scale-95">
                            <div className="w-full h-full rounded-[14px] overflow-hidden bg-black/40 flex items-center justify-center text-white font-black text-lg">
                                {user?.profilePic ? (
                                    <img src={user.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    (user?.name || "K").charAt(0)
                                )}
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
