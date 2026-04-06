"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, FileText, Image as ImageIcon,
    Settings, LogOut, Activity, UserCircle, ShoppingBag,
    Coins, ChevronLeft, Menu, X, GraduationCap, Award, Cloud,
    ShoppingCart, Boxes, CandlestickChart, Scale, BarChart3,
    Building2, UsersRound, FolderOpen, ChevronRight, Wrench,
    FileSignature, TrendingUp, Layout, Shield, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

type SubItem = {
    icon: React.ComponentType<LucideProps>;
    label: string;
    href: string;
};

type NavItem = {
    icon: React.ComponentType<LucideProps>;
    label: string;
    href?: string;
    subItems?: SubItem[];
};

type Section = {
    title: string;
    items: NavItem[];
};

export function SuperadminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(64);
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [hoveredSection, setHoveredSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const isSectionExpanded = (sectionLabel: string) => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (isMobile) {
            return expandedSections[sectionLabel];
        }
        return expandedSections[sectionLabel] || hoveredSection === sectionLabel;
    };

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            setSidebarWidth(isMobile ? 56 : 64);
            const w = isCollapsed ? (isMobile ? '56px' : '64px') : '260px';
            document.documentElement.style.setProperty('--sidebar-width', w);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isCollapsed]);

    useEffect(() => {
        const initialExpanded: Record<string, boolean> = {};
        sections.forEach(section => {
            section.items.forEach(item => {
                if (item.subItems) {
                    const hasActiveChild = item.subItems.some(sub => pathname === sub.href);
                    if (hasActiveChild) {
                        initialExpanded[item.label] = true;
                    }
                }
            });
        });
        setExpandedSections(initialExpanded);
    }, [pathname]);

    const sections: Section[] = [
        {
            title: "Principal",
            items: [
                { icon: LayoutDashboard, label: "Dashboard", href: "/superadmin" },
                { 
                    icon: Building2, 
                    label: "Proyectos", 
                    subItems: [
                        { icon: Building2, label: "Todos los Proyectos", href: "/superadmin/proyectos" },
                        { icon: FolderOpen, label: "Gestión de Lotes", href: "/superadmin/gestion-lotes/_none_" },
                        { icon: FileSignature, label: "Contratos", href: "/superadmin/contratos" },
                        { icon: UsersRound, label: "Asesores", href: "/superadmin/asesores" },
                    ]
                },
            ]
        },
        {
            title: "Ventas",
            items: [
                { 
                    icon: ShoppingCart, 
                    label: "Punto de Venta", 
                    subItems: [
                        { icon: ShoppingCart, label: "Terminal POS", href: "/superadmin/pos" },
                        { icon: ShoppingBag, label: "Productos", href: "/superadmin/productos" },
                        { icon: Coins, label: "Clientes", href: "/superadmin/clientes" },
                        { icon: Settings, label: "Ajustes del Comercio", href: "/superadmin/ajustes/comercio" },
                    ]
                },
                { 
                    icon: GraduationCap, 
                    label: "Academia", 
                    subItems: [
                        { icon: GraduationCap, label: "Cursos", href: "/superadmin/cursos" },
                        { icon: Award, label: "Certificados", href: "/superadmin/certificados" },
                    ]
                },
                { 
                    icon: TrendingUp, 
                    label: "Trading", 
                    href: "/superadmin/trading" 
                },
]
        },
        {
            title: "Contenido",
            items: [
                { 
                    icon: Layout, 
                    label: "Páginas", 
                    subItems: [
                        { icon: Layout, label: "Todas las Páginas", href: "/superadmin/templates" },
                    ]
                },
                { 
                    icon: Mail, 
                    label: "Correos", 
                    href: "/superadmin/mails" 
                },
                { 
                    icon: FileText, 
                    label: "Blog", 
                    subItems: [
                        { icon: FileText, label: "Entradas", href: "/superadmin/blog" },
                        { icon: ImageIcon, label: "Rutas", href: "/superadmin/blog/rutas" },
                    ]
                },
            ]
        },
        {
            title: "Sistema",
            items: [
                { icon: Users, label: "Personal", href: "/superadmin/usuarios" },
                { icon: Wrench, label: "Utilidades", href: "/superadmin/utilidades" },
                { 
                    icon: Settings, 
                    label: "Configuración", 
                    subItems: [
                        { icon: Cloud, label: "APIs y Nube", href: "/superadmin/api-nube" },
                        { icon: Activity, label: "Métricas y SEO", href: "/superadmin/analiticas" },
                        { icon: ShoppingCart, label: "Comercio", href: "/superadmin/ajustes/comercio" },
                        { icon: Shield, label: "Roles y Niveles", href: "/superadmin/ajustes/roles" },
                        { icon: Building2, label: "Empresas", href: "/superadmin/ajustes/empresas" },
                    ]
                },
                { icon: UserCircle, label: "Mi Perfil", href: "/superadmin/perfil" },
            ]
        }
    ];

    return (
        <>
            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? sidebarWidth : 260,
                }}
                className="flex flex-col bg-zinc-950 border-r border-white/5 h-[calc(100vh-80px)] md:h-full fixed md:relative left-0 top-[80px] md:top-0 z-[999] overflow-hidden shadow-[15px_0_40px_rgba(0,0,0,0.8)] flex-shrink-0"
                style={{ pointerEvents: 'auto' }}
            >
                <div className={`pt-6 pb-4 px-4 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-xl font-black text-white tracking-widest px-2 whitespace-nowrap"
                            >
                                BLIS<span className="text-blis-red">CORP</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors ${isCollapsed ? 'hover:text-blis-red' : ''}`}
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="flex-1 px-3 space-y-6 overflow-y-auto scrollbar-hide py-4">
                    {sections.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            {!isCollapsed && (
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-3 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3"
                                >
                                    {section.title}
                                </motion.h3>
                            )}
                            {isCollapsed && (
                                <div className="h-px bg-white/5 mx-2 my-4" />
                            )}
                            <div className="space-y-1">
                                {section.items.map((item, i) => {
                                    const typedItem = item as NavItem;
                                    if (typedItem.subItems) {
                                        const hasActiveChild = typedItem.subItems.some(sub => pathname === sub.href);
                                        const expanded = isSectionExpanded(typedItem.label);
                                        return (
                                            <div 
                                                key={i}
                                                onMouseEnter={() => {
                                                    if (typeof window !== 'undefined' && window.innerWidth >= 768 && isCollapsed) {
                                                        setHoveredSection(typedItem.label);
                                                    }
                                                }}
                                                onMouseLeave={() => setHoveredSection(null)}
                                            >
                                                <button
                                                    onClick={() => toggleSection(typedItem.label)}
                                                    className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group font-medium relative ${hasActiveChild
                                                        ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                                                    title={isCollapsed ? typedItem.label : ""}
                                                >
                                                    <typedItem.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${hasActiveChild ? 'text-white' : 'group-hover:text-blis-red'}`} />
                                                    <AnimatePresence>
                                                        {!isCollapsed && (
                                                            <motion.span
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -10 }}
                                                                className="tracking-wide text-[13px] whitespace-nowrap flex-1 text-left"
                                                            >
                                                                {typedItem.label}
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                    <AnimatePresence>
                                                        {!isCollapsed && (
                                                            <motion.span
                                                                initial={{ opacity: 0, rotate: 0 }}
                                                                animate={{ opacity: 1, rotate: expandedSections[typedItem.label] ? 90 : 0 }}
                                                                exit={{ opacity: 0, rotate: 0 }}
                                                                className="text-[10px] ml-auto"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </button>
                                                <AnimatePresence>
                                                    {expanded && !isCollapsed && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden ml-4 pl-4 border-l border-white/10 mt-1 space-y-1"
                                                        >
                                                            {typedItem.subItems.map((subItem: SubItem, subIdx: number) => {
                                                                const isActive = pathname === subItem.href;
                                                                return (
                                                                    <Link
                                                                        key={subIdx}
                                                                        href={subItem.href}
                                                                        onClick={() => window.innerWidth < 1024 && setIsCollapsed(true)}
                                                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group font-medium relative ${isActive
                                                                            ? 'bg-white/10 text-white'
                                                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                                            }`}
                                                                    >
                                                                        <subItem.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-blis-red' : 'group-hover:text-blis-red'}`} />
                                                                        <span className="tracking-wide text-[12px] whitespace-nowrap">
                                                                            {subItem.label}
                                                                        </span>
                                                                        {isActive && (
                                                                            <motion.div
                                                                                layoutId="active-indicator-sub"
                                                                                className="absolute left-0 w-1 h-4 bg-blis-red rounded-r-full"
                                                                            />
                                                                        )}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    }
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={i}
                                            href={item.href!}
                                            onClick={() => window.innerWidth < 1024 && setIsCollapsed(true)}
                                            className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group font-medium relative ${isActive
                                                ? 'bg-blis-red text-white shadow-lg shadow-blis-red/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                                            title={isCollapsed ? item.label : ""}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-blis-red'}`} />
                                            <AnimatePresence>
                                                {!isCollapsed && (
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
                                            {isActive && !isCollapsed && (
                                                <motion.div
                                                    layoutId="active-indicator"
                                                    className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

            </motion.aside>
        </>
    );
}