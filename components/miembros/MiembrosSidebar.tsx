"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingBag,
    BookOpen,
    Video,
    FileText,
    CreditCard,
    UserCircle,
    LogOut,
    HelpCircle,
    ChevronLeft,
    Award,
    Users,
    Wrench
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export function MiembrosSidebar() {
    const [isLockedOpen, setIsLockedOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(64);
    const pathname = usePathname();
    const { user } = useAuth();
    const isAdmin = user?.role ? ['superadmin', 'admin', 'editor'].includes(user.role) : false;

    const isExpanded = isLockedOpen || isHovered;

    useEffect(() => {
        const handleResize = () => {
            setSidebarWidth(window.innerWidth < 768 ? 56 : 64);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuGroups = [
        {
            title: "Tus Adquisiciones",
            items: [
                { icon: LayoutDashboard, label: "Mi Resumen", href: "/miembros" },
                { icon: ShoppingBag, label: "Tienda", href: "/tienda" },
                { icon: Video, label: "Mis Cursos", href: "/miembros/academia" },
                { icon: FileText, label: "Mis Contratos", href: "/miembros/contratos" },
                { icon: Award, label: "Mis Certificados", href: "/miembros/certificados" },
            ]
        },
        {
            separator: true,
            items: [
                { icon: Users, label: "Comunidad", href: "/miembros/comunidad" },
            ]
        },
        {
            separator: true,
            items: [
                { icon: BookOpen, label: "Biblioteca Digital", href: "/miembros/biblioteca" },
            ]
        },
        {
            separator: true,
            items: [
                { icon: Wrench, label: "Herramientas", href: "/miembros/herramientas" },
            ]
        },
        {
            separator: true,
            items: [
                { icon: UserCircle, label: "Mi Cuenta", href: isAdmin ? "/superadmin/perfil" : "/miembros/perfil" },
                { icon: CreditCard, label: "Mi Facturación", href: "/miembros/facturacion" },
            ]
        }
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isExpanded ? 240 : sidebarWidth }}
            className="flex flex-col bg-black border-r border-white/5 h-[calc(100vh-80px)] relative left-0 top-0 z-10 overflow-hidden flex-shrink-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`pt-4 pb-2 px-4 flex items-center ${!isExpanded ? 'justify-center px-0' : 'justify-between'}`}>
                {isExpanded && (
                    <div className="flex items-center gap-2 px-2">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-black text-white tracking-widest whitespace-nowrap"
                        >
                            ÁREA DE MIEMBROS
                        </motion.span>
                    </div>
                )}
                <button
                    onClick={() => setIsLockedOpen(!isLockedOpen)}
                    className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors"
                >
                    <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${!isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            <nav className="flex-1 px-2 md:px-3 space-y-6 overflow-y-auto scrollbar-hide">
                {menuGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-1">
                        {isExpanded && group.title && (
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4 px-4">{group.title}</p>
                        )}
                        {group.separator && !isExpanded && (
                            <div className="h-px bg-white/5 mx-2 my-4" />
                        )}
                        {group.items.map((item, i) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group font-medium relative ${active
                                        ? "text-white bg-white/5 shadow-inner"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        } ${!isExpanded ? 'justify-center px-0' : ''}`}
                                    title={!isExpanded ? item.label : ""}
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="sidebar-active-indicator"
                                            className="absolute left-0 w-1 h-6 bg-blis-red rounded-full"
                                        />
                                    )}
                                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-blis-red" : "group-hover:text-blis-red"}`} />
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="tracking-wide text-[13px] whitespace-nowrap"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            );
                        })}
                    </div>
                ))}

                <div className="pt-4 border-t border-white/5">
                    {isExpanded && <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4 px-4">Soporte</p>}
                    <Link
                        href="/miembros/help"
                        className={`flex items-center gap-4 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group font-medium ${!isExpanded ? 'justify-center' : ''}`}
                    >
                        <HelpCircle className="w-5 h-5 flex-shrink-0 group-hover:text-blis-red transition-colors" />
                        {isExpanded && <span className="tracking-wide text-[13px] whitespace-nowrap">Ayuda Directa</span>}
                    </Link>
                </div>
            </nav>

            <div className="p-3 border-t border-white/5 mt-auto bg-zinc-950/20">
                <button className={`flex items-center gap-4 px-3 py-3 w-full text-gray-400 hover:text-blis-red hover:bg-blis-red/10 rounded-xl transition-all font-medium ${!isExpanded ? 'justify-center' : ''}`}>
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span className="tracking-wide text-[13px] whitespace-nowrap">Salir del Portal</span>}
                </button>
            </div>
        </motion.aside>
    );
}
