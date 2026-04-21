"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, FileText, Image as ImageIcon,
    Settings, LogOut, Activity, UserCircle, ShoppingBag,
    Coins, ChevronLeft, Menu, X, GraduationCap, Award, Cloud,
    ShoppingCart, Boxes, CandlestickChart, Scale, BarChart3,
    Building2, UsersRound, FolderOpen, ChevronRight, Wrench,
    FileSignature, TrendingUp, Layout, Shield, Mail, UserPlus, Briefcase,
    CalendarDays, Megaphone, ClipboardList, BookOpenCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { SECTION_PERMISSIONS } from "@/lib/auth/permissions";
import { CompanySwitcher } from "./CompanySwitcher";

const permissionToSections: Record<string, string[]> = {}
Object.entries(SECTION_PERMISSIONS).forEach(([section, perm]) => {
    if (!permissionToSections[perm]) permissionToSections[perm] = []
    permissionToSections[perm].push(section)
})

function getSectionsFromPermission(permission: string): string[] {
    return permissionToSections[permission] || []
}

type SubItem = {
    icon: React.ComponentType<LucideProps>;
    label: string;
    href: string;
    permission?: string;
};

type NavItem = {
    icon: React.ComponentType<LucideProps>;
    label: string;
    href?: string;
    subItems?: SubItem[];
    permission?: string;
};

type Section = {
    title: string;
    items: NavItem[];
};

export function SuperadminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(64);
    const [isHoverExpanded, setIsHoverExpanded] = useState(false);
    const pathname = usePathname();
    const { canAccessSection, loading: permLoading, isAdmin } = usePermissions();
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
            const w = isExpanded ? '260px' : (isMobile ? '56px' : '64px');
            document.documentElement.style.setProperty('--sidebar-width', w);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isExpanded]);

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

    const allSections: Section[] = [
        {
            title: "Principal",
            items: [
                { icon: LayoutDashboard, label: "Dashboard", href: "/superadmin", permission: "dashboard:ver" },
                { 
                    icon: Building2, 
                    label: "Proyectos", 
                    permission: "proyectos:ver",
                    subItems: [
                        { icon: Building2, label: "Todos los Proyectos", href: "/superadmin/proyectos", permission: "proyectos:ver" },
                        { icon: FolderOpen, label: "Gestión de Lotes", href: "/superadmin/gestion-lotes/_none_", permission: "lotes:ver" },
                        { icon: FileSignature, label: "Contratos", href: "/superadmin/contratos", permission: "contratos:ver" },
                        { icon: UsersRound, label: "Asesores", href: "/superadmin/asesores", permission: "asesores:ver" },
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
                    permission: "pos:ver",
                    subItems: [
                        { icon: ShoppingCart, label: "Terminal POS", href: "/superadmin/pos", permission: "pos:ver" },
                        { icon: ShoppingBag, label: "Productos", href: "/superadmin/productos", permission: "productos:ver" },
                        { icon: Coins, label: "Clientes", href: "/superadmin/clientes", permission: "clientes:ver" },
                        { icon: Settings, label: "Ajustes del Comercio", href: "/superadmin/ajustes/comercio", permission: "ajustes:ver" },
                    ]
                },
                { 
                    icon: GraduationCap, 
                    label: "Academia",
                    permission: "cursos:ver",
                    subItems: [
                        { icon: GraduationCap, label: "Cursos", href: "/superadmin/cursos", permission: "cursos:ver" },
                        { icon: BookOpenCheck, label: "Capacitaciones", href: "/superadmin/mis-capacitaciones", permission: "capacitaciones:ver" },
                        { icon: Award, label: "Certificados", href: "/superadmin/certificados", permission: "certificados:ver" },
                    ]
                },
                { 
                    icon: TrendingUp, 
                    label: "Trading", 
                    href: "/superadmin/trading",
                    permission: "trading:ver"
                },
]
        },
        {
            title: "Contenido",
            items: [
                { 
                    icon: Layout, 
                    label: "Páginas", 
                    permission: "templates:ver",
                    subItems: [
                        { icon: Layout, label: "Todas las Páginas", href: "/superadmin/templates", permission: "templates:ver" },
                    ]
                },
                { 
                    icon: Mail, 
                    label: "Comunicación",
                    permission: "mails:ver",
                    subItems: [
                        { icon: Mail, label: "Correos", href: "/superadmin/mails", permission: "mails:ver" },
                        { icon: CalendarDays, label: "Calendarios", href: "/superadmin/calendarios", permission: "calendarios:ver" },
                        { icon: FileText, label: "Formularios", href: "/superadmin/formularios", permission: "formularios:ver" },
                        { icon: UsersRound, label: "Leads", href: "/superadmin/leads", permission: "leads:ver" },
                        { icon: Megaphone, label: "Campañas", href: "/superadmin/campanas", permission: "campanas:ver" },
                    ]
                },
                { 
                    icon: FileText, 
                    label: "Blog", 
                    permission: "blog:ver",
                    subItems: [
                        { icon: FileText, label: "Entradas", href: "/superadmin/blog", permission: "blog:ver" },
                        { icon: ImageIcon, label: "Rutas", href: "/superadmin/blog/rutas", permission: "blog:ver" },
                    ]
                },
            ]
        },
        {
            title: "Sistema",
            items: [
                { 
                    icon: Users, 
                    label: "Personal", 
                    permission: "equipo:ver",
                    subItems: [
                        { icon: Users, label: "Equipo", href: "/superadmin/usuarios", permission: "equipo:ver" },
                        { icon: UserPlus, label: "Postulantes", href: "/superadmin/postulantes", permission: "postulantes:ver" },
                         { icon: Briefcase, label: "Puestos", href: "/superadmin/postulantes/puestos", permission: "postulantes:ver" },
                         { icon: ClipboardList, label: "Preguntas", href: "/superadmin/postulantes/preguntas", permission: "postulantes:ver" },
                    ]
                },
                { icon: Wrench, label: "Utilidades", href: "/superadmin/utilidades", permission: "utilidades:ver" },
                { 
                    icon: Settings, 
                    label: "Configuración", 
                    permission: "configuracion:ver",
                    subItems: [
                        { icon: ImageIcon, label: "Sitio y Branding", href: "/superadmin/configuracion", permission: "configuracion:ver" },
                        { icon: Cloud, label: "APIs y Nube", href: "/superadmin/api-nube", permission: "api-nube:ver" },
                        { icon: Activity, label: "Métricas y SEO", href: "/superadmin/analiticas", permission: "analiticas:ver" },
                        { icon: ShoppingCart, label: "Comercio", href: "/superadmin/ajustes/comercio", permission: "ajustes:ver" },
                        { icon: Shield, label: "Roles y Niveles", href: "/superadmin/ajustes/roles", permission: "roles:ver" },
                        { icon: Building2, label: "Empresas", href: "/superadmin/ajustes/empresas", permission: "empresas:ver" },
                    ]
                },
                { icon: UserCircle, label: "Mi Perfil", href: "/superadmin/perfil", permission: "perfil:ver" },
            ]
        }
    ];

    // Filter sections based on permissions
    // Superadmin/admin see everything — skip filtering entirely
    const sections = useMemo(() => {
        if (permLoading) return allSections
        if (isAdmin) return allSections

        return allSections.map(section => ({
            ...section,
            items: section.items
                .map(item => {
                    if (item.permission) {
                        const sectionsForPerm = getSectionsFromPermission(item.permission)
                        const hasAccess = sectionsForPerm.length > 0
                            ? sectionsForPerm.some(s => canAccessSection(s))
                            : canAccessSection(item.permission)
                        if (!hasAccess) return null
                    }
                    if (item.subItems) {
                        const filteredSubItems = item.subItems.filter(sub => {
                            if (!sub.permission) return true
                            const sectionsForPerm = getSectionsFromPermission(sub.permission)
                            return sectionsForPerm.length > 0
                                ? sectionsForPerm.some(s => canAccessSection(s))
                                : canAccessSection(sub.permission)
                        })
                        if (filteredSubItems.length === 0) return null
                        return { ...item, subItems: filteredSubItems }
                    }
                    return item
                })
                .filter((item): item is NavItem => item !== null)
        })).filter(section => section.items.length > 0)
    }, [permLoading, canAccessSection, isAdmin])

    const isExpanded = !isCollapsed || isHoverExpanded;

    return (
        <>
            <motion.aside
                initial={false}
                animate={{
                    width: isExpanded ? 260 : sidebarWidth,
                }}
                onMouseEnter={() => { if (isCollapsed) setIsHoverExpanded(true) }}
                onMouseLeave={() => setIsHoverExpanded(false)}
                className="flex flex-col bg-zinc-950 border-r border-white/5 h-[calc(100vh-80px)] md:h-full fixed md:relative left-0 top-[80px] md:top-0 z-[999] overflow-hidden shadow-[15px_0_40px_rgba(0,0,0,0.8)] flex-shrink-0"
                style={{ pointerEvents: 'auto' }}
            >
                <div className={`pt-6 pb-4 px-4 flex items-center ${!isExpanded ? 'justify-center px-0' : 'justify-between'}`}>
                    <AnimatePresence mode="wait">
                        {isExpanded && (
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
                        className={`p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors ${!isExpanded ? 'hover:text-blis-red' : ''}`}
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform duration-500 ${!isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {isExpanded && (
                    <div className="px-3 pb-2">
                        <CompanySwitcher />
                    </div>
                )}

                <nav className="flex-1 px-3 space-y-6 overflow-y-auto scrollbar-hide py-4">
                    {sections.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            {isExpanded && (
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-3 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-3"
                                >
                                    {section.title}
                                </motion.h3>
                            )}
                            {!isExpanded && (
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
                                                    if (typeof window !== 'undefined' && window.innerWidth >= 768 && !isExpanded) {
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
                                                        } ${!isExpanded ? 'justify-center px-0' : ''}`}
                                                    title={!isExpanded ? typedItem.label : ""}
                                                >
                                                    <typedItem.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${hasActiveChild ? 'text-white' : 'group-hover:text-blis-red'}`} />
                                                    <AnimatePresence>
                                                        {isExpanded && (
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
                                                        {isExpanded && (
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
                                                    {expanded && isExpanded && (
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
                                                    } ${!isExpanded ? 'justify-center px-0' : ''}`}
                                            title={!isExpanded ? item.label : ""}
                                        >
                                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-blis-red'}`} />
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
                                            {isActive && isExpanded && (
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