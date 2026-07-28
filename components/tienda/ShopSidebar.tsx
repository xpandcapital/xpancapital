"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_CONFIG } from "@/lib/auth/permissions";
import {
    ShoppingBag,
    Briefcase,
    FileText,
    BookOpen,
    Users,
    Wallet,
    HelpCircle,
    Settings,
    Star,
    GraduationCap,
    ShoppingCart,
    Heart,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

const categories = [
    { name: "Cursos Xpand", id: "cursos", icon: GraduationCap },
];

const bottomNav: { name: string; href: string; icon: any }[] = [];

export function ShopSidebar() {
    const { user } = useAuth();
    const [activeId, setActiveId] = useState<string>("");
    const { getCartCount, favorites, openCart } = useShop();
    const [sidebarBottom, setSidebarBottom] = useState("0px");

    // Ajustar el bottom del sidebar según la posición del footer
    useEffect(() => {
        const updateBottom = () => {
            const footer = document.getElementById("footer");
            if (!footer) return;
            const footerRect = footer.getBoundingClientRect();
            const windowH = window.innerHeight;
            if (footerRect.top < windowH) {
                // Footer visible — el sidebar sube para no tapar el footer
                setSidebarBottom(`${windowH - footerRect.top}px`);
            } else {
                setSidebarBottom("0px");
            }
        };
        updateBottom();
        window.addEventListener("scroll", updateBottom, { passive: true });
        window.addEventListener("resize", updateBottom, { passive: true });
        return () => {
            window.removeEventListener("scroll", updateBottom);
            window.removeEventListener("resize", updateBottom);
        };
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-30% 0px -30% 0px", threshold: 0 }
        );

        // Observar header + todas las categorías
        ["shop-hero", ...categories.map(c => c.id)].forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        // Fallback: si estamos muy arriba de la página,
        // forzamos que el logo sea el activo
        const onScrollCheck = () => {
            if (window.scrollY < 300) {
                setActiveId("shop-hero");
            }
        };
        window.addEventListener("scroll", onScrollCheck, { passive: true });
        // Ejecutar al montar por si empieza arriba
        onScrollCheck();

        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", onScrollCheck);
        };
    }, []);

    const handleScroll = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        // 150px: el título aparece más centrado y la sección llena el viewport
        // sin que se cuele el título de la siguiente sección
        const top = el.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo({ top, behavior: "smooth" });
    };

    return (
        <aside
            className="fixed left-0 top-28 w-64 bg-black/90 backdrop-blur-2xl border-r border-white/5 flex flex-col z-[40] hidden md:flex"
            style={{ bottom: sidebarBottom }}
        >
            <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide space-y-8">
                {/* Logo Area interno */}
                <div className="flex items-center px-4 mb-4">
                    <Link
                        href="/tienda"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center gap-2 group w-full"
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${activeId === 'shop-hero' || activeId === ''
                            ? 'bg-blis-red shadow-[0_0_20px_rgba(213,193,8,0.8)]'
                            : 'bg-blis-red shadow-[0_0_15px_rgba(213,193,8,0.5)] group-hover:shadow-[0_0_20px_rgba(213,193,8,0.8)]'
                            }`}>
                            <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <span className={`font-black tracking-widest uppercase text-sm transition-colors duration-300 ${activeId === 'shop-hero' || activeId === ''
                            ? 'text-blis-red drop-shadow-[0_0_8px_rgba(213,193,8,0.6)]'
                            : 'text-white group-hover:text-blis-red'
                            }`}>
                            Xpand<span className={activeId === 'shop-hero' || activeId === '' ? 'text-white' : 'text-gray-500'}>Capital</span>
                        </span>
                        {/* Línea neon degradada - igual al h1 de la página */}
                        <div className="min-w-[24px] flex-1 h-[2px] ml-3 rounded-full bg-gradient-to-r from-blis-red to-transparent opacity-80" />
                    </Link>
                </div>

                <div className="h-px w-full bg-white/5 mb-6" />

                {/* Categories */}
                <div>
                    <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Categorías
                    </h3>
                    <div className="space-y-1">
                        {categories.map((item) => {
                            const isActive = activeId === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleScroll(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative group text-left ${isActive
                                        ? "bg-blis-red/10 text-blis-red"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {/* Indicador barra izquierda activa */}
                                    {isActive && (
                                        <motion.span
                                            layoutId="sidebar-active-bar"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blis-red rounded-r-full shadow-[0_0_8px_rgba(213,193,8,0.8)]"
                                        />
                                    )}
                                    <item.icon
                                        className={`w-4 h-4 transition-all duration-300 ${isActive
                                            ? "text-blis-red drop-shadow-[0_0_6px_rgba(213,193,8,0.8)]"
                                            : "group-hover:text-blis-red"
                                            }`}
                                    />
                                    <span
                                        className={`font-medium text-sm transition-all duration-300 ${isActive ? "font-bold drop-shadow-[0_0_4px_rgba(213,193,8,0.5)]" : ""
                                            }`}
                                    >
                                        {item.name}
                                    </span>
                                    {isActive && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blis-red animate-pulse shadow-[0_0_6px_rgba(213,193,8,0.9)]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Tools */}
                <div>
                    <div className="h-px w-full bg-white/5 mb-4" />
                    <div className="space-y-1">
                        {bottomNav.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                            >
                                <item.icon className="w-4 h-4 group-hover:text-blis-red transition-colors" />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Carrito y Favoritos */}
            <div className="px-4 pb-3 flex gap-2">
                <button
                    onClick={openCart}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blis-red/10 border border-blis-red/20 text-blis-red hover:bg-blis-red hover:text-white transition-all text-[11px] font-black uppercase tracking-wider relative"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Carrito
                    {getCartCount() > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blis-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-black">
                            {getCartCount()}
                        </span>
                    )}
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all relative">
                    <Heart className="w-4 h-4" />
                    {favorites.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-pink-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-black">
                            {favorites.length}
                        </span>
                    )}
                </button>
            </div>

            {/* User Area Footer */}
            <div className="p-4 border-t border-white/5">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blis-red to-black border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-black text-sm">
                                {(user?.name || '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">
                            {(() => {
                                const hour = new Date().getHours()
                                const greeting = hour < 12 ? 'Buen día' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
                                return `${greeting}, ${user?.name?.split(' ')[0] || 'Usuario'}`
                            })()}
                        </p>
                        <p className="text-xs flex items-center gap-1 font-mono text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {ROLE_CONFIG[user?.role || 'usuario']?.label || 'Miembro'}
                        </p>
                    </div>
                </button>
            </div>
        </aside>
    );
}

